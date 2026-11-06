"use client";

import { useEffect, useRef, useState } from "react";
import { ProductImage } from "./ProductCard";
import type { Product } from "@/lib/types";

/* 3D feel for a real product photo on the product page.
   The bottle's outline is read from the photo's transparency, row by row, and turned on a lathe into a bottle with
   exactly that silhouette. The photo is projected onto the front, so the label and glass are the real ones; a shading
   layer and a glossy reflection layer move with the light as it turns. A photo only shows the front, so turning is
   limited to about ±35°. Falls back to the flat photo when WebGL is missing or the photo has a background.
   Dawn: a custom element in assets/exq-bottle-3d.js, fed the product's featured image. */

const LIMIT = 0.5; // radians either side of the front
const FLASKS = new Set(["villa-de-varda-grappa-vecchia-riserva-vibrazioni", "villa-de-varda-grappa-stravecchia-anniversario"]);

export function PhotoBottle3D({ product }: { product: Product }) {
  const box = useRef<HTMLDivElement>(null);
  const turn = useRef<(d: number) => void>(() => {});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el || !product.image_url) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const probe = document.createElement("canvas");
      if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return;

      const img = new Image();
      img.src = product.image_url!;
      await img.decode();
      if (disposed) return;

      // Read the silhouette from the alpha channel.
      const W = img.naturalWidth;
      const H = img.naturalHeight;
      const c = document.createElement("canvas");
      c.width = W;
      c.height = H;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.drawImage(img, 0, 0);
      const px = ctx.getImageData(0, 0, W, H).data;
      const a = (x: number, y: number) => px[(y * W + x) * 4 + 3];
      // A photo that kept its background (opaque corners) can't be shaped: stay flat.
      if ([a(0, 0), a(W - 1, 0), a(0, H - 1), a(W - 1, H - 1)].filter((v) => v > 200).length >= 2) return;

      const ROWS = 180;
      const rows: { y: number; l: number; r: number }[] = [];
      for (let i = 0; i <= ROWS; i++) {
        const y = Math.round((i * (H - 1)) / ROWS);
        let l = -1;
        let r = -1;
        for (let x = 0; x < W; x++) if (a(x, y) > 110) { l = x; break; }
        for (let x = W - 1; x >= 0; x--) if (a(x, y) > 110) { r = x; break; }
        rows.push({ y, l, r });
      }
      const widths = rows.map((r) => (r.l < 0 ? 0 : r.r - r.l));
      const maxW = Math.max(...widths);
      const centres = rows.filter((r, i) => widths[i] > maxW * 0.6).map((r) => (r.l + r.r) / 2).sort((p, q) => p - q);
      const cx = centres[Math.floor(centres.length / 2)] ?? W / 2;
      // Half-widths, lightly smoothed; never zero so the neck stays closed.
      const half = widths.map((w, i) => {
        const n = [widths[i - 1] ?? w, w, widths[i + 1] ?? w];
        return Math.max(1.5, (n[0] + n[1] * 2 + n[2]) / 8);
      });

      const THREE = await import("three");
      const { RoomEnvironment } = await import("three/examples/jsm/environments/RoomEnvironment.js");
      if (disposed) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const HEIGHT = 4;
      const s = HEIGHT / H; // pixels to scene units
      const pts = [new THREE.Vector2(0.0005, 0)];
      for (let i = ROWS; i >= 0; i--) pts.push(new THREE.Vector2(half[i] * s, (H - rows[i].y) * s));
      pts.push(new THREE.Vector2(0.0005, HEIGHT));
      const geo = new THREE.LatheGeometry(pts, 128);
      // Project the photo straight on from the front.
      const pos = geo.attributes.position;
      const uv = geo.attributes.uv;
      for (let k = 0; k < pos.count; k++) uv.setXY(k, (cx + (pos.getX(k) / s) * 0.96) / W, pos.getY(k) / HEIGHT); // 0.96: sample inside the soft cut edge
      uv.needsUpdate = true;
      geo.computeVertexNormals();

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = env;
      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const key = new THREE.DirectionalLight(0xffffff, 0.55);
      key.position.set(-3, 2, 4);
      scene.add(key);

      const tex = new THREE.Texture(img);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      tex.needsUpdate = true;

      // The photo's transparency as a mask (alphaMap reads green), so the light layers stop at the bottle's edge.
      const m = document.createElement("canvas");
      m.width = W;
      m.height = H;
      const mctx = m.getContext("2d")!;
      const mask = mctx.createImageData(W, H);
      for (let i = 0; i < W * H; i++) {
        const v = px[i * 4 + 3];
        mask.data[i * 4] = mask.data[i * 4 + 1] = mask.data[i * 4 + 2] = v;
        mask.data[i * 4 + 3] = 255;
      }
      mctx.putImageData(mask, 0, 0);
      const maskTex = new THREE.CanvasTexture(m);

      const bottle = new THREE.Group();
      if (FLASKS.has(product.handle)) bottle.scale.z = 0.5;
      scene.add(bottle);

      // 1. The photo itself, unlit, so the label colours stay true.
      const photo = new THREE.MeshBasicMaterial({ map: tex, alphaTest: 0.5, toneMapped: false });
      bottle.add(new THREE.Mesh(geo, photo));
      // 2. Shading that follows the light: multiplies the photo darker on the side turning away.
      const shade = new THREE.MeshLambertMaterial({
        color: 0xffffff, alphaMap: maskTex, alphaTest: 0.5, transparent: true, premultipliedAlpha: true, blending: THREE.MultiplyBlending,
        depthWrite: false, depthFunc: THREE.LessEqualDepth,
      });
      const shadeMesh = new THREE.Mesh(geo, shade);
      shadeMesh.renderOrder = 1;
      bottle.add(shadeMesh);
      // 3. Glass reflections: a black mirror added on top, so only the highlights show.
      const gloss = new THREE.MeshStandardMaterial({
        color: 0x000000, metalness: 1, roughness: 0.14, envMapIntensity: 0.75, alphaMap: maskTex, alphaTest: 0.5,
        transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthFunc: THREE.LessEqualDepth,
      });
      const glossMesh = new THREE.Mesh(geo, gloss);
      glossMesh.renderOrder = 2;
      bottle.add(glossMesh);

      // Soft contact shadow.
      const sc = document.createElement("canvas");
      sc.width = sc.height = 128;
      const sctx = sc.getContext("2d")!;
      const g = sctx.createRadialGradient(64, 64, 4, 64, 64, 64);
      g.addColorStop(0, "rgba(31,27,22,0.4)");
      g.addColorStop(1, "rgba(31,27,22,0)");
      sctx.fillStyle = g;
      sctx.fillRect(0, 0, 128, 128);
      const shadowTex = new THREE.CanvasTexture(sc);
      const shadowGeo = new THREE.PlaneGeometry((maxW * s) * 2.2, (maxW * s) * 0.7);
      const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.rotation.x = -Math.PI / 2;
      shadow.position.y = 0.002;
      scene.add(shadow);

      const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
      const centre = HEIGHT * 0.5 - 0.1;
      const resize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        const fitH = (HEIGHT * 1.16) / (2 * Math.tan((camera.fov * Math.PI) / 360));
        const fitW = (maxW * s * 1.5) / (2 * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect);
        camera.position.set(0, centre + 0.25, Math.max(fitH, fitW));
        camera.lookAt(0, centre, 0);
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();

      // Turn on the upright axis only, within ±LIMIT, with a little momentum.
      let angle = reduced ? 0 : -0.45;
      let target = reduced ? 0 : 0.18;
      let velocity = 0;
      let dragging = false;
      let lastX = 0;
      let startX = 0;
      let startY = 0;
      let horizontal: boolean | null = null;
      const clamp = (v: number) => Math.max(-LIMIT, Math.min(LIMIT, v));
      const canvasEl = renderer.domElement;
      const onDown = (e: PointerEvent) => {
        dragging = true;
        horizontal = e.pointerType === "mouse" ? true : null;
        lastX = startX = e.clientX;
        startY = e.clientY;
        velocity = 0;
        if (horizontal) canvasEl.setPointerCapture(e.pointerId);
        el.classList.add("is-grabbing");
      };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        if (horizontal === null) {
          const dx = Math.abs(e.clientX - startX);
          const dy = Math.abs(e.clientY - startY);
          if (dx + dy < 6) return;
          horizontal = dx > dy;
          if (horizontal) canvasEl.setPointerCapture(e.pointerId);
        }
        if (!horizontal) return;
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        velocity = reduced ? 0 : dx * 0.008;
        target = clamp(target + dx * 0.008);
      };
      const onUp = () => {
        dragging = false;
        el.classList.remove("is-grabbing");
      };
      canvasEl.addEventListener("pointerdown", onDown);
      canvasEl.addEventListener("pointermove", onMove);
      canvasEl.addEventListener("pointerup", onUp);
      canvasEl.addEventListener("pointercancel", onUp);
      turn.current = (d: number) => (target = clamp(target + d));

      let visible = true;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
      io.observe(el);
      let raf = 0;
      const tick = () => {
        raf = requestAnimationFrame(tick);
        if (!visible || document.hidden) return;
        if (!dragging && Math.abs(velocity) > 0.0005) {
          target = clamp(target + velocity);
          velocity *= 0.9;
        }
        angle += (target - angle) * (reduced ? 1 : 0.09);
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
        [geo, tex, maskTex, env, pmrem, photo, shade, gloss, shadowTex, shadowGeo, shadowMat].forEach((d) => d.dispose());
        renderer.dispose();
        canvasEl.remove();
      };
    })().catch((err) => console.warn("3D photo unavailable, showing the flat photo:", err));

    return () => {
      disposed = true;
      cleanup();
    };
  }, [product]);

  return (
    <>
      {!ready && <ProductImage product={product} size="large" priority />}
      <div ref={box} className={`bottle3d photo3d ${ready ? "is-ready" : ""}`} role="img" aria-label={`${product.title}, a bottle you can turn`} />
      {ready && (
        <div className="turn">
          <button type="button" onClick={() => turn.current(-0.3)} aria-label="Turn the bottle left">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <span>Drag to turn</span>
          <button type="button" onClick={() => turn.current(0.3)} aria-label="Turn the bottle right">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
