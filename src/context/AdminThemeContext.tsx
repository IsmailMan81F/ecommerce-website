import React from "react";
import {
  ThemeSetting,
  ThemeContextType,
  ThemeProvider,
  useTheme,
} from "./ThemeContext";

export type { ThemeSetting };

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const useAdminTheme = (): ThemeContextType => {
  return useTheme();
};
