"use server";

import { supabase } from "@/lib/supabase";

export type SignupState = { ok: boolean; error?: string };

export async function subscribe(_: SignupState, form: FormData): Promise<SignupState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please check your email address." };

  if (supabase) {
    const { error } = await supabase.from("newsletter_signups").insert({ email });
    // 23505 = already subscribed; treat it as success.
    if (error && error.code !== "23505") {
      console.error("newsletter_signups insert failed:", error.message);
      return { ok: false, error: "We couldn't add you just now. Please try again." };
    }
  } else {
    console.info("[demo] newsletter signup (Supabase not configured)");
  }
  return { ok: true };
}
