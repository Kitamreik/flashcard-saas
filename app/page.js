import styles from "./page.module.css";

//Stripe integration- handles the Stripe checkout process when a user selects the Pro plan.
const handleSubmit = async () => {
  const checkoutSession = await fetch('/api/checkout_sessions', {
    method: 'POST',
    headers: { origin: 'http://localhost:3000' },
  })
  const checkoutSessionJson = await checkoutSession.json()

  const stripe = await getStripe()
  const {error} = await stripe.redirectToCheckout({
    sessionId: checkoutSessionJson.id,
  })

  if (error) {
    console.warn(error.message)
  }
}

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.description}>
        {/* header and nav- This section creates a navigation bar with the app title and authentication buttons. It uses Clerk’s `SignedIn` and `SignedOut` components to conditionally render login/signup buttons or the user menu. */}
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" style={{flexGrow: 1}}>
              Flashcard SaaS
            </Typography>
            <SignedOut>
              <Button color="inherit" href="/sign-in">Login</Button>
              <Button color="inherit" href="/sign-up">Sign Up</Button>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </Toolbar>
        </AppBar>
        {/* hero section: This section introduces the application with a headline, subheadline, and call-to-action buttons. */}
        <Box sx={{textAlign: 'center', my: 4}}>
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to Flashcard SaaS
          </Typography>
          <Typography variant="h5" component="h2" gutterBottom>
            The easiest way to create flashcards from your text.
          </Typography>
          <Button variant="contained" color="primary" sx={{mt: 2, mr: 2}} href="/generate">
            Get Started
          </Button>
          <Button variant="outlined" color="primary" sx={{mt: 2}}>
            Learn More
          </Button>
        </Box>
        {/* features */}
        <Box sx={{my: 6}}>
          <Typography variant="h4" component="h2" gutterBottom>Features</Typography>
          <Grid container spacing={4}>
            {/* Feature items */}
          </Grid>
        </Box>
        {/* pricing */}
        <Box sx={{my: 6, textAlign: 'center'}}>
          <Typography variant="h4" component="h2" gutterBottom>Pricing</Typography>
          <Grid container spacing={4} justifyContent="center">
            {/* Pricing plans */}
          </Grid>
        </Box>
        {/*  */}
        

      </div>
    </main>
  );
}
