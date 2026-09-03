# RedCat

RedCat is a creator and brand collaboration dashboard. It includes authentication, creator profiles, campaign tracking, hiring tools, Firestore-backed data, and a brand chatbot.

## Prerequisites

- Node.js 18 or newer
- A Firebase project with Authentication and Firestore enabled
- A Gemini API key if you want to use live chatbot responses

## Local Setup

1. Install the dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root with your Firebase configuration. Use your own local values in place of these placeholders:

   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIRESTORE_DATABASE_ID=(default)
   GEMINI_API_KEY=your_gemini_api_key
   ```

   The Firebase variables are required for the app to connect to Firebase. `GEMINI_API_KEY` is optional; without it, the chatbot runs in simulation mode.

   `.env` is ignored by Git and should never be committed. Do not put real keys or credentials in the README or in source control.

3. Start the development server:

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000` in your browser.

## Other Commands

```bash
npm run build   # Build the frontend and server
npm start       # Run the production build
npm run lint    # Run the TypeScript check
```

## Tech Stack

- React and TypeScript
- Vite
- Express and tsx
- Firebase Authentication and Cloud Firestore
- Tailwind CSS
- Motion and Lucide React
- Google GenAI for the optional chatbot integration

## License

No license has been added to this project yet.
