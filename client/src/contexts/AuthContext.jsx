import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { apiRequest } from '../lib/queryClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('firebase-token', token);
          setUser(firebaseUser);
        } catch (error) {
          console.error('Error getting token:', error);
          setUser(null);
          localStorage.removeItem('firebase-token');
        }
      } else {
        setUser(null);
        localStorage.removeItem('firebase-token');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  };

  const signUp = async (email, password, userData) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user in our database
    const token = await result.user.getIdToken();
    localStorage.setItem('firebase-token', token);
    
    await apiRequest('POST', '/api/auth/register', {
      ...userData,
      firebaseUid: result.user.uid,
    });

    return result;
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Create user in our database if they don't exist
    const token = await result.user.getIdToken();
    localStorage.setItem('firebase-token', token);
    
    try {
      await apiRequest('POST', '/api/auth/register', {
        name: result.user.displayName || '',
        email: result.user.email,
        photoURL: result.user.photoURL || '',
        firebaseUid: result.user.uid,
      });
    } catch (error) {
      // User might already exist, that's okay
      if (!error.message.includes('duplicate')) {
        throw error;
      }
    }

    return result;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    localStorage.removeItem('firebase-token');
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
