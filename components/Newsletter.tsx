"use client";

import { useActionState } from "react";
import { subscribe, type SignupState } from "@/app/actions";

export function Newsletter() {
  const [state, action, pending] = useActionState<SignupState, FormData>(subscribe, { ok: false });
  if (state.ok) {
    return (
      <p className="signup-done" role="status">
        You&apos;re on the list. The next letter goes out when new allocations land.
      </p>
    );
  }
  return (
    <form className="signup" action={action} noValidate>
      <label htmlFor="signup-email">Email address</label>
      <div className="signup-row">
        <input id="signup-email" name="email" type="email" autoComplete="email" inputMode="email" required />
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Adding you" : "Sign up"}
        </button>
      </div>
      <p className="signup-err" role="alert">
        {state.error}
      </p>
    </form>
  );
}
