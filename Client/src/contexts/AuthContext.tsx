/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

const AUTH_API_URL = "http://127.0.0.1:5000/api/auth";
const USERS_API_URL = "http://127.0.0.1:5000/api/users";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
  favorites?: any[];
  history?: any[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  userRoles;
  isAdmin: boolean;
  isOwner: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: string
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserSession = async () => {
      const storedToken = localStorage.getItem("token");

      if (!storedToken) {
        setIsLoading(false);
        setUser(null);
        setToken(null);
        return;
      }

      try {
        const response = await fetch(`${USERS_API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${AUTH_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.message || "Login failed") };
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error("Sign in failed"),
      };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: string
  ) => {
    try {
      const response = await fetch(`${AUTH_API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: new Error(data.message || "Signup failed") };
      }

      // If you WANT to auto-login, uncomment the lines below.
      // localStorage.setItem("token", data.token);
      // setToken(data.token);
      // setUser(data.user);

      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error("Sign up failed"),
      };
    }
  };

  const signOut = async () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  const isAdmin = user?.role === "admin";
  const isOwner = user?.role === "owner" || isAdmin;
  const userRoles = user ? [user.role] : [];

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        userRoles,
        isAdmin,
        isOwner,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
