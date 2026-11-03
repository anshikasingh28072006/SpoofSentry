import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';

// Standard fallback if config file is loaded dynamically
let appInstance: any = null;
let authInstance: any = null;
let providerInstance: GoogleAuthProvider | null = null;
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export async function getFirebaseApp() {
  if (appInstance) return appInstance;

  const apps = getApps();
  if (apps.length > 0) {
    appInstance = apps[0];
    authInstance = getAuth(appInstance);
    return appInstance;
  }

  // Fetch from server /api/config
  let config: any = null;
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      config = data.firebaseConfig;
    }
  } catch (e) {
    console.warn('Failed to load /api/config', e);
  }

  if (!config) {
    // Hardcoded fallback matching firebase-applet-config.json
    config = {
      projectId: "gen-lang-client-0209555847",
      appId: "1:920586400525:web:eb19609034f792a132b644",
      apiKey: "AIzaSyDao0Bd_vdyfO5dhbbQjEewOUhrLUwLCao",
      authDomain: "gen-lang-client-0209555847.firebaseapp.com",
      storageBucket: "gen-lang-client-0209555847.firebasestorage.app",
      messagingSenderId: "920586400525",
      oAuthClientId: "920586400525-i6mfndl1u2e4vjv3qn8gsk6mmrrp2vnb.apps.googleusercontent.com"
    };
  }

  appInstance = initializeApp(config);
  authInstance = getAuth(appInstance);
  return appInstance;
}

export async function getFirebaseAuth() {
  if (!authInstance) {
    await getFirebaseApp();
  }
  return authInstance;
}

export function getGoogleProvider() {
  if (!providerInstance) {
    providerInstance = new GoogleAuthProvider();
    providerInstance.addScope('https://www.googleapis.com/auth/gmail.readonly');
    providerInstance.setCustomParameters({
      prompt: 'consent'
    });
  }
  return providerInstance;
}

export const initAuthListener = async (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  const auth = await getFirebaseAuth();
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const auth = await getFirebaseAuth();
    const provider = getGoogleProvider();

    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    
    if (!credential?.accessToken) {
      throw new Error('Google did not return an OAuth access token. Please check permissions.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    const isUserDismissal =
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.message?.includes('popup-closed-by-user') ||
      error?.message?.includes('cancelled-popup-request');

    if (isUserDismissal) {
      // User closed or dismissed the popup. This is an expected user interaction, NOT a fatal system error.
      console.info('Google sign-in popup was dismissed by user.');
      return null;
    }

    console.error('Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const signOutGoogle = async (): Promise<void> => {
  const auth = await getFirebaseAuth();
  await signOut(auth);
  cachedAccessToken = null;
};

// -------------------------------------------------------------
// Gmail API Client Functions
// -------------------------------------------------------------

function decodeBase64Url(input: string): string {
  try {
    const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return '';
  }
}

function extractBodyFromPayload(payload: any): string {
  if (!payload) return '';
  if (payload.body?.data) {
    const text = decodeBase64Url(payload.body.data);
    if (text) return text;
  }
  if (payload.parts && Array.isArray(payload.parts)) {
    // 1. Look for text/plain
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return decodeBase64Url(part.body.data);
      }
    }
    // 2. Look for text/html
    for (const part of payload.parts) {
      if (part.body?.data) {
        const decoded = decodeBase64Url(part.body.data);
        return decoded.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
      if (part.parts) {
        const nested = extractBodyFromPayload(part);
        if (nested) return nested;
      }
    }
  }
  return '';
}

export interface ParsedGmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: string;
  returnPath: string;
  dkimHeader: string;
  snippet: string;
  body: string;
}

export interface GmailInboxResult {
  messages: ParsedGmailMessage[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
}

export async function fetchLiveGmailInbox(
  accessToken: string,
  maxResults = 15,
  query = 'in:inbox',
  pageToken?: string
): Promise<GmailInboxResult> {
  const pageParam = pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : '';
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=${encodeURIComponent(query)}${pageParam}`;
  const listRes = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (!listRes.ok) {
    const err = await listRes.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch messages (${listRes.status})`);
  }

  const listData = await listRes.json();
  const rawMessages = listData.messages || [];

  if (rawMessages.length === 0) {
    return {
      messages: [],
      nextPageToken: undefined,
      resultSizeEstimate: listData.resultSizeEstimate || 0
    };
  }

  // Fetch full details for the retrieved messages in parallel
  const details = await Promise.all(
    rawMessages.map(async (m: { id: string; threadId: string }) => {
      try {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (!msgRes.ok) return null;
        const msgData = await msgRes.json();
        const headers = msgData.payload?.headers || [];

        const getHeader = (name: string) => {
          const h = headers.find((item: any) => item.name?.toLowerCase() === name.toLowerCase());
          return h ? h.value : '';
        };

        const from = getHeader('From');
        const to = getHeader('To');
        const subject = getHeader('Subject') || '(No Subject)';
        const date = getHeader('Date');
        const returnPath = getHeader('Return-Path');
        const dkimHeader = getHeader('DKIM-Signature');
        const snippet = msgData.snippet || '';
        const body = extractBodyFromPayload(msgData.payload) || snippet;

        return {
          id: m.id,
          threadId: m.threadId,
          from,
          to,
          subject,
          date,
          returnPath,
          dkimHeader,
          snippet,
          body
        } as ParsedGmailMessage;
      } catch {
        return null;
      }
    })
  );

  return {
    messages: details.filter((m): m is ParsedGmailMessage => m !== null),
    nextPageToken: listData.nextPageToken,
    resultSizeEstimate: listData.resultSizeEstimate
  };
}
