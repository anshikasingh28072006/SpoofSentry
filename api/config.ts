export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const firebaseConfig = {
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0209555847",
    appId: process.env.VITE_FIREBASE_APP_ID || "1:920586400525:web:eb19609034f792a132b644",
    apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyDao0Bd_vdyfO5dhbbQjEewOUhrLUwLCao",
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0209555847.firebaseapp.com",
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0209555847.firebasestorage.app",
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "920586400525",
    oAuthClientId: process.env.VITE_FIREBASE_OAUTH_CLIENT_ID || "920586400525-i6mfndl1u2e4vjv3qn8gsk6mmrrp2vnb.apps.googleusercontent.com"
  };

  const googleClientId = process.env.GOOGLE_CLIENT_ID || firebaseConfig.oAuthClientId;

  res.status(200).json({
    googleClientId,
    firebaseConfig,
    hasGmailConfig: Boolean(googleClientId)
  });
}
