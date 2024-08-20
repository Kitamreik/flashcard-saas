//This sets up the basic structure of our generate page with a text input area and a submit button. The `useState` hooks manage the state for the input text and generated flashcards. 
'use client'

import React, { useState, useEffect } from 'react'

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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment
} from '@mui/material'

import { db } from "@/firebase";
import { collection, doc, getDoc, writeBatch, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

import CustomAppBar from "@/app/appbar";
import AccountCircle from '@mui/icons-material/AccountCircle';
import {Divider} from "@mui/joy";
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
  const handleOpen = () => setDialogOpen(true);
  const handleClose = () => setDialogOpen(false);
  
  //Loading and Auth
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
        router.push('/sign-in');
    } else if (isLoaded && isSignedIn) {
        setIsAuthenticated(true);
    }
  }, [isLoaded, isSignedIn, router]);

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
        const collections = userDocSnap.data().flashcards || [];
        if (collections.find((f) => f.setName === setName)) {
            alert("Flashcard collection with the same name already exists.");
            return;
        } else {
            collections.push({ setName });
            batch.set(userDocRef, { flashcards: collections }, { merge: true });
        }
        //code along
        //const userData = userDocSnap.data()
        //const updatedSets = [...(userData.flashcardSets || []), { name: setName }]
        //batch.update(userDocRef, { flashcardSets: updatedSets })
      } else {
        //code along
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
  
      const setDocRef = collection(userDocRef, setName)
      //Pratik Code
      flashcards.forEach((flashcard) => {
        const cardDocRef = doc(setDocRef);
        batch.set(cardDocRef, flashcard);
    });

      await batch.commit();
      handleCloseDialog();
      alert('Flashcards saved successfully!')
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
  const handleSubmit = async (content) => {
    /*
    if (!text.trim()) {
      alert('Please enter some text to generate flashcards.')
      return
    }
    */
    
    setLoading(true); //added
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        //advanced
        headers: {
          "Content-Type": "application/json"
        },
        //body: JSON.stringify({ content, contentType }),
        body: JSON.stringify({ content: text }), //inter
        
        //body: text, //basic
      })
      //intermediate - disable
      //.then((res) => res.json())
      //.then((data) => setFlashcards(data))
      //.catch(console.error('Error generating flashcards:', error)) 

      const data = await response.json()
      setFlashcards(data.flashcards)
  
      if (!response.ok) {
        console.error("Response error:", {
          status: response.status,
          statusText: response.statusText,
          body: await response.text()
      });
      throw new Error(`HTTP error! Status: ${response.status}`);
        //throw new Error('Failed to generate flashcards') //basic
      }
      //basic
      
    } catch (error) {
      alert('An error occurred while generating flashcards. Please try again.')
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
    }
  //handle clicks
  const handleCardClick = (id) => {
    setFlipped((prev) => ({
        ...prev,
        [id]: !prev[id],
    }));
  };

  //Pratik code
  if (!isAuthenticated) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>            
    );
  }

  return (
    <> <CustomAppBar />
        <Container maxWidth="md">
            <Box
                sx={{
                    mt: 4,
                    mb: 6,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                }}
            >
                <Typography variant="h4" sx={{ mb: 4 }}>Generate FlashCards</Typography>
                <TextField
                    id="input-with-icon-textfield"
                    label="Type in to generate Flashcards"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <AccountCircle />
                            </InputAdornment>
                        ),
                    }}
                    variant="standard"
                />
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 3 }}
                    onClick={handleSubmit}
                >
                    Submit
                </Button>
            </Box>
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                flashcards.length > 0 && (
                    <Box sx={{ mt: 4, mb: 4 }}>
                        <Typography variant="h5" gutterBottom align="center">
                            Flashcards Preview
                        </Typography>
                        <Grid container spacing={3}>
                            {flashcards.map((flashcard, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card>
                                        <CardActionArea onClick={() => handleCardClick(index)}>
                                            <CardContent sx={{margin:0, padding:0}}>
                                                <Box
                                                    sx={{
                                                        perspective: "1000px",
                                                        "& > div": {
                                                            transition: "transform 0.6s",
                                                            transformStyle: "preserve-3d",
                                                            position: "relative",
                                                            width: "100%",
                                                            height: "200px",
                                                            background: "linear-gradient(#F9EFAF, #F7E98D)",
                                                            transform: flipped[index] ? "rotateY(180deg)" : "rotateY(0deg)",
                                                        },
                                                        "& > div > div": {
                                                            position: "absolute",
                                                            width: "100%",
                                                            height: "200px",
                                                            backfaceVisibility: "hidden",
                                                            display: "flex",
                                                            justifyContent: "center",
                                                            alignItems: "center",
                                                            padding: 2,
                                                            boxSizing: "border-box",
                                                        },
                                                        "& > div > div:nth-of-type(1)": {
                                                            visibility: flipped[index] ? "hidden" : "visible",
                                                        },
                                                        "& > div > div:nth-of-type(2)": {
                                                            transform: "rotateY(180deg)",
                                                            visibility: flipped[index] ? "visible" : "hidden",
                                                        },
                                                    }}
                                                >
                                                    <div>
                                                        <div>
                                                            <Typography variant="h5" component="div" sx={{ fontFamily: 'Gloria Hallelujah, cursive', fontSize: "1.3rem", padding: "10px" }}>
                                                                {flashcard.front}
                                                            </Typography>
                                                        </div>
                                                        <div>
                                                            <Typography variant="h5" component="div" sx={{ fontFamily: 'Gloria Hallelujah, cursive', fontSize: "1.0rem" }}>
                                                                {flashcard.back}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </Box>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                        <Box sx={{ mt: 4, mb:4, display: "flex", justifyContent: "center" }}>
                            <Button variant="contained" sx={{ backgroundColor: '#1565c0' }} onClick={handleOpen}>
                                Save
                            </Button>
                        </Box>
                    </Box>
                )
            )}
            <Dialog open={dialogOpen} onClose={handleClose}>
                <DialogTitle>Save Flashcards</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Please enter a name for your flashcards collection
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Collection Name"
                        type="text"
                        fullWidth
                        value={setName}
                        onChange={(e) => setSetName(e.target.value)}
                        variant="outlined"
                    ></TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={saveFlashcards}>Save</Button>
                </DialogActions>
            </Dialog>
        </Container>
    </>
);
  
}

//code along
{/*
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
    
    // We'll add flashcard display here 
    //This code creates a grid of cards, each representing a flashcard with its front and back content. With these additions, users can now enter text, generate flashcards, and see the results displayed on the page.  
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
      //save flashcards button below generated flashcards 
      {flashcards.length > 0 && (
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" color="primary" onClick={handleOpenDialog}>
          Save Flashcards
          </Button>
      </Box>
      )}
      //Finally, let’s add the dialog component for naming and saving the flashcard set 
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
*/}
