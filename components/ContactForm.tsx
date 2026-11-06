"use client";

import { useActionState } from "react";
import { sendMessage } from "@/app/contact/actions";
import { TOPICS, type ContactState } from "@/lib/contact";

export function ContactForm({ topic }: { topic?: string }) {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendMessage, { ok: false });
  const initialTopic = topic === "membership" ? TOPICS[1] : topic === "trade" ? TOPICS[2] : TOPICS[0];

  if (state.ok) {
    return (
      <div className="sent" role="status">
        <p className="h3">Thank you, {state.name}.</p>
        <p className="soft">Your note is with us. We reply within one business day.</p>
      </div>
    );
  }

  return (
    <form className="form" action={action} noValidate>
      <h2 className="h3">Send us a note</h2>
      <div className="two">
        <label>
          Your name
          <input name="name" autoComplete="name" required />
        </label>
        <label>
          Email
          <input name="email" type="email" inputMode="email" autoComplete="email" required />
        </label>
      </div>
      <label>
        What is it about?
        <select name="topic" defaultValue={initialTopic}>
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        Message
        <span className="hint">For an order, include your order number if you have one.</span>
        <textarea name="message" required maxLength={4000} />
      </label>
      <p className="err" role="alert">
        {state.error}
      </p>
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Sending" : "Send message"}
      </button>
    </form>
  );
}
