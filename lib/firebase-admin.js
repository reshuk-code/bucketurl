// lib/firebase-admin.js - Server-side Firebase Admin SDK
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

function getAdminApp() {
    if (getApps().length > 0) return getApps()[0];

    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

    // Fix private key formatting issue from escaped newlines in .env
    if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }

    return initializeApp({
        credential: cert(serviceAccount),
        projectId: serviceAccount.project_id,
    });
}

const adminApp = getAdminApp();
const adminDb = getFirestore(adminApp);
const adminAuth = getAuth(adminApp);
const adminFirestore = { FieldValue };

export { adminApp, adminDb, adminAuth, adminFirestore };
