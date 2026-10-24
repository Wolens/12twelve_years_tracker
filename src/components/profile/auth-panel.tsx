"use client";

import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";

function GuestAuthForm() {
  const signUp = useAuthStore((s) => s.signUp);
  const signIn = useAuthStore((s) => s.signIn);
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset);

  const [mode, setMode] = useState<"login" | "register" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submitLogin = async () => {
    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);
    if (res.ok) {
      toast({ title: "Вход выполнен" });
      setPassword("");
    } else {
      toast({ title: "Ошибка", description: res.error });
    }
  };

  const submitRegister = async () => {
    setLoading(true);
    const res = await signUp(email, password);
    setLoading(false);
    if (!res.ok) {
      toast({ title: "Ошибка", description: res.error });
      return;
    }
    if (res.needsEmailConfirm) {
      toast({
        title: "Подтвердите почту",
        description: `Мы отправили ссылку на ${email.trim()}`,
      });
    } else {
      toast({ title: "Аккаунт создан" });
    }
    setPassword("");
  };

  const submitReset = async () => {
    setLoading(true);
    const res = await requestPasswordReset(email);
    setLoading(false);
    if (res.ok) {
      toast({
        title: "Письмо отправлено",
        description: "Откройте ссылку для смены пароля",
      });
    } else {
      toast({ title: "Ошибка", description: res.error });
    }
  };

  return (
    <>
      <p className="text-sm text-muted-foreground">
        Войдите или зарегистрируйтесь — цели и прогресс сохраняются в облаке и
        доступны с любого устройства.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={mode === "login" ? "default" : "outline"}
          onClick={() => setMode("login")}
        >
          Вход
        </Button>
        <Button
          size="sm"
          variant={mode === "register" ? "default" : "outline"}
          onClick={() => setMode("register")}
        >
          Регистрация
        </Button>
        <Button
          size="sm"
          variant={mode === "reset" ? "default" : "outline"}
          onClick={() => setMode("reset")}
        >
          Забыли пароль?
        </Button>
      </div>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (loading) return;
          if (mode === "login") submitLogin();
          else if (mode === "register") submitRegister();
          else submitReset();
        }}
      >
        <Label>Email</Label>
        <Input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {mode !== "reset" && (
          <>
            <Label>Пароль</Label>
            <Input
              type="password"
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {mode === "login" && "Войти"}
          {mode === "register" && "Создать аккаунт"}
          {mode === "reset" && "Отправить ссылку на почту"}
        </Button>
      </form>
    </>
  );
}

function LoggedInAccountPanel() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const updatePassword = useAuthStore((s) => s.updatePassword);

  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const email = user?.email ?? "";

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updatePassword(newPassword);
    setLoading(false);
    if (res.ok) {
      toast({ title: "Пароль обновлён" });
      setNewPassword("");
      setShowPassword(false);
    } else {
      toast({ title: "Ошибка", description: res.error });
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-3">
        <p className="text-xs text-muted-foreground">Вошли как</p>
        <p className="font-medium break-all">{email}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Данные синхронизируются с сервером
        </p>
      </div>

      <Button variant="outline" className="w-full gap-2" onClick={() => signOut()}>
        <LogOut className="h-4 w-4" />
        Выйти
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-auto px-0 text-xs text-muted-foreground"
        onClick={() => setShowPassword((v) => !v)}
      >
        {showPassword ? "Скрыть смену пароля" : "Сменить пароль"}
      </Button>
      {showPassword && (
        <form
          className="space-y-2 rounded-lg border border-white/10 p-3"
          onSubmit={submitPassword}
        >
          <Label className="text-xs">Новый пароль</Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button type="submit" className="w-full" size="sm" disabled={loading}>
            Сохранить
          </Button>
        </form>
      )}
    </div>
  );
}

export function AuthPanel({ className }: { className?: string }) {
  const user = useAuthStore((s) => s.user);
  const configured = isSupabaseConfigured();

  return (
    <Card className={cn(className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Аккаунт</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!configured ? (
          <p className="text-sm text-muted-foreground">
            Добавьте ключи Supabase в <code className="text-xs">.env.local</code>{" "}
            (см. README). Пока можно пользоваться трекером без входа — данные
            останутся в этом браузере.
          </p>
        ) : user ? (
          <LoggedInAccountPanel />
        ) : (
          <GuestAuthForm />
        )}
      </CardContent>
    </Card>
  );
}
