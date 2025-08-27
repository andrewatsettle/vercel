import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc, getDoc, query, orderBy } from "firebase/firestore";
import { firestore } from "./firebase";
import { ExerciseItem } from "@/components/exercise/ExerciseForm";

type Exercise = ExerciseItem;

export const addExercise = async (id: string, data: Exercise): Promise<void> => {
  const exerciseRef = doc(firestore, 'exercises', id);
  await updateDoc(exerciseRef, {...data, createdAt: new Date()});
}

export const getExercises = async (): Promise<Exercise[]> => {
  const queryRef = query(collection(firestore, "exercises"), orderBy('createdAt', 'desc'));
  const res = await getDocs(queryRef);

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

export const editExercise = async (id: string, data: Partial<Exercise>): Promise<void> => {
  const exerciseRef = doc(firestore, 'exercises', id);
  await updateDoc(exerciseRef, data);
}

export const deleteExercise = async (id: string) => {
  await deleteDoc(doc(firestore, 'exercises', id))
}

export const addTag = async (name: string): Promise<void> => {
  await addDoc(collection(firestore, "tags"), { name, createdAt: new Date() });
}

export const editTag = async (id: string, name: string): Promise<void> => {
  const tagRef = doc(firestore, 'tags', id);
  await updateDoc(tagRef, { name });
}

export const getTags = async (): Promise<{ id: string; name: string }[]> => {
  const queryRef = query(collection(firestore, "tags"), orderBy('createdAt', 'desc'));
  const res = await getDocs(queryRef);

  if (res.empty) {
    return [];
  }

  return res.docs.map(doc => ({ ...doc.data(), id: doc.id })) as { id: string; name: string }[];
}

export const deleteTag = async (id: string) => {
  await deleteDoc(doc(firestore, 'tags', id))
}