import { auth } from "../../services/firebise";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
} from "firebase/auth";

export const register = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const login = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => {
  return signOut(auth);
};

export const loginWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const resetPassword = (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

export const updateDisplayName = (name: string) => {
  if (!auth.currentUser) throw new Error("Not authenticated");
  return updateProfile(auth.currentUser, { displayName: name });
};
 
export const changePassword = async (currentPassword: string, newPassword: string) => {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error("Not authenticated");
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  return updatePassword(user, newPassword);
};
 
export const deleteAccount = async (password?: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  // Якщо email провайдер — реавтентифікуємо
  const isEmailProvider = user.providerData.some(p => p.providerId === "password");
  if (isEmailProvider && password) {
    const credential = EmailAuthProvider.credential(user.email!, password);
    await reauthenticateWithCredential(user, credential);
  }
  return deleteUser(user);
};
