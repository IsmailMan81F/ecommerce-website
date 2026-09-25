import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";

export const AdminLogin: React.FC = () => {
  const { login } = useAuth();
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = login(usernameInput.trim(), passwordInput);
    setIsLoading(false);

    if (!success) {
      // Clear only password field on error as required
      setPasswordInput("");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--canvas)]">
      <Card className="w-full max-w-[420px] rounded-[24px] border border-[var(--hairline)] bg-[var(--paper)] p-2 sm:p-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[18px] bg-[var(--surface-alt)] border border-[var(--hairline)] text-[var(--ink)]">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[22px] font-semibold tracking-[-0.04em] text-[var(--ink)]">
              KØRD
            </span>
            <CardDescription className="text-caption text-[var(--mid-gray)] mt-1">
              Atelier Management Console
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                type="text"
                placeholder="Enter username"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                autoComplete="username"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoComplete="current-password"
                required
                className="h-11"
              />
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 rounded-[18px] bg-[var(--ink-soft)] hover:bg-[var(--ink)] text-[var(--paper)] text-[14px] font-medium gap-2"
              >
                <span>Log In</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-center text-[12px] text-[var(--mid-gray)] pt-2">
              Authorized studio personnel only. All access is logged.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
