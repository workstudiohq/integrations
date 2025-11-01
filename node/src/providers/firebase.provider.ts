import { initializeApp, FirebaseApp, getApps } from "firebase/app";
import {
    getFirestore,
    Firestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    collection,
    addDoc,
    getDocs,
} from "firebase/firestore";
import {
    getAuth,
    Auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    deleteUser,
    onAuthStateChanged,
} from "firebase/auth";
import {
    getStorage,
    FirebaseStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";
import {
    getDatabase,
    Database,
    ref as dbRef,
    set as dbSet,
    get as dbGet,
    remove as dbRemove,
} from "firebase/database";
import { getMessaging, Messaging, getToken, onMessage } from "firebase/messaging";

/**
 * Configuration structure for Firebase Provider
 */
interface RequiredConfigItem {
    key: string;
    dataType: string;
}

export interface FirebaseIntegrationOptions {
    projectId: string;
    apiKey: string;
    clientEmail?: string;
    privateKey?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    requiredConfig?: RequiredConfigItem[];
}

class FirebaseProvider {
    version = "1.0.0";
    icon: string =
        "https://cdn.brandfetch.io/idS725vGg6/w/400/h/400/theme/dark/icon.png?c=1bxid64Mup7aczewSAYMX&t=1760226348459";
    app: FirebaseApp;
    firestore: Firestore;
    auth: Auth;
    storage: FirebaseStorage;
    database: Database;
    messaging?: Messaging;
    public options: FirebaseIntegrationOptions;

    /**
     * Constructor for FirebaseProvider
     * @param options - The Firebase integration configuration
     * 
     * @returns FirebaseProvider instance
     * 
     * @category Providers
     * @homepage https://firebase.google.com
     * @doc https://firebase.google.com/docs
     */
    constructor(options: FirebaseIntegrationOptions) {
        this.options = options;

        const firebaseConfig = {
            apiKey: options.apiKey,
            projectId: options.projectId,
            storageBucket: options.storageBucket,
            messagingSenderId: options.messagingSenderId,
        };

        // Prevent duplicate initialization
        this.app =
            getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

        this.firestore = getFirestore(this.app);
        this.auth = getAuth(this.app);
        this.storage = getStorage(this.app);
        this.database = getDatabase(this.app);

        try {
            this.messaging = getMessaging(this.app);
        } catch {
            console.warn("Firebase Messaging not supported in this environment.");
        }
    }

    // ============ 🔥 FIRESTORE METHODS ============
    async addDocument(collectionName: string, data: object) {
        const docRef = await addDoc(collection(this.firestore, collectionName), data);
        return { id: docRef.id, ...data };
    }

    async getDocument(collectionName: string, docId: string) {
        const docSnap = await getDoc(doc(this.firestore, collectionName, docId));
        return docSnap.exists() ? docSnap.data() : null;
    }

    async updateDocument(collectionName: string, docId: string, data: object) {
        const docRef = doc(this.firestore, collectionName, docId);
        await updateDoc(docRef, data);
        return { id: docId, ...data };
    }

    async deleteDocument(collectionName: string, docId: string) {
        await deleteDoc(doc(this.firestore, collectionName, docId));
        return true;
    }

    async listDocuments(collectionName: string) {
        const snapshot = await getDocs(collection(this.firestore, collectionName));
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    // ============ 🔑 AUTH METHODS ============
    async createUser(email: string, password: string, displayName?: string) {
        const userCred = await createUserWithEmailAndPassword(this.auth, email, password);
        if (displayName) await updateDoc(doc(this.firestore, "users", userCred.user.uid), { displayName });
        return userCred.user;
    }

    async loginUser(email: string, password: string) {
        const userCred = await signInWithEmailAndPassword(this.auth, email, password);
        return userCred.user;
    }

    async deleteUserAccount() {
        if (this.auth.currentUser) {
            await deleteUser(this.auth.currentUser);
            return true;
        }
        throw new Error("No user currently signed in.");
    }

    // ============ ☁️ STORAGE METHODS ============
    async uploadFile(filePath: string, fileContent: Blob | Uint8Array | ArrayBuffer) {
        const storageRef = ref(this.storage, filePath);

        const snapshot = await uploadBytes(storageRef, fileContent);
        const url = await getDownloadURL(snapshot.ref);

        return { path: filePath, url };
    }

    async getFileUrl(filePath: string) {
        const storageRef = ref(this.storage, filePath);
        return await getDownloadURL(storageRef);
    }

    async deleteFile(filePath: string) {
        const storageRef = ref(this.storage, filePath);
        await deleteObject(storageRef);
        return true;
    }

    // ============ 💽 REALTIME DB METHODS ============
    async setRealtimeData(path: string, data: object) {
        await dbSet(dbRef(this.database, path), data);
        return true;
    }

    async getRealtimeData(path: string) {
        const snapshot = await dbGet(dbRef(this.database, path));
        return snapshot.exists() ? snapshot.val() : null;
    }

    async deleteRealtimeData(path: string) {
        await dbRemove(dbRef(this.database, path));
        return true;
    }

    // ============ 🔔 CLOUD MESSAGING METHODS ============
    async getMessagingToken(vapidKey?: string) {
        if (!this.messaging) throw new Error("Messaging not initialized.");
        return await getToken(this.messaging, { vapidKey });
    }

    onMessage(callback: (payload: any) => void) {
        if (!this.messaging) throw new Error("Messaging not initialized.");
        onMessage(this.messaging, callback);
    }
}

export default FirebaseProvider;
