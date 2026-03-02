'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile,
    sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);

            // Set/clear session cookie for middleware
            if (firebaseUser) {
                const token = await firebaseUser.getIdToken();
                await fetch('/api/auth/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });
            } else {
                await fetch('/api/auth/session', { method: 'DELETE' });
            }
        });
        return () => unsubscribe();
    }, []);

    const signIn = useCallback(async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    }, []);

    const signUp = useCallback(async (email, password, displayName) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
            await updateProfile(result.user, { displayName });
        }
        // Create user doc in Firestore
        await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uid: result.user.uid,
                email,
                displayName: displayName || email.split('@')[0],
            }),
        });
        return result.user;
    }, []);

    const signInWithGoogle = useCallback(async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        // Upsert user doc
        await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL,
            }),
        });
        return result.user;
    }, []);

    const signOut = useCallback(async () => {
        await firebaseSignOut(auth);
    }, []);

    const resetPassword = useCallback(async (email) => {
        await sendPasswordResetEmail(auth, email);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
