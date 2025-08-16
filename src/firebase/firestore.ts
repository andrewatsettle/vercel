import { addDoc, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
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

export const deleteExercise = async (id: string) => {
  await deleteDoc(doc(firestore, 'exercises', id))
}