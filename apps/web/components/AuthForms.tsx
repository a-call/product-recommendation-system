"use client";

import { Button, Card } from "@prs/ui";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { apiPost } from "../lib/api";
import { getVisitorId, setToken } from "../lib/tracking";

type Session = { accessToken: string };

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const data = await apiPost<Session>(`/auth/${mode}`, {
        email: form.get("email"),
        password: form.get("password"),
        name: form.get("name"),
        visitorId: getVisitorId()
      });
      setToken(data.accessToken);
      router.push("/profile");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Authentication failed");
    }
  }

  return (
    <section className="mx-auto flex min-h-[70vh] max-w-md items-center px-4">
      <Card className="w-full p-6">
        <h1 className="text-2xl font-semibold">{mode === "login" ? "Login" : "Register"}</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "register" ? (
            <input name="name" placeholder="Name" className="h-11 w-full rounded-md border border-zinc-200 px-3" />
          ) : null}
          <input name="email" type="email" placeholder="Email" className="h-11 w-full rounded-md border border-zinc-200 px-3" />
          <input name="password" type="password" placeholder="Password" className="h-11 w-full rounded-md border border-zinc-200 px-3" />
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button className="w-full">{mode === "login" ? "Login" : "Create account"}</Button>
        </form>
      </Card>
    </section>
  );
}
