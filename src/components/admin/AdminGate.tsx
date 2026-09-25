import React from "react";
import { useAuth } from "@/context/AuthContext";
import { AdminLogin } from "./AdminLogin";
import { AdminLayout } from "./AdminLayout";

export const AdminGate: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <AdminLayout />;
};
