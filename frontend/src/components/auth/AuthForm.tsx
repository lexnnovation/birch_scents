"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/stores/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "register";

const COPY = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to continue your order.",
    submit: "Sign in",
    alt: "New to Birchscents?",
    altCta: "Create an account",
    altHref: "/register",
    google: "Continue with Google",
    toast: "Signed in",
  },
  register: {
    title: "Create your account",
    subtitle: "Join Birchscents for a faster checkout.",
    submit: "Create account",
    alt: "Already have an account?",
    altCta: "Sign in",
    altHref: "/login",
    google: "Sign up with Google",
    toast: "Account created",
  },
} as const;

/** Only allow internal, non-protocol-relative redirect targets. */
function safeRedirect(to: string): string {
  return to.startsWith("/") && !to.startsWith("//") ? to : "/";
}

type Form = { name: string; email: string; password: string };

export function AuthForm({ mode, redirectTo }: { mode: Mode; redirectTo: string }) {
  const router = useRouter();
  const signIn = useAuth((s) => s.signIn);
  const copy = COPY[mode];
  const target = safeRedirect(redirectTo);

  const [form, setForm] = useState<Form>({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});

  function set(key: keyof Form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function validate() {
    const e: Partial<Record<keyof Form, string>> = {};
    if (mode === "register" && !form.name.trim()) e.name = "Enter your name";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Enter a valid email";
    if (form.password.length < 6) e.password = "At least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function complete(email: string) {
    // Mock success — Phase 7 swaps this for the real Supabase sign-in/up call.
    signIn(email);
    toast.success(copy.toast);
    router.push(target);
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    complete(form.email.trim());
  }

  return (
    <div>
      <div className="text-center">
        <h1 className="font-heading text-2xl font-extrabold">{copy.title}</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">{copy.subtitle}</p>
      </div>

      <Button
        type="button"
        variant="outline"
        className="mt-6 h-11 w-full rounded-full text-sm font-medium"
        onClick={() => complete("guest@birchscents.com")}
      >
        <GoogleGlyph />
        {copy.google}
      </Button>

      <div className="my-6 flex items-center gap-3">
        <span className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-[0.7rem] tracking-[0.14em] uppercase">or</span>
        <span className="bg-border h-px flex-1" />
      </div>

      <form onSubmit={onSubmit} className="grid gap-4" noValidate>
        {mode === "register" && (
          <AuthField
            id="name"
            label="Full name"
            value={form.name}
            onChange={set("name")}
            error={errors.name}
            autoComplete="name"
          />
        )}
        <AuthField
          id="email"
          label="Email"
          type="email"
          inputMode="email"
          value={form.email}
          onChange={set("email")}
          error={errors.email}
          autoComplete="email"
        />
        <AuthField
          id="password"
          label="Password"
          type="password"
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
        <Button type="submit" size="pill" className="mt-2 w-full">
          {copy.submit}
        </Button>
      </form>

      <p className="text-muted-foreground mt-6 text-center text-sm">
        {copy.alt}{" "}
        <Link
          href={{
            pathname: copy.altHref,
            query: target === "/" ? undefined : { redirectTo: target },
          }}
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          {copy.altCta}
        </Link>
      </p>
    </div>
  );
}

function AuthField({
  id,
  label,
  error,
  ...rest
}: {
  id: string;
  label: string;
  error?: string;
} & React.ComponentProps<typeof Input>) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1.5 h-10"
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} className="text-destructive mt-1 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24z"
      />
      <path fill="#FBBC05" d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.29a12 12 0 0 0 0 10.76z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.1C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
