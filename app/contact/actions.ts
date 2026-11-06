"use server";

import { TOPICS, type ContactState } from "@/lib/contact";
import { supabase } from "@/lib/supabase";


export async function sendMessage(_: ContactState, form: FormData): Promise<ContactState> {
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const topic = String(form.get("topic") ?? "");
  const message = String(form.get("message") ?? "").trim();

  if (!name || !message) return { ok: false, error: "Please add your name and a message." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Please check your email address." };
  if (!TOPICS.includes(topic as (typeof TOPICS)[number])) return { ok: false, error: "Please choose a topic." };
  if (message.length > 4000) return { ok: false, error: "Please keep your message under 4,000 characters." };

  if (supabase) {
    const { error } = await supabase.from("contact_messages").insert({ name, email, topic, message });
    if (error) {
      console.error("contact_messages insert failed:", error.message);
      return { ok: false, error: "We couldn't send that just now. Please try again, or email us directly." };
    }
  } else {
    console.info("[demo] contact message (Supabase not configured):", { name, email, topic });
  }
  return { ok: true, name };
}
