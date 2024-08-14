//This sets up the basic structure of our generate page with a text input area and a submit button. The `useState` hooks manage the state for the input text and generated flashcards.
'use client'

import { useState } from 'react'
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material'

export default function Generate() {
  const [text, setText] = useState('')
  const [flashcards, setFlashcards] = useState([])

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
  
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: text,
      })
  
      if (!response.ok) {
        throw new Error('Failed to generate flashcards')
      }
  
      const data = await response.json()
      setFlashcards(data)
    } catch (error) {
      console.error('Error generating flashcards:', error)
      alert('An error occurred while generating flashcards. Please try again.')
    }
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
    </Container>
  )
}