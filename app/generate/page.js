//This sets up the basic structure of our generate page with a text input area and a submit button. The `useState` hooks manage the state for the input text and generated flashcards. 
'use client'

import { useState } from 'react'

//Pratik Code
import { useUser } from "@clerk/nextjs";
import {
  Typography,
  Container,
  Box,
  Paper,
  Grid,
  Card,
  TextField,
  Button,
  CardActionArea,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'


import { collection, doc, getDoc, writeBatch } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { db } from "@/firebase";

//end

export default function Generate() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [text, setText] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [flipped, setFlipped] = useState({});


  //First, let’s add a state for the flashcard set name and the dialog open state
  const [setName, setSetName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  //Next, let’s add functions to handle opening and closing the dialog
  const handleOpenDialog = () => setDialogOpen(true);
  const handleCloseDialog = () => setDialogOpen(false);

  const router = useRouter();

  //Now, let’s implement the function to save flashcards to Firebase
  const saveFlashcards = async () => {
    if (!setName.trim()) {
      alert('Please enter a name for your flashcard set.')
      return
    }
  //refactor out try catch
      const userDocRef = doc(collection(db, 'users'), user.id)
      const userDocSnap = await getDoc(userDocRef)
  
      const batch = writeBatch(db)
  
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data()
        const updatedSets = [...(userData.flashcardSets || []), { name: setName }]
        batch.update(userDocRef, { flashcardSets: updatedSets })
      } else {
        batch.set(userDocRef, { flashcardSets: [{ name: setName }] })
      }

      //Pratik Code
      /*
      if (docSnap.exists()) {
            const collections = docSnap.data().flashcards || [];
            if (collections.find((f) => f.name === name)) {
                alert("Flashcard collection with the same name already exists.");
                return;
            } else {
                collections.push({ name });
                batch.set(userDocRef, { flashcards: collections }, { merge: true });
            }
        } else {
            batch.set(userDocRef, { flashcards: [{ name }] });
        }
      */
  
      const setDocRef = doc(collection(userDocRef, 'flashcardSets'), setName)
      //Pratik Code
      flashcards.forEach((flashcard) => {
        const cardDocRef = doc(setDocRef);
        batch.set(cardDocRef, flashcard);
    });

    console.log(batch.set(setDocRef, { flashcards }) )
      batch.set(setDocRef, { flashcards }) //?
  
      await batch.commit()
  
      alert('Flashcards saved successfully!')
      handleCloseDialog()
      setSetName('')

   //use the router to push the flashcards
   router.push("/flashcards");
  }

  //This function does the following:
  /*
  1. It checks if the input text is empty and shows an alert if it is.
    2. It sends a POST request to our `/api/generate` endpoint with the input text.
    3. If the response is successful, it updates the `flashcards` state with the generated data.
    4. If an error occurs, it logs the error and shows an alert to the user.
  */
  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('Please enter some text to generate flashcards.')
      return
    }
    //refactor out try/catch for then/catch
      const response = await fetch('/api/generate', {
        method: 'POST',
        //advanced
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: text }),
        
        //body: text, //basic
      })
      //advanced 
      .then((res) => res.json())
      .then((data) => setFlashcards(data))
      .catch(console.error('Error generating flashcards:', error))
  
      if (!response.ok) {
        throw new Error('Failed to generate flashcards')
      }
      //basic
      //const data = await response.json()
      //setFlashcards(data)

      alert('An error occurred while generating flashcards. Please try again.')
    }

  //handle clicks
  const handleCardClick = (id) => {
    setFlipped((prev) => ({
        ...prev,
        [id]: !prev[id],
    }));
  };

  if (!isLoaded || !isSignedIn) {
    return <></>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Generate Flashcards
        </Typography>
        <TextField
          value={text}
          onChange={(e) => setText(e.target.value)}
          label="Enter text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          fullWidth
        >
          Generate Flashcards
        </Button>
      </Box>
      
      {/* We'll add flashcard display here */}
      {/* This code creates a grid of cards, each representing a flashcard with its front and back content. With these additions, users can now enter text, generate flashcards, and see the results displayed on the page.  */}
        {flashcards.length > 0 && (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
            Generated Flashcards
            </Typography>
            <Grid container spacing={2}>
            {flashcards.map((flashcard, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                    <CardContent>
                    <Typography variant="h6">Front:</Typography>
                    <Typography>{flashcard.front}</Typography>
                    <Typography variant="h6" sx={{ mt: 2 }}>Back:</Typography>
                    <Typography>{flashcard.back}</Typography>
                    </CardContent>
                </Card>
                </Grid>
            ))}
            </Grid>
        </Box>
        )}
        {/* save flashcards button below generated flashcards */}
        {flashcards.length > 0 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button variant="contained" color="primary" onClick={handleOpenDialog}>
            Save Flashcards
            </Button>
        </Box>
        )}
        {/* Finally, let’s add the dialog component for naming and saving the flashcard set */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Save Flashcard Set</DialogTitle>
        <DialogContent>
            <DialogContentText>
            Please enter a name for your flashcard set.
            </DialogContentText>
            <TextField
            autoFocus
            margin="dense"
            label="Set Name"
            type="text"
            fullWidth
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
            />
        </DialogContent>
        <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={saveFlashcards} color="primary">
            Save
            </Button>
        </DialogActions>
        </Dialog>
    </Container>
  )
}