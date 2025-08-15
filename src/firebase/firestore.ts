import { addDoc, collection } from "firebase/firestore";
import { firestore } from "./firebase";

export const addExercise = async (data: any): Promise<void> => {
  await addDoc(collection(firestore, "exercises"), data);
}