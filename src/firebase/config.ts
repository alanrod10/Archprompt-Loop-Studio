import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as fbSignOut, User } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  PromptItem, 
  PromptVersion, 
  TechniqueItem, 
  InvestigationItem, 
  EvaluationItem, 
  EngineVersionItem, 
  EngineProposalItem, 
  UserSettingsItem 
} from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline / configuration notice:', error.message);
      return false;
    }
    // Any other error (like permission denied on test doc) confirms the client reached Firestore!
    return true;
  }
}

// ----------------- FIRESTORE DATA WRAPPERS -----------------

export async function getPromptsFromDb(userId: string): Promise<PromptItem[]> {
  try {
    const q = query(collection(db, 'prompts'), where('ownerId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PromptItem));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'prompts');
  }
}

export async function savePromptToDb(prompt: PromptItem): Promise<void> {
  try {
    await setDoc(doc(db, 'prompts', prompt.id), prompt);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `prompts/${prompt.id}`);
  }
}

export async function deletePromptFromDb(promptId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'prompts', promptId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `prompts/${promptId}`);
  }
}

export async function savePromptVersionToDb(version: PromptVersion): Promise<void> {
  try {
    await setDoc(doc(db, 'prompt_versions', version.id), version);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `prompt_versions/${version.id}`);
  }
}

export async function getPromptVersionsFromDb(promptId: string, userId: string): Promise<PromptVersion[]> {
  try {
    const q = query(
      collection(db, 'prompt_versions'),
      where('promptId', '==', promptId),
      where('ownerId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PromptVersion));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'prompt_versions');
  }
}

export async function getTechniquesFromDb(userId: string): Promise<TechniqueItem[]> {
  try {
    const q = query(collection(db, 'techniques'), where('ownerId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TechniqueItem));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'techniques');
  }
}

export async function saveTechniqueToDb(technique: TechniqueItem): Promise<void> {
  try {
    await setDoc(doc(db, 'techniques', technique.id), technique);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `techniques/${technique.id}`);
  }
}

export async function getInvestigationsFromDb(userId: string): Promise<InvestigationItem[]> {
  try {
    const q = query(collection(db, 'investigations'), where('ownerId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as InvestigationItem));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'investigations');
  }
}

export async function saveInvestigationToDb(item: InvestigationItem): Promise<void> {
  try {
    await setDoc(doc(db, 'investigations', item.id), item);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `investigations/${item.id}`);
  }
}

export async function getEvaluationsFromDb(userId: string): Promise<EvaluationItem[]> {
  try {
    const q = query(collection(db, 'evaluations'), where('ownerId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EvaluationItem));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'evaluations');
  }
}

export async function saveEvaluationToDb(item: EvaluationItem): Promise<void> {
  try {
    await setDoc(doc(db, 'evaluations', item.id), item);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `evaluations/${item.id}`);
  }
}

export async function getEngineVersionsFromDb(userId: string): Promise<EngineVersionItem[]> {
  try {
    const q = query(collection(db, 'engine_versions'), where('ownerId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EngineVersionItem));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'engine_versions');
  }
}

export async function saveEngineVersionToDb(item: EngineVersionItem): Promise<void> {
  try {
    await setDoc(doc(db, 'engine_versions', item.id), item);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `engine_versions/${item.id}`);
  }
}

export async function getEngineProposalsFromDb(userId: string): Promise<EngineProposalItem[]> {
  try {
    const q = query(collection(db, 'engine_proposals'), where('ownerId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as EngineProposalItem));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, 'engine_proposals');
  }
}

export async function saveEngineProposalToDb(item: EngineProposalItem): Promise<void> {
  try {
    await setDoc(doc(db, 'engine_proposals', item.id), item);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `engine_proposals/${item.id}`);
  }
}
