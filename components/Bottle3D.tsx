"use client";

import { useEffect, useRef, useState } from "react";
import { BottleShot } from "./Brand";
import { vintageLabel } from "@/lib/format";
import type { Product } from "@/lib/types";

/* 3D bottle for the product page. A lathe-turned bottle per wine type, a label that wraps the glass
   (printed with this wine's own name), a metallic capsule and studio reflections. Drag to turn it
   around its upright axis. three.js loads only here; the flat BottleShot shows until it's ready and
   stays if WebGL isn't available. Dawn: a custom element in assets/exq-bottle-3d.js. */

type Kind = "bordeaux" | "burgundy" | "champagne" | "dessert" | "grappa";

// Profiles in scene units (1 unit = 100 SVG units of the flat BottleShot, base at y = 0).
const PROFILE: Record<Kind, { r: number; h: number; sh: number; nr: number; top: number; k: [number, number]; label: [number, number]; cap: number }> = {
  bordeaux: { r: 0.56, h: 2.7, sh: 3.3, nr: 0.13, top: 4.84, k: [0.55, 0.3], label: [0.8, 2.08], cap: 0.74 },
  burgundy: { r: 0.6, h: 2.1, sh: 3.6, nr: 0.12, top: 4.84, k: [0.75, 0.15], label: [0.62, 1.82], cap: 0.74 },
  champagne: { r: 0.64, h: 2.1, sh: 3.8, nr: 0.145, top: 4.9, k: [0.75, 0.15], label: [0.74, 1.78], cap: 1.3 },
  dessert: { r: 0.44, h: 2.5, sh: 3.1, nr: 0.1, top: 4.54, k: [0.55, 0.3], label: [0.8, 2.0], cap: 0.64 },
  grappa: { r: 0.58, h: 2.0, sh: 3.0, nr: 0.1, top: 3.8, k: [0.6, 0.2], label: [0.68, 1.7], cap: 0 },
};

const LOOK: Record<Product["type"], { kind: Kind; glass: string; transmission: number; liquid?: string; foil: string }> = {
  Red: { kind: "bordeaux", glass: "#13241a", transmission: 0, foil: "#6E1E2B" },
  White: { kind: "burgundy", glass: "#4c5a22", transmission: 0.25, liquid: "#d9cf82", foil: "#B89B4A" },
  Sparkling: { kind: "champagne", glass: "#0f1d13", transmission: 0, foil: "#C7A95A" },
  Rosé: { kind: "bordeaux", glass: "#ffffff", transmission: 1, liquid: "#e5806c", foil: "#D9B9B0" },
  Dessert: { kind: "dessert", glass: "#6a3410", transmission: 0.3, liquid: "#7a2a12", foil: "#6B3A18" },
  Spirits: { kind: "grappa", glass: "#ffffff", transmission: 1, liquid: "#b8681c", foil: "#7A5A3A" },
};

const ARC = 2.3; // radians of glass the label wraps

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number, lines: number) {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > max) {
      out.push(line);
      line = word;
    } else line = next;
  }
  if (line) out.push(line);
  if (out.length > lines) {
    out.length = lines;
    out[lines - 1] = out[lines - 1].replace(/\s*\S*$/, "") + "…";
  }
  return out;
}

export function Bottle3D({ product }: { product: Product }) {
  const box = useRef<HTMLDivElement>(null);
  const turn = useRef<(d: number) => void>(() => {});
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const probe = document.createElement("canvas");
      if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return setFailed(true);

      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      await document.fonts.ready;
      if (disposed) return;

      const look = LOOK[product.type];
      const P = PROFILE[look.kind];
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;

      const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);
      const height = P.top + (P.cap > 0 ? 0 : 0.6);
      const centre = height * 0.5 - 0.35;
      camera.position.set(0, centre + 0.5, 12.5);
      camera.lookAt(0, centre, 0);

      // A soft key light from the left for a long highlight down the glass.
      const key = new THREE.DirectionalLight(0xffffff, 1.4);
      key.position.set(-4, 6, 5);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xffffff, 0.8);
      rim.position.set(5, 3, -4);
      scene.add(rim);

      const bottle = new THREE.Group();
      scene.add(bottle);
      const disposables: { dispose: () => void }[] = [envTex, pmrem];
      const keep = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

      // Lathe profile: base, body, shoulder curve, neck, lip.
      const pts: InstanceType<typeof THREE.Vector2>[] = [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(P.r - 0.05, 0),
        new THREE.Vector2(P.r, 0.06),
        new THREE.Vector2(P.r, P.h),
      ];
      const curve = new THREE.CubicBezierCurve(
        new THREE.Vector2(P.r, P.h),
        new THREE.Vector2(P.r, P.h + (P.sh - P.h) * P.k[0]),
        new THREE.Vector2(P.nr, P.h + (P.sh - P.h) * (1 - P.k[1])),
        new THREE.Vector2(P.nr, P.sh),
      );
      pts.push(...curve.getPoints(28).slice(1));
      pts.push(new THREE.Vector2(P.nr, P.top - 0.06), new THREE.Vector2(P.nr + 0.025, P.top - 0.04), new THREE.Vector2(P.nr + 0.025, P.top), new THREE.Vector2(0.001, P.top));

      const glass = new THREE.Mesh(
        keep(new THREE.LatheGeometry(pts, 96)),
        keep(
          new THREE.MeshPhysicalMaterial({
            color: look.glass,
            roughness: look.transmission > 0.9 ? 0.02 : 0.05,
            metalness: 0,
            transmission: look.transmission,
            thickness: 0.12,
            ior: 1.5,
            specularIntensity: 1,
            clearcoat: 1,
            clearcoatRoughness: 0.03,
            envMapIntensity: 1.8,
            transparent: look.transmission > 0,
          }),
        ),
      );
      bottle.add(glass);

      // Wine inside clear and pale bottles.
      if (look.liquid) {
        const fill = Math.min(P.sh - 0.15, P.h + (P.sh - P.h) * 0.6);
        const inner = pts.filter((p) => p.y <= fill).map((p) => new THREE.Vector2(Math.max(0.001, p.x * 0.93), Math.max(0.02, p.y)));
        inner.push(new THREE.Vector2(0.001, fill));
        bottle.add(
          new THREE.Mesh(
            keep(new THREE.LatheGeometry(inner, 64)),
            keep(new THREE.MeshPhysicalMaterial({ color: look.liquid, roughness: 0.05, transmission: 0.35, thickness: 1.2, attenuationColor: look.liquid, attenuationDistance: 0.6, transparent: true, opacity: 0.88 })),
          ),
        );
      }

      // Capsule (foil) or a wooden stopper for grappa.
      if (P.cap > 0) {
        const r = P.nr + 0.03;
        const foil = keep(new THREE.MeshStandardMaterial({ color: look.foil, metalness: 0.75, roughness: 0.32, envMapIntensity: 1.2 }));
        const cap = new THREE.Mesh(keep(new THREE.CylinderGeometry(r, r, P.cap, 64)), foil);
        cap.position.y = P.top - P.cap / 2 + 0.01;
        bottle.add(cap);
      } else {
        const wood = keep(new THREE.MeshStandardMaterial({ color: "#5A3E26", roughness: 0.7 }));
        const plug = new THREE.Mesh(keep(new THREE.CylinderGeometry(P.nr + 0.06, P.nr + 0.06, 0.32, 48)), wood);
        plug.position.y = P.top + 0.12;
        const knob = new THREE.Mesh(keep(new THREE.SphereGeometry(0.2, 32, 16)), wood);
        knob.position.y = P.top + 0.38;
        knob.scale.set(1, 0.8, 1);
        bottle.add(plug, knob);
      }

      // Label: drawn on a canvas sized to the wrapped arc, so the type isn't stretched.
      const [y0, y1] = P.label;
      const lh = y1 - y0;
      const arcLen = (P.r + 0.004) * ARC;
      const W = 1024;
      const H = Math.round((W * lh) / arcLen);
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d")!;
      const css = getComputedStyle(document.documentElement);
      const serif = css.getPropertyValue("--font-fraunces").trim() || "Georgia, serif";
      const sans = css.getPropertyValue("--font-instrument").trim() || "system-ui, sans-serif";
      ctx.fillStyle = "#F3ECDD";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#B9AB90";
      ctx.lineWidth = 3;
      ctx.strokeRect(26, 26, W - 52, H - 52);
      ctx.fillStyle = "#5C5348";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `600 40px ${sans}`;
      ctx.letterSpacing = "7px";
      ctx.fillText(product.vendor.toUpperCase(), W / 2, H * 0.17);
      ctx.fillRect(W / 2 - 40, H * 0.27, 80, 2);
      ctx.letterSpacing = "0px";
      ctx.fillStyle = "#1F1B16";
      ctx.font = `italic 500 104px ${serif}`;
      const title = product.title.replace(/['‘’]/g, "");
      const lines = wrap(ctx, title, W * 0.56, 3);
      const size = lines.length > 2 ? 0.82 : 1;
      ctx.font = `italic 500 ${Math.round(104 * size)}px ${serif}`;
      const mid = H * 0.54;
      lines.forEach((l, i) => ctx.fillText(l, W / 2, mid + (i - (lines.length - 1) / 2) * 112 * size));
      ctx.fillStyle = "#5C5348";
      ctx.font = `600 36px ${sans}`;
      ctx.letterSpacing = "6px";
      ctx.fillText([product.region, vintageLabel(product)].filter(Boolean).join(" · ").toUpperCase(), W / 2, H * 0.86);

      // Bake the curve into the paper: darker where the label turns away, a soft sheen near the light.
      ctx.letterSpacing = "0px";
      const curve2 = ctx.createLinearGradient(0, 0, W, 0);
      curve2.addColorStop(0, "rgba(31,27,22,0.34)");
      curve2.addColorStop(0.22, "rgba(255,255,255,0.10)");
      curve2.addColorStop(0.42, "rgba(255,255,255,0)");
      curve2.addColorStop(0.8, "rgba(31,27,22,0.10)");
      curve2.addColorStop(1, "rgba(31,27,22,0.38)");
      ctx.fillStyle = curve2;
      ctx.fillRect(0, 0, W, H);
      const tex = keep(new THREE.CanvasTexture(canvas));
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const label = new THREE.Mesh(
        keep(new THREE.CylinderGeometry(P.r + 0.004, P.r + 0.004, lh, 96, 1, true, -ARC / 2, ARC)),
        keep(new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })),
      );
      label.position.y = y0 + lh / 2;
      bottle.add(label);

      // Soft contact shadow.
      const sc = document.createElement("canvas");
      sc.width = sc.height = 128;
      const sctx = sc.getContext("2d")!;
      const g = sctx.createRadialGradient(64, 64, 4, 64, 64, 64);
      g.addColorStop(0, "rgba(31,27,22,0.45)");
      g.addColorStop(1, "rgba(31,27,22,0)");
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, 128, 128);
      const shadow = new THREE.Mesh(
        keep(new THREE.PlaneGeometry(P.r * 4.2, P.r * 1.6)),
        keep(new THREE.MeshBasicMaterial({ map: keep(new THREE.CanvasTexture(sc)), transparent: true, depthWrite: false })),
      );
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.002;
      scene.add(shadow);

      // Sizing.
      const resize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Keep the whole bottle in frame on narrow boxes.
        const fit = (height + 1.6) / (2 * Math.tan((camera.fov * Math.PI) / 360));
        camera.position.z = Math.max(fit, fit / Math.min(1, camera.aspect / 0.62));
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();

      // Drag to turn (upright axis only), with a little inertia.
      let angle = reduced ? 0.22 : -1.4; // intro: one short turn to the front, unless reduced motion
      let target = 0.22;
      let velocity = 0;
      let dragging = false;
      let lastX = 0;
      const canvasEl = renderer.domElement;
      const onDown = (e: PointerEvent) => {
        dragging = true;
        lastX = e.clientX;
        velocity = 0;
        canvasEl.setPointerCapture(e.pointerId);
        el.classList.add("is-grabbing");
      };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        velocity = dx * 0.012;
        target += velocity;
      };
      const onUp = () => {
        dragging = false;
        el.classList.remove("is-grabbing");
      };
      canvasEl.addEventListener("pointerdown", onDown);
      canvasEl.addEventListener("pointermove", onMove);
      canvasEl.addEventListener("pointerup", onUp);
      canvasEl.addEventListener("pointercancel", onUp);
      turn.current = (d: number) => (target += d);

      // Render only while visible.
      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(el);
      let raf = 0;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visible || document.hidden) return;
        if (!dragging && Math.abs(velocity) > 0.0005) {
          target += velocity;
          velocity *= reduced ? 0 : 0.92;
        }
        angle += (target - angle) * (reduced ? 1 : 0.1);
        bottle.rotation.y = angle;
        renderer.render(scene, camera);
      };
      tick();
      setReady(true);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        canvasEl.removeEventListener("pointerdown", onDown);
        canvasEl.removeEventListener("pointermove", onMove);
        canvasEl.removeEventListener("pointerup", onUp);
        canvasEl.removeEventListener("pointercancel", onUp);
        disposables.forEach((d) => d.dispose());
        renderer.dispose();
        canvasEl.remove();
      };
    })().catch((err) => {
      console.warn("3D bottle unavailable, showing the flat bottle:", err);
      setFailed(true);
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [product]);

  return (
    <>
      <div
        ref={box}
        className={`bottle3d ${ready ? "is-ready" : ""}`}
        role="img"
        aria-label={`${product.title}, a 3D bottle you can turn`}
      />
      {!ready && <BottleShot product={product} className="shot-large" />}
      {ready && !failed && (
        <div className="turn">
          <button type="button" onClick={() => turn.current(-Math.PI / 4)} aria-label="Turn the bottle left">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <span>Drag to turn</span>
          <button type="button" onClick={() => turn.current(Math.PI / 4)} aria-label="Turn the bottle right">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
