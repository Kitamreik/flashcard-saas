//The flashcards page (`app/flashcards/page.js`) is responsible for fetching and displaying all of the user’s saved flashcard sets.

//This component uses Clerk’s `useUser` hook for authentication, React’s `useState` for managing the flashcards state, and Next.js’s `useRouter` for navigation.
export default function Flashcard() {
    const { isLoaded, isSignedIn, user } = useUser()
    const [flashcards, setFlashcards] = useState([])
    const router = useRouter()

    //component setup - search: This component uses Clerk’s `useUser` hook for authentication, React’s `useState` for managing the flashcards and their flip states, and Next.js’s `useSearchParams` to get the flashcard set ID from the URL.
    const searchParams = useSearchParams()
    const search = searchParams.get('id')

    //navigation - This function uses Next.js’s `router.push` to navigate to the `/flashcard` page with the selected flashcard set’s ID as a query parameter.
    //Flippin' Flashcards
    const handleCardClick = (id) => {
      setFlipped((prev) => ({
        ...prev,
        [id]: !prev[id],
      }))
      router.push(`/flashcard?id=${id}`)
    }
  
    //The component uses a `useEffect` hook to fetch the user’s flashcard sets when the component mounts or when the user changes. This function retrieves the user’s document from Firestore and sets the `flashcards` state with the user’s flashcard collections. If the user document doesn’t exist, it creates one with an empty flashcards array.

    useEffect(() => {
        async function getFlashcards() {
          if (!user) return
          const docRef = doc(collection(db, 'users'), user.id)
          const docSnap = await getDoc(docRef)
          if (docSnap.exists()) {
            const collections = docSnap.data().flashcards || []
            setFlashcards(collections)
          } else {
            await setDoc(docRef, { flashcards: [] })
          }
        }
        getFlashcards()
      }, [user])

      //The component uses a `useEffect` hook to fetch the specific flashcard set when the component mounts or when the user or search parameter changes:
      useEffect(() => {
        async function getFlashcard() {
          if (!search || !user) return
      
          const colRef = collection(doc(collection(db, 'users'), user.id), search)
          const docs = await getDocs(colRef)
          const flashcards = []
          docs.forEach((doc) => {
            flashcards.push({ id: doc.id, ...doc.data() })
          })
          setFlashcards(flashcards)
        }
        getFlashcard()
      }, [search, user])
      //This function retrieves all flashcards in the specified set from Firestore and updates the `flashcards` state.

    //render a grid of cards - basic
    /*
    return (
        <Container maxWidth="md">
          <Grid container spacing={3} sx={{ mt: 4 }}>
            {flashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardActionArea onClick={() => handleCardClick(flashcard.name)}>
                    <CardContent>
                      <Typography variant="h5" component="div">
                        {flashcard.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      )
    */
    //advanced- Each flashcard is displayed as a card that flips when clicked, revealing the back of the card. The flip animation is achieved using CSS transforms and transitions. This individual flashcard set view provides an interactive way for users to study their flashcards. Users can flip cards to reveal answers and test their knowledge.
      return (
        <Container maxWidth="md">
          <Grid container spacing={3} sx={{ mt: 4 }}>
            {flashcards.map((flashcard) => (
              <Grid item xs={12} sm={6} md={4} key={flashcard.id}>
                <Card>
                  <CardActionArea onClick={() => handleCardClick(flashcard.id)}>
                    <CardContent>
                      <Box sx={{ /* Styling for flip animation */ }}>
                        <div>
                          <div>
                            <Typography variant="h5" component="div">
                              {flashcard.front}
                            </Typography>
                          </div>
                          <div>
                            <Typography variant="h5" component="div">
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
        </Container>
      )
  }