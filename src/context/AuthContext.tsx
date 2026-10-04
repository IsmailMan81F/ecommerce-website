import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import i18n from "@/i18n/translations";

interface AdminCredentials {
  username: string;
  passwordHash: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  username: string;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  updateCredentials: (
    currentPass: string,
    newUsername: string,
    newPass?: string
  ) => { success: boolean; message: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = "kord_admin_authenticated";
const CREDENTIALS_KEY = "kord_admin_credentials";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [credentials, setCredentials] = useState<AdminCredentials>(() => {
    try {
      const stored = sessionStorage.getItem(CREDENTIALS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return { username: "admin", passwordHash: "123" };
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(AUTH_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const login = (user: string, pass: string): boolean => {
    if (user === credentials.username && pass === credentials.passwordHash) {
      setIsAuthenticated(true);
      try {
        sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
      } catch {
        // ignore
      }
      toast.success(i18n.t("admin.loginSuccess"), {
        description: i18n.t("admin.loginSuccessDesc"),
      });
      return true;
    } else {
      toast.error(i18n.t("admin.loginInvalid"), {
        description: i18n.t("admin.loginInvalidDesc"),
      });
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    toast.info(i18n.t("admin.loggedOut"), {
      description: i18n.t("admin.loggedOutDesc"),
    });
  };

  const updateCredentials = (
    currentPass: string,
    newUsername: string,
    newPass?: string
  ): { success: boolean; message: string } => {
    if (currentPass !== credentials.passwordHash) {
      return { success: false, message: i18n.t("admin.currentPasswordIncorrect") };
    }

    const nextCreds: AdminCredentials = {
      username: newUsername.trim() || credentials.username,
      passwordHash: newPass?.trim() ? newPass.trim() : credentials.passwordHash,
    };

    setCredentials(nextCreds);
    try {
      sessionStorage.setItem(CREDENTIALS_KEY, JSON.stringify(nextCreds));
    } catch {
      // ignore
    }
    return { success: true, message: "Admin credentials updated successfully" };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        username: credentials.username,
        login,
        logout,
        updateCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
