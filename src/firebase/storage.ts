import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from "firebase/storage";
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

export const deleteFileByPath = async (filePath: string) => {
  const fileRef = ref(storage, filePath);
  await deleteObject(fileRef);
}

export const deleteFileByUrl = async (downloadUrl: string) => {
  try {
    const path = extractFirebaseStoragePath(downloadUrl);
    if (!path) throw new Error("Invalid download URL");
    await deleteFileByPath(path);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export function extractFirebaseStoragePath(url: string) {
  try {
    const u = new URL(url);

    const match = u.pathname.match(/\/o\/([^?]*)/);
    if (!match) return null;

    return decodeURIComponent(match[1]);
  } catch (err) {
    console.log(err)
    return null;
  }
}