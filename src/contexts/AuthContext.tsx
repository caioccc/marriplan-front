/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LoadingProgress } from "@/components/LoadingProgress";
import { AxiosRequestConfig } from "axios";
import { useRouter } from "next/router";
import { destroyCookie } from "nookies";
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    LoginFormData,
    LoginResponse,
    RegisterFormData,
    UserData,
} from "../interfaces/common";
import api from "../services/api";

export const unprotectedRoutes = [
  "/",
  "/plans",
  "/terms",
  "/privacy",
  "/login",
  "/register",
  "/404",
  "/403",
  "/500",
  "/register/check-email",
  "/register/confirm-email",
  "/register/confirm-email/[key]",
  "/reset-password",
  "/reset-password/[token]",
  "/2fa",
  "/site/[slug]",
  "/gifts/share/[token]",
  "/guests/confirm/[token]",
  "/guests/thank-you",
  "/moodboard/[id]",
  "/public/moodboard/[id]",
];

type AuthProviderProps = {
  children: React.ReactNode;
};

type IAuthContext = {
  isAuthenticated: boolean;
  loading: boolean;
  user?: UserData;
  setUser: (newUser: any) => void;
  login: (body: LoginFormData) => Promise<any>;
  logout: () => void;
  register: (body: RegisterFormData) => Promise<any>;
  refreshUser: () => Promise<void>;
};

const isExternalPage = (path: string) => {
  return unprotectedRoutes.includes(path);
};

const readStoredUser = () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      return undefined;
    }
  }

  const storedLocalUser = localStorage.getItem("local_user");
  if (storedLocalUser) {
    try {
      return JSON.parse(storedLocalUser);
    } catch {
      return undefined;
    }
  }

  return undefined;
};

const defaultAuthContextValues: IAuthContext = {
  isAuthenticated: false,
  loading: true,
  user: undefined,
  setUser: (newUser: any) => {
    return undefined;
  },
  login: async () => {
    return undefined;
  },
  logout: () => {
    return undefined;
  },
  register: async () => {
    return undefined;
  },
  refreshUser: async () => {
    return undefined;
  },
};

const AuthContext = createContext<IAuthContext>(defaultAuthContextValues);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<any>(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    return readStoredUser();
  });
  const [loading, setLoading] = useState(true);

  const clearAuthStorage = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("local_user");
    localStorage.removeItem("settings");
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userSaved = readStoredUser();

    if (!token) {
      setUser(undefined);
      clearAuthStorage();
    } else if (userSaved) {
      setUser(userSaved);
    }

    setLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(undefined);
        return;
      }
      const config = {
        headers: {
          Authorization: `Token ${token}`,
        },
      } as AxiosRequestConfig;

      const { data } = await api.get<UserData>("/api/auth/user/", config);

      if (data) {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
      setUser(undefined);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleUserUpdated = () => {
      const updatedUser = readStoredUser();
      const currentUserSerialized = JSON.stringify(user ?? null);
      const updatedUserSerialized = JSON.stringify(updatedUser ?? null);

      if (updatedUser && updatedUserSerialized !== currentUserSerialized) {
        setUser(updatedUser);
      }
    };

    window.addEventListener("marriplan:user-updated", handleUserUpdated);

    return () => window.removeEventListener("marriplan:user-updated", handleUserUpdated);
  }, [user]);

  const login = async (body: LoginFormData) => {
    const config = {
      headers: {},
    } as AxiosRequestConfig;

    const { data } = await api.post<LoginResponse>(
      "/api/auth/pre-login/",
      body,
      config,
    );

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("local_user", JSON.stringify(data.local_user));
      setUser(data.user);
    }

    return data;
  };

  const register = async (body: RegisterFormData) => {
    const config = {
      headers: {},
    } as AxiosRequestConfig;

    const { data } = await api.post("/api/auth/register/", body, config);
    return data;
  };

  const logout = () => {
    setUser(undefined);
    clearAuthStorage();
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("marriplan:trial-modal-seen");
    }
    destroyCookie(null, "redirect_route");
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        setUser,
        login,
        loading,
        logout,
        register,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

type ProtetedRouteProps = {
  children: React.ReactNode;
};

export const ProtectedRoute = ({ children }: ProtetedRouteProps) => {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();

  const onboardingRoute = "/onboarding";

  const isWeddingProfileComplete = (profile?: any) => {
    if (!profile) return false;
    return !!(
      profile.nome_noivo &&
      profile.telefone_noivo &&
      profile.nome_noiva &&
      profile.telefone_noiva
    );
  };

  const pathIsProtected = !(unprotectedRoutes.indexOf(router.pathname) !== -1);

  useEffect(() => {
    if (!isAuthenticated && !loading && pathIsProtected) {
      router.push(`/login?redirect=${router.route}`);
      return;
    }

    if (!loading && isAuthenticated && pathIsProtected) {
      const needsOnboarding = !isWeddingProfileComplete(user?.wedding_profile);

      if (needsOnboarding && router.pathname !== onboardingRoute) {
        router.push(onboardingRoute);
      }
    }
  }, [isAuthenticated, loading, pathIsProtected, router, user]);

  if ((loading || !isAuthenticated) && pathIsProtected) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingProgress />
      </div>
    );
  }

  return <>{children}</>;
};
