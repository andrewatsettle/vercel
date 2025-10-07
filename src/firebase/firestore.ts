import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc, getDoc, query, orderBy } from "firebase/firestore";
import { firestore } from "./firebase";
import { ExerciseItem } from "@/components/exercise/ExerciseForm";

type Exercise = ExerciseItem;

export const addEmptyExercise = async (): Promise<string> => {
  try {
    const docRef = await addDoc(collection(firestore, 'exercises'), {})
    return docRef.id;
  } catch (error) {
    throw error;
  }
}

export const addExercise = async (id: string, data: Exercise): Promise<void> => {
  try {
    const exerciseRef = doc(firestore, 'exercises', id);
    await updateDoc(exerciseRef, {...data, createdAt: new Date()});
  } catch (error) {
    throw error;
  }
}

export const getExercises = async (): Promise<Exercise[]> => {
  try {
    const queryRef = query(collection(firestore, "exercises"), orderBy('createdAt', 'desc'));
    const res = await getDocs(queryRef);
  
    if (res.empty) {
      return [];
    }
  
    return res.docs.map(doc => ({...doc.data(), id: doc.id})) as Exercise[];
  } catch (error) {
    throw error;
  }
}

export const getExercise = async (id: string): Promise<Exercise | null> => {
  try {
    const exerciseRef = doc(firestore, 'exercises', id);
    const exerciseSnap = await getDoc(exerciseRef);
  
    if (!exerciseSnap.exists()) {
      return null;
    }
  
    return { ...exerciseSnap.data(), id: exerciseSnap.id } as Exercise;
  } catch (error) {
    throw error;
  }
}

export const editExercise = async (id: string, data: Partial<Exercise>): Promise<void> => {
  try {
    const exerciseRef = doc(firestore, 'exercises', id);
    await updateDoc(exerciseRef, data);
  } catch (error) {
    throw error;
  }
}

export const deleteExercise = async (id: string) => {
  try {
    await deleteDoc(doc(firestore, 'exercises', id))
  } catch (error) {
    throw error;
  }
}

export const addTag = async (name: string): Promise<void> => {
  try {
    await addDoc(collection(firestore, "tags"), { name, createdAt: new Date() });
  } catch (error) {
    throw error;
  }
}

export const editTag = async (id: string, name: string): Promise<void> => {
  try {
    const tagRef = doc(firestore, 'tags', id);
    await updateDoc(tagRef, { name });
  } catch (error) {
    throw error;
  }
}

export const getTags = async (): Promise<{ id: string; name: string }[]> => {
  try {
    const queryRef = query(collection(firestore, "tags"), orderBy('createdAt', 'desc'));
    const res = await getDocs(queryRef);
  
    if (res.empty) {
      return [];
    }
  
    return res.docs.map(doc => ({ ...doc.data(), id: doc.id })) as { id: string; name: string }[];
  } catch (error) {
    throw error;
  }
}

export const deleteTag = async (id: string) => {
  try {
    await deleteDoc(doc(firestore, 'tags', id))
  } catch (error) {
    throw error;
  }
}

export const addCategory = async (label: string): Promise<void> => {
  try {
    await addDoc(collection(firestore, "categories"), { label, createdAt: new Date() });
  } catch (error) {
    throw error;
  }
}

export const editCategory = async (id: string, label: string): Promise<void> => {
  try {
    const tagRef = doc(firestore, 'categories', id);
    await updateDoc(tagRef, { label });
  } catch (error) {
    throw error;
  }
}

export const getCategories = async (): Promise<{ id: string; label: string }[]> => {
  try {
    const queryRef = query(collection(firestore, "categories"), orderBy('createdAt', 'desc'));
    const res = await getDocs(queryRef);
  
    if (res.empty) {
      return [];
    }
  
    return res.docs.map(doc => ({ ...doc.data(), id: doc.id })) as { id: string; label: string }[];
  } catch (error) {
    throw error;
  }
}

export const deleteCategory = async (id: string) => {
  try {
    await deleteDoc(doc(firestore, 'categories', id))
  } catch (error) {
    throw error;
  }
}

type StatisticsItem = {
  completions: number
  favorites: number
  starts: number
  views: number
  id?: string;
}

//statistics
export const getStats = async (): Promise<StatisticsItem[]> => {
  try {
    const queryRef = query(collection(firestore, "statistics"));
    const res = await getDocs(queryRef);
  
    if (res.empty) {
      return [];
    }
  
    return res.docs.map(doc => ({...doc.data(), id: doc.id})) as StatisticsItem[];
  } catch (error) {
    throw error;
  }
}