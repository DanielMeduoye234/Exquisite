"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "./Brand";
import { provinces } from "@/lib/site";

const AGE_KEY = "exq-age";

// Runs in <head> before first paint: marks JS as available, and skips the gate for returning visitors.
// Add ?age=reset to any URL to show the gate again (handy when presenting the demo).
export const headScript = `document.documentElement.classList.add("js");try{var k="${AGE_KEY}";if(/[?&]age=reset/.test(location.search))localStorage.removeItem(k);if(localStorage.getItem(k))document.documentElement.dataset.age="ok"}catch(e){}`;

export function AgeGate() {
  const [province, setProvince] = useState("Ontario");
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);
  const select = useRef<HTMLSelectElement>(null);
  const age = provinces[province];

  useEffect(() => {
    const ok = document.documentElement.dataset.age === "ok";
    setDone(ok);
    if (!ok) {
      document.getElementById("shell")?.setAttribute("inert", "");
      select.current?.focus({ preventScroll: true });
    }
  }, []);

  if (done) return null;

  function confirm() {
    try {
      localStorage.setItem(AGE_KEY, JSON.stringify({ province, at: Date.now() }));
    } catch {}
    document.documentElement.dataset.age = "ok";
    document.getElementById("shell")?.removeAttribute("inert");
    setDone(true);
  }

  return (
    <div className="gate" role="dialog" aria-modal="true" aria-labelledby="gate-q">
      <Image src="/images/hero-vineyard.jpg" alt="" fill priority sizes="100vw" className="gate-photo" />
      <form className="gate-card" onSubmit={(e) => e.preventDefault()}>
        <Wordmark />
        <hr />
        <label htmlFor="gate-province">
          Where will your order be delivered?
          <select
            id="gate-province"
            ref={select}
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              setMsg("");
            }}
          >
            {Object.keys(provinces).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <p id="gate-q" className="gate-q">
          Are you {age} or older?
        </p>
        <div className="gate-actions">
          <button className="btn" type="button" onClick={confirm}>
            Yes, I am {age} or older
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => setMsg("You must be of legal drinking age to enter this site.")}>
            No, I am under {age}
          </button>
        </div>
        <p className="gate-msg" role="status">
          {msg}
        </p>
        <small>Please enjoy responsibly.</small>
      </form>
    </div>
  );
}
