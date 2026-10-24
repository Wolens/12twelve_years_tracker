"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({ title: "Сначала войдите по ссылке из письма" });
        router.replace("/profile");
        return;
      }
      setReady(true);
    })();
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "Пароль минимум 6 символов" });
      return;
    }
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Не удалось сменить пароль", description: error.message });
      return;
    }
    toast({ title: "Пароль обновлён" });
    router.replace("/profile");
  };

  if (!ready) {
    return (
      <div className="mx-auto max-w-md p-6 text-center text-muted-foreground">
        Проверяем сессию…
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <Card>
        <CardHeader>
          <CardTitle>Новый пароль</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-3" onSubmit={submit}>
            <Label>Пароль</Label>
            <Input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              Сохранить
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
