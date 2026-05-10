import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function parsePrivateKey(key: string | undefined): string {
  if (!key) {
    throw new Error("FIREBASE_PRIVATE_KEY is not set in .env");
  }

  // Remove surrounding quotes if present (some .env parsers leave them)
  let cleaned = key;
  if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
    cleaned = cleaned.slice(1, -1);
  }
  if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
    cleaned = cleaned.slice(1, -1);
  }

  // Replace literal \n strings with actual newlines
  cleaned = cleaned.replace(/\\n/g, "\n");

  return cleaned;
}

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const privateKey = parsePrivateKey(import.meta.env.FIREBASE_PRIVATE_KEY);

  const serviceAccount: ServiceAccount = {
    projectId: import.meta.env.FIREBASE_PROJECT_ID,
    clientEmail: import.meta.env.FIREBASE_CLIENT_EMAIL,
    privateKey,
  };

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

const adminApp = getAdminApp();

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
export default adminApp;
