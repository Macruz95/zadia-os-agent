'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';

export interface User {
  uid: string;
  displayName: string;
  email: string;
  role?: string;
  photoURL?: string;
}

/**
 * Hook para obtener la lista de usuarios desde Firestore
 * Rule #1: Real Firebase data
 * Rule #4: Custom hook reusable
 */
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        
        const usersData: User[] = snapshot.docs.map((doc) => ({
          uid: doc.id,
          displayName: doc.data().displayName || doc.data().name || 'Sin nombre',
          email: doc.data().email || '',
          role: doc.data().role || 'user',
          photoURL: doc.data().photoURL || undefined,
        }));

        setUsers(usersData);
        logger.info('Users fetched successfully', { component: 'useUsers', metadata: { count: usersData.length } });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al cargar usuarios';
        const error = err instanceof Error ? err : new Error(message);
        setError(message);
        logger.error('Error fetching users', error, { component: 'useUsers' });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
}
