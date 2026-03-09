import { collection, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import type { Technique, UserProfile, JournalEntry } from '../types';

export const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
};

export const deleteImage = async (url: string): Promise<void> => {
    try {
        // Extract the path from the download URL
        // Firebase storage URLs look like: https://firebasestorage.googleapis.com/v0/b/bucket-name/o/path%2Fto%2Ffile?alt=media...
        const decodedUrl = decodeURIComponent(url);
        const startIndex = decodedUrl.indexOf('/o/') + 3;
        const endIndex = decodedUrl.indexOf('?');

        if (startIndex > 2 && endIndex > startIndex) {
            const filePath = decodedUrl.substring(startIndex, endIndex);
            const storageRef = ref(storage, filePath);
            await deleteObject(storageRef);
        }
    } catch (error) {
        console.error("Error deleting image from storage:", error);
        // We don't necessarily want this to block technique deletion if the image is already gone
    }
};

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

export const createTechnique = async (technique: Omit<Technique, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, 'techniques'), technique);
    return docRef.id;
};

export const updateTechnique = async (id: string, data: Partial<Technique>): Promise<void> => {
    const docRef = doc(db, 'techniques', id);
    await updateDoc(docRef, data);
};

export const deleteTechnique = async (id: string): Promise<void> => {
    // 1. Fetch the technique first to get image URLs
    const tech = await getTechniqueById(id);

    // 2. Delete the document from Firestore
    const docRef = doc(db, 'techniques', id);
    await deleteDoc(docRef);

    // 3. Delete associated images from Storage
    if (tech && tech.images && tech.images.length > 0) {
        for (const url of tech.images) {
            if (url.includes('firebasestorage')) {
                await deleteImage(url);
            }
        }
    }
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
