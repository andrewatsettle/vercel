import { redirect } from "next/navigation";

export const checkFirebasePermissionError = (error: Error) => {
  if (error?.message?.includes('Missing or insufficient permissions')) {
    return redirect('/signin');
  }
}
