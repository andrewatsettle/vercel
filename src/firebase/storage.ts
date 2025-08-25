import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase"

export const uploadFile = async (file: File) => {
  const storageRef = ref(storage, `uploads/${new Date().getTime()}-${file.name}`);
  await uploadBytes(storageRef, file);

  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;

}