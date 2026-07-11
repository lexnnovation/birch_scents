"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
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
    toast: "Signed in",
  },
  register: {
    title: "Create your account",
    subtitle: "Join Birchscents for a faster checkout.",
    submit: "Create account",
    alt: "Already have an account?",
    altCta: "Sign in",
    altHref: "/login",
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
  const copy = COPY[mode];
  const target = safeRedirect(redirectTo);

  const [form, setForm] = useState<Form>({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    const supabase = createClient();
    const email = form.email.trim();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: form.password });
      setSubmitting(false);
      if (error) {
        setFormError(error.message);
        return;
      }
      toast.success(copy.toast);
      router.push(target);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: { data: { name: form.name.trim() } },
    });
    setSubmitting(false);
    if (error) {
      setFormError(error.message);
      return;
    }
    if (!data.session) {
      // Email confirmation is required by the Supabase project settings —
      // there is no session yet, so we can't redirect into checkout.
      setAwaitingConfirmation(true);
      return;
    }
    toast.success(copy.toast);
    router.push(target);
  }

  if (awaitingConfirmation) {
    return (
      <div className="text-center">
        <h1 className="font-heading text-2xl font-extrabold">Check your email</h1>
        <p className="text-muted-foreground mt-3 text-sm">
          We&rsquo;ve sent a confirmation link to <strong>{form.email.trim()}</strong>. Confirm your
          address, then sign in to continue.
        </p>
        <Button asChild size="pill" className="mt-6 w-full">
          <Link href={{ pathname: "/login", query: target === "/" ? undefined : { redirectTo: target } }}>
            Go to sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center">
        <h1 className="font-heading text-2xl font-extrabold">{copy.title}</h1>
        <p className="text-muted-foreground mt-1.5 text-sm">{copy.subtitle}</p>
      </div>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4" noValidate>
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
        {formError && (
          <p role="alert" className="text-destructive text-sm">
            {formError}
          </p>
        )}
        <Button type="submit" size="pill" className="mt-2 w-full" disabled={submitting}>
          {submitting ? "Please wait…" : copy.submit}
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
