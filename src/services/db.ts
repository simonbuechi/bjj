import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Technique, UserProfile, JournalEntry } from '../types';

// Techniques
export const getTechniques = async (): Promise<Technique[]> => {
    const querySnapshot = await getDocs(collection(db, 'techniques'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Technique));
};

export const getTechniqueById = async (id: string): Promise<Technique | null> => {
    const docRef = doc(db, 'techniques', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Technique;
    }
    return null;
};

// User Profiles
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { uid: docSnap.id, ...docSnap.data() } as UserProfile;
    }
    return null;
};

export const createUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>): Promise<void> => {
    await updateDoc(doc(db, 'users', uid), data);
};

// Journal Entries
export const getJournalEntries = async (userId: string): Promise<JournalEntry[]> => {
    const entriesRef = collection(db, 'users', userId, 'journal');
    const q = query(entriesRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry));
};

export const createJournalEntry = async (userId: string, entry: Omit<JournalEntry, 'id' | 'userId'>): Promise<string> => {
    const entriesRef = collection(db, 'users', userId, 'journal');
    const docRef = await addDoc(entriesRef, { ...entry, userId });
    return docRef.id;
};

export const updateJournalEntry = async (userId: string, entryId: string, data: Partial<JournalEntry>): Promise<void> => {
    const entryRef = doc(db, 'users', userId, 'journal', entryId);
    await updateDoc(entryRef, data);
};

export const deleteJournalEntry = async (userId: string, entryId: string): Promise<void> => {
    const entryRef = doc(db, 'users', userId, 'journal', entryId);
    await deleteDoc(entryRef);
};
