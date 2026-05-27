import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  orderBy,
  query,
  where,
  updateDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "../../services/firebise";
import { getAuth } from "firebase/auth";

const routesCollection = collection(db, "routes");

const getLat = (place: any) => {
  try {
    if (typeof place.geometry?.location?.lat === "function") {
      return place.geometry.location.lat();
    }
    return place.geometry?.location?.lat;
  } catch {
    return null;
  }
};

const getLng = (place: any) => {
  try {
    if (typeof place.geometry?.location?.lng === "function") {
      return place.geometry.location.lng();
    }
    return place.geometry?.location?.lng;
  } catch {
    return null;
  }
};

const getPhoto = (place: any) => {
  try {
    if (place.photos?.[0]) {
      return place.photos[0].getUrl({ maxWidth: 1200, maxHeight: 800 });
    }
    return null;
  } catch {
    return null;
  }
};

const serializePlace = (place: any) => ({
  place_id: place.place_id,
  name: place.name,
  rating: place.rating || 0,
  vicinity: place.vicinity || "",
  types: place.types || [],
  lat: Number(getLat(place)),
  lng: Number(getLng(place)),
  photo: getPhoto(place),
});

// Хелпер — актуальні дані юзера
const getCurrentUserInfo = () => {
  const user = getAuth().currentUser;
  return {
    uid: user?.uid || null,
    userName: user?.displayName || user?.email || "Анонім",
    userPhoto: user?.photoURL || null,
  };
};

export const saveRoute = async (route: any) => {
  const { uid, userName, userPhoto } = getCurrentUserInfo();
  if (!uid) throw new Error("Not authenticated");

  const serializedRoute = {
    title: route.title,
    description: route.description,
    type: route.type,
    budget: route.budget,
    userId: uid,
    userName,
    userPhoto,
    isPublic: false,
    likesCount: 0,
    savedFrom: null,
    createdAt: Date.now(),
    places: route.places
      .map(serializePlace)
      .filter(
        (p: any) =>
          typeof p.lat === "number" &&
          !isNaN(p.lat) &&
          typeof p.lng === "number" &&
          !isNaN(p.lng),
      ),
  };

  const docRef = await addDoc(routesCollection, serializedRoute);
  return { id: docRef.id };
};

export const getRoutes = async (): Promise<any[]> => {
  return new Promise((resolve) => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      if (!user) return resolve([]);
      try {
        const q = query(
          routesCollection,
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
        );
        const snapshot = await getDocs(q);
        resolve(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        console.error("getRoutes error:", e);
        resolve([]);
      }
    });
  });
};

export const deleteRoute = async (id: string) => {
  try {
    await deleteDoc(doc(db, "routes", id));
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

// ── ПУБЛІЧНІ МАРШРУТИ ──────────────────────────────────────────

export const togglePublic = async (routeId: string, isPublic: boolean) => {
  const { userName, userPhoto } = getCurrentUserInfo();
  // При публікації оновлюємо також актуальні дані автора
  await updateDoc(doc(db, "routes", routeId), {
    isPublic,
    userName,
    userPhoto,
  });
};

export const getPublicRoutes = async (): Promise<any[]> => {
  try {
    const q = query(
      routesCollection,
      where("isPublic", "==", true),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("getPublicRoutes error:", e);
    return [];
  }
};

// Зберегти чужий маршрут до себе
export const copyRoute = async (route: any) => {
  const { uid, userName, userPhoto } = getCurrentUserInfo();
  if (!uid) throw new Error("Not authenticated");

  const copy = {
    title: route.title,
    description: route.description,
    type: route.type,
    budget: route.budget,
    userId: uid,
    userName,
    userPhoto,
    isPublic: false,
    likesCount: 0,
    savedFrom: route.userName || "невідомого автора",
    createdAt: Date.now(),
    places: route.places,
  };

  const docRef = await addDoc(routesCollection, copy);
  return { id: docRef.id };
};

// ── ЛАЙКИ ──────────────────────────────────────────────────────

export const toggleLike = async (routeId: string) => {
  const uid = getAuth().currentUser?.uid;
  if (!uid) throw new Error("Not authenticated");

  const likeRef = doc(db, "likes", `${routeId}_${uid}`);
  const likeSnap = await getDoc(likeRef);
  const routeRef = doc(db, "routes", routeId);

  if (likeSnap.exists()) {
    await deleteDoc(likeRef);
    const snap = await getDoc(routeRef);
    const current = snap.data()?.likesCount || 0;
    await updateDoc(routeRef, { likesCount: Math.max(0, current - 1) });
    return false;
  } else {
    await setDoc(likeRef, { userId: uid, routeId, createdAt: Date.now() });
    const snap = await getDoc(routeRef);
    const current = snap.data()?.likesCount || 0;
    await updateDoc(routeRef, { likesCount: current + 1 });
    return true;
  }
};

export const getUserLikes = async (
  routeIds: string[],
): Promise<Set<string>> => {
  const uid = getAuth().currentUser?.uid;
  if (!uid || !routeIds.length) return new Set();

  const liked = new Set<string>();
  await Promise.all(
    routeIds.map(async (routeId) => {
      const likeSnap = await getDoc(doc(db, "likes", `${routeId}_${uid}`));
      if (likeSnap.exists()) liked.add(routeId);
    }),
  );
  return liked;
};

// ── КОМЕНТАРІ ──────────────────────────────────────────────────

export const addComment = async (routeId: string, text: string) => {
  const user = getAuth().currentUser;
  if (!user) throw new Error("Not authenticated");

  await addDoc(collection(db, "comments"), {
    routeId,
    userId: user.uid,
    userName: user.displayName || user.email || "Анонім",
    userPhoto: user.photoURL || null,
    text,
    createdAt: Date.now(),
  });
};

export const getComments = async (routeId: string): Promise<any[]> => {
  try {
    const q = query(
      collection(db, "comments"),
      where("routeId", "==", routeId),
      orderBy("createdAt", "asc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error("getComments error:", e);
    return [];
  }
};

export const deleteComment = async (commentId: string) => {
  await deleteDoc(doc(db, "comments", commentId));
};
