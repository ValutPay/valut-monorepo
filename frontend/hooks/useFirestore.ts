"use client";

import { useState, useEffect } from "react";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  DocumentData,
  QueryConstraint,
  DocumentReference,
  CollectionReference,
  QuerySnapshot 
} from "firebase/firestore";
import { db } from "@/firebase/firebase";
import { useAuth } from "@/hooks/useAuth";

// Hook for fetching a single document
export function useDocument<T = DocumentData>(
  collectionName: string,
  documentId: string | undefined
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, collectionName, documentId);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching document:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, documentId]);

  return { data, loading, error };
}

// Hook for fetching a collection with query filters
export function useCollection<T = DocumentData>(
  collectionName: string,
  queryConstraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const collectionRef = collection(db, collectionName);
    const queryRef = query(collectionRef, ...queryConstraints);

    const unsubscribe = onSnapshot(
      queryRef,
      (snapshot) => {
        const documents = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        
        setData(documents);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching collection:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, JSON.stringify(queryConstraints)]);

  return { data, loading, error };
}

// Hook for fetching user-specific data
export function useUserData<T = DocumentData>(collectionName: string) {
  const { user } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, collectionName, user.uid);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching user data:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [collectionName, user?.uid]);

  return { data, loading, error };
}
