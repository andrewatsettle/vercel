import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { firestore } from "./firebase";

export const addExercise = async (data: any): Promise<void> => {
  await addDoc(collection(firestore, "exercises"), data);
}

interface Exercise {
  category: string
  fullDescription: string
  id: string
  name: string
  summDescription: string
  tags: string[]
  mediaType?: string
}

export const getExercises = async (): Promise<Exercise[]> => {
  const res = await getDocs(collection(firestore, "exercises"));

  if (res.empty) {
    return [];
  }

  return res.docs.map(doc => ({...doc.data(), id: doc.id})) as Exercise[];
}

export const getExercise = async (id: string): Promise<Exercise | null> => {
  const exerciseRef = doc(firestore, 'exercises', id);
  const exerciseSnap = await getDoc(exerciseRef);

  if (!exerciseSnap.exists()) {
    return null;
  }

  return { ...exerciseSnap.data(), id: exerciseSnap.id } as Exercise;
}

export const editExercise = async (id: string, data: any): Promise<void> => {
  const exerciseRef = doc(firestore, 'exercises', id);
  await updateDoc(exerciseRef, data);
}

export const deleteExercise = async (id: string) => {
  await deleteDoc(doc(firestore, 'exercises', id))
}