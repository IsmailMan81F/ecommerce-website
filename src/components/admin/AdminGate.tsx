import React from "react";
import { useAuth } from "@/context/AuthContext";
import { AdminThemeProvider } from "@/context/AdminThemeContext";
import { AdminLogin } from "./AdminLogin";
import { AdminLayout } from "./AdminLayout";

const AdminGateContent: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <AdminLayout />;
};

export const AdminGate: React.FC = () => {
  return (
    <AdminThemeProvider>
      <AdminGateContent />
    </AdminThemeProvider>
  );
};

