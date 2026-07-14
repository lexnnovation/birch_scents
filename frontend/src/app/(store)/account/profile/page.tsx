"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/lib/supabase/use-user";
import { getProfile, updateProfile } from "@/lib/api/account";
import type { ApiError, UserProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Form = { phone: string; address: string; city: string };

/**
 * The single saved default checkout pre-fills from. Editing a delivery
 * field directly at checkout only affects that one order — this page is
 * the only place that changes what's saved.
 */
export default function ProfilePage() {
  const { user, loading: authLoading } = useUser();
  const isSignedIn = !!user;
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!authLoading && !isSignedIn) {
      router.replace(`/login?redirectTo=${encodeURIComponent("/account/profile")}`);
    }
  }, [authLoading, isSignedIn, router]);

  const load = useCallback(() => {
    getProfile()
      .then((res) => {
        setLoadError(false);
        setProfile(res);
      })
      .catch(() => setLoadError(true));
  }, []);

  useEffect(() => {
    if (!isSignedIn) return;
    load();
  }, [isSignedIn, load]);

  if (authLoading || !isSignedIn) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="text-muted-foreground mx-auto size-6 animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-muted-foreground">We couldn&rsquo;t load your information.</p>
        <div className="mt-6">
          <Button variant="outline" size="pill" onClick={load}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="text-muted-foreground mx-auto size-6 animate-spin" />
      </div>
    );
  }

  return <ProfileForm email={profile.email} profile={profile} />;
}

function ProfileForm({
  email,
  profile,
}: {
  email: string;
  profile: UserProfile;
}) {
  const [form, setForm] = useState<Form>({
    phone: profile.phone ?? "",
    address: profile.address ?? "",
    city: profile.city ?? "",
  });
  const [saving, setSaving] = useState(false);

  function set(key: keyof Form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function save(ev: React.FormEvent) {
    ev.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success("Personal information saved");
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't save — please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-lg px-4 py-12 md:px-8">
      <h1 className="text-3xl font-extrabold md:text-4xl">Personal information</h1>
      <p className="text-muted-foreground mt-3">
        This is what checkout pre-fills from every time — edit it here to change your saved default.
        Changing an address at checkout itself only affects that one order.
      </p>

      <div className="mt-8 grid gap-5">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={profile.name ?? ""} disabled className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} disabled className="mt-1.5" />
        </div>
        <p className="text-muted-foreground -mt-2 text-xs">
          Name and email are managed by your account login, not editable here.
        </p>
        <Field
          id="phone"
          label="Phone number"
          value={form.phone}
          onChange={set("phone")}
          inputMode="tel"
        />
        <Field
          id="address"
          label="Delivery address"
          value={form.address}
          onChange={set("address")}
        />
        <Field id="city" label="City" value={form.city} onChange={set("city")} />
      </div>

      <Button type="submit" size="pill" className="mt-8" disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
} & React.ComponentProps<typeof Input>) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={onChange} className="mt-1.5" {...rest} />
    </div>
  );
}
