import { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextData {
  user: { name: string } | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    async function loadUserFromStorage() {
      try {
        const storedUser = await AsyncStorage.getItem('@user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } else {
        }
      } finally {
        setLoading(false);
      }
    }

    loadUserFromStorage();
  }, []);

  useEffect(() => {}, [user, loading]);

  const signIn = async () => {
    const fakeUser = { name: 'John Doe' };
    setUser(fakeUser); 

    await AsyncStorage.setItem('@user', JSON.stringify(fakeUser));
  };

  const signOut = async () => {
    setUser(null);

    await AsyncStorage.removeItem('@user');
  };

  return <AuthContext.Provider value={{ user, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
