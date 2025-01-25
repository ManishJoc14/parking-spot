"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axiosInstance from "@/lib/axiosInstance";
import { User } from "@supabase/supabase-js";

type USER = User & {
  roles: string[];
  user_metadata: {
    full_name: string;
    avatar_url: string;
  };
}

interface AuthContextType {
  user: USER | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {

  const [user, setUser] = useState<USER | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/auth")
      setUser({ ...response.data.user, roles: response.data.roles });
    } catch (error) {
      console.log("Failed to fetch user:", error)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // if user is already fetched, no need to fetch again
    if (user) return;

    // else fetch User   
    fetchUser();
  }, [fetchUser, user]);


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
