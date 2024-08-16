//This section imports the necessary modules and defines the system prompt that instructs the AI on how to create flashcards.
import { NextResponse } from 'next/server'
//import OpenAI from 'openai'
const Groq = require('groq-sdk');

//basic
/*
const systemPrompt = `
You are a flashcard creator, you take in text and create multiple flashcards from it. Make sure to create exactly 10 flashcards.
Both front and back should be one sentence long.
You should return in the following JSON format:
{
  "flashcards":[
    {
      "front": "Front of the card",
      "back": "Back of the card"
    }
  ]
}
`
*/

//Pratik- robust
const systemPrompt = `You are a flashcard creator. Your task is to generate concise and effective flashcards based on the given topic or content. Follow these guidelines to create the flashcards:
1. Create clear and concise questions for the front of the flashcards.
2. Provide accurate and informative answers for the back of the flashcards.
3. Use simple language and make the flashcards accessible to wide range of learners.
4. Include a variety of question types, such as definitions, examples, comparision and applications.
5. When appropriate, use mnemonics, or memory aids, to help the reader remember the information.
6. Tailor the difficulty of the flashcards to the user's specified preferences.
7. If given a body of text, extract the key points and create flashcards based on them.
8. Aim to create a balance set of flashcards that cover all the key points of the topic.
9. Ensure that each flashcard focuses on a single concept or idea.
10. Avoid overly complex or ambiguous questions and answers.
11. Only generate 10 flashcards.

Remember, the goal is to facilitate effective learning and retention of information through these flashcards. Good luck!

Return in the following JSON format:
{
    "flashcards": [{
    "front": str,
    "back": str
    }]
}
`;


export async function POST(req) {
  const client = new Groq(process.env.Groq_API_KEY);

  // Extract content from the request body
  const { content } = await req.json();

  // Check if content is a string
  console.log("Request content:", content);
  console.log("Content type:", typeof content);  // This should log 'string'

  if (typeof content !== 'string') {
      return NextResponse.json({ error: "Content must be a string" }, { status: 400 });
  }

  const completion = await client.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
          {
              role: "system",
              content: systemPrompt
          },
          {
              role: "user",
              content: `Create flashcards for the topic: ${content}`
          }
      ],
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
      stop: null
  });

  console.log("Completion response:", completion.choices[0].message.content);

  let flashcards;
  try {
      // Extract the JSON part from the response using a regular expression
      const jsonResponse = completion.choices[0].message.content.match(/\{[^]*\}/)[0];

      // Parse the extracted JSON
      flashcards = JSON.parse(jsonResponse);
  } catch (error) {
      console.error("JSON parsing error:", error);
      return NextResponse.json({ error: "Invalid JSON response from Groq" }, { status: 500 });
  }

  return NextResponse.json(flashcards.flashcards);
}


//Basic: It creates a new OpenAI client instance and extracts the text data from the request body.
{/*
  export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.text()
  
    // We'll implement the OpenAI API call here
    const completion = await openai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: data },
        ],
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
      })
      // ^This code does the following:
      
      //1. It creates a chat completion request to the OpenAI API.
    //2. The `messages` array includes two elements:
   // — A ‘system’ message with our predefined `systemPrompt`, which instructs the AI on how to create flashcards.
   // — A ‘user’ message containing the input text from the request body.
    //3. We specify ‘gpt-4o’ as the model to use.
   // 4. We set the `response_format` to ‘json_object’ to ensure we receive a JSON response.
      
    
      // We'll process the API response in the next step and return the flashcards.
      // Parse the JSON response from the OpenAI API
      const flashcards = JSON.parse(completion.choices[0].message.content)

      // Return the flashcards as a JSON response
      return NextResponse.json(flashcards.flashcards)

      //In this final part: 1. We parse the JSON content from the API response using `JSON.parse()`. The response is expected to be in the format specified in our system prompt, with a `flashcards` array containing objects with `front` and `back` properties.

      //2. We return the `flashcards` array from the parsed JSON using `NextResponse.json()`. This sends the flashcards back to the client as a JSON response.   This completes the implementation of our flashcard generation API route. It takes in text from the request body, uses OpenAI’s GPT-4o model to generate flashcards based on that text, and returns the generated flashcards as a JSON response.

  */}
