import { ref, uploadBytes, getDownloadURL, deleteObject, listAll,  } from "firebase/storage";
import { storage } from "./firebase"

export const uploadFile = async (folder: string, file: File) => {
  const storageRef = ref(storage, `uploads/${folder}/${new Date().getTime()}-${file.name}`);
  await uploadBytes(storageRef, file);

  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
}

export const deleteFolder = async (folder: string) => {
  const folderRef = ref(storage, `uploads/${folder}`);
  const result = await listAll(folderRef);

  await Promise.all(result.items.map(itemRef => deleteObject(itemRef)));
}