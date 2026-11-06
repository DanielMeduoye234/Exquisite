import type { CSSProperties } from "react";
import { vintageLabel } from "@/lib/format";
import type { Product } from "@/lib/types";

const LOGO_LABEL = "The Exquisite Wine Experience, by Vitalita";

// Dawn: snippets/wordmark.liquid.
export function Wordmark({ layout = "stacked" }: { layout?: "stacked" | "horizontal" }) {
  if (layout === "horizontal") {
    return (
      <span className="wm-h" role="img" aria-label={LOGO_LABEL}>
        <b>
          <span className="wm-x">The </span>Exquisite<span className="wm-x"> Wine Experience</span>
        </b>
        <i>by Vitalita</i>
      </span>
    );
  }
  return (
    <span className="wm" role="img" aria-label={LOGO_LABEL}>
      <small>The</small>
      <b>Exquisite</b>
      <small>Wine Experience</small>
      <i>by Vitalita</i>
    </span>
  );
}

export function Monogram({ size = 36 }: { size?: number }) {
  return (
    <span className="mono" role="img" aria-label="Exquisite" style={{ "--m": `${size}px` } as CSSProperties}>
      E
    </span>
  );
}

/* ---------- Rendered bottle packshot ----------
   Stands in for product photography until the client supplies it (a real image_url replaces it).
   Each wine type gets its own bottle shape and glass; the label carries the wine's own name, never
   another winery's. Dawn: snippets/bottle-shot.liquid (inline SVG). */

type Shape = {
  body: string;
  capsule: { x: number; y: number; w: number; h: number };
  label: { x: number; y: number; w: number; h: number };
};

const SHAPES: Record<"bordeaux" | "burgundy" | "champagne" | "dessert" | "grappa", Shape> = {
  bordeaux: {
    body: "M67 16H93V170C93 196 136 200 136 230V488Q136 500 124 500H36Q24 500 24 488V230C24 200 67 196 67 170Z",
    capsule: { x: 66, y: 14, w: 28, h: 74 },
    label: { x: 30, y: 292, w: 100, h: 128 },
  },
  burgundy: {
    body: "M68 16H92V140C92 210 140 230 140 290V488Q140 500 128 500H32Q20 500 20 488V290C20 230 68 210 68 140Z",
    capsule: { x: 67, y: 14, w: 26, h: 74 },
    label: { x: 27, y: 318, w: 106, h: 120 },
  },
  champagne: {
    body: "M66 10H94V120C94 200 144 225 144 290V486Q144 500 130 500H30Q16 500 16 486V290C16 225 66 200 66 120Z",
    capsule: { x: 64, y: 8, w: 32, h: 132 },
    label: { x: 24, y: 322, w: 112, h: 104 },
  },
  dessert: {
    body: "M70 46H90V190C90 215 124 222 124 250V490Q124 500 114 500H46Q36 500 36 490V250C36 222 70 215 70 190Z",
    capsule: { x: 69, y: 44, w: 22, h: 64 },
    label: { x: 41, y: 300, w: 78, h: 120 },
  },
  grappa: {
    body: "M70 120H90V200C90 230 138 240 138 300V486Q138 500 124 500H36Q22 500 22 486V300C22 240 70 230 70 200Z",
    capsule: { x: 64, y: 84, w: 32, h: 42 },
    label: { x: 33, y: 330, w: 94, h: 102 },
  },
};

const TYPE_SHOT: Record<Product["type"], { shape: keyof typeof SHAPES; glass: string; foil: string }> = {
  Red: { shape: "bordeaux", glass: "shot-red", foil: "#6E1E2B" },
  White: { shape: "burgundy", glass: "shot-white", foil: "#B89B4A" },
  Sparkling: { shape: "champagne", glass: "shot-sparkling", foil: "#C7A95A" },
  Rosé: { shape: "bordeaux", glass: "shot-rose", foil: "#D9B9B0" },
  Dessert: { shape: "dessert", glass: "shot-dessert", foil: "#6B3A18" },
  Spirits: { shape: "grappa", glass: "shot-spirits", foil: "#7A5A3A" },
};

// Breaks a title into at most `max` lines of about `width` characters.
function wrap(text: string, width: number, max: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ")) {
    if (line && (line + " " + word).length > width) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  if (lines.length > max) {
    lines.length = max;
    lines[max - 1] = lines[max - 1].replace(/\s*\S*$/, "") + "…";
  }
  return lines;
}

export function BottleShot({ product, className = "" }: { product: Product; className?: string }) {
  const t = TYPE_SHOT[product.type];
  const s = SHAPES[t.shape];
  const { x, y, w, h } = s.label;
  const cx = x + w / 2;
  const lines = wrap(product.title.replace(/^['‘’]|['‘’]$/g, "").replace(/['‘’]/g, ""), Math.round(w / 7.6), 3);
  const meta = [product.region, vintageLabel(product)].filter(Boolean).join(" · ");
  const titleTop = y + h / 2 - (lines.length - 1) * 6.5 + 2;

  return (
    <svg className={`shot ${className}`} viewBox="0 0 160 520" preserveAspectRatio="xMidYMax meet" aria-hidden="true" focusable="false">
      <ellipse className="shot-shadow" cx="80" cy="505" rx="58" ry="7" />
      <g className="shot-bottle">
        <path d={s.body} fill={`url(#${t.glass})`} />
        {t.shape === "grappa" ? (
          <>
            <rect x={s.capsule.x} y={s.capsule.y} width={s.capsule.w} height={s.capsule.h} rx="3" fill={t.foil} />
            <rect x={s.capsule.x + 6} y={s.capsule.y - 20} width={s.capsule.w - 12} height="22" rx="8" fill="#5A3E26" />
          </>
        ) : (
          <rect x={s.capsule.x} y={s.capsule.y} width={s.capsule.w} height={s.capsule.h} rx="2" fill={t.foil} />
        )}
        <rect x={s.capsule.x} y={s.capsule.y} width={s.capsule.w} height={s.capsule.h} fill="url(#shot-shine)" />
        <rect x={x} y={y} width={w} height={h} fill="#F3ECDD" />
        <rect x={x + 4} y={y + 4} width={w - 8} height={h - 8} fill="none" stroke="#B9AB90" strokeWidth=".6" />
        <text className="shot-vendor" x={cx} y={y + 20} textAnchor="middle">
          {product.vendor.length > 18 ? product.vendor.slice(0, 17) + "…" : product.vendor}
        </text>
        <line x1={cx - 8} x2={cx + 8} y1={y + 30} y2={y + 30} stroke="#8A7D68" strokeWidth=".6" />
        <text className="shot-title" x={cx} y={titleTop} textAnchor="middle">
          {lines.map((l, i) => (
            <tspan key={i} x={cx} dy={i === 0 ? 0 : 13}>
              {l}
            </tspan>
          ))}
        </text>
        <text className="shot-meta" x={cx} y={y + h - 13} textAnchor="middle">
          {meta}
        </text>
        <rect x={x} y={y} width={w} height={h} fill="url(#shot-shine)" />
      </g>
    </svg>
  );
}

// Shared gradients for every BottleShot on the page, rendered once in the layout.
export function ShotDefs() {
  const glass = (id: string, dark: string, mid: string, hi: string) => (
    <linearGradient id={id} x1="0" x2="1">
      <stop offset="0" stopColor={dark} />
      <stop offset=".16" stopColor={mid} />
      <stop offset=".26" stopColor={hi} />
      <stop offset=".33" stopColor={mid} />
      <stop offset=".78" stopColor={dark} />
      <stop offset="1" stopColor={mid} />
    </linearGradient>
  );
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        {glass("shot-red", "#0B110C", "#1F2B22", "#6F7F72")}
        {glass("shot-white", "#3A421C", "#7A8540", "#E3E7BE")}
        {glass("shot-sparkling", "#080D09", "#18231A", "#5E6E61")}
        {glass("shot-rose", "#C9776B", "#EBA99D", "#FFF1EC")}
        {glass("shot-dessert", "#3E1A06", "#8A4513", "#F0C48A")}
        {glass("shot-spirits", "#9A5E1E", "#D69A4E", "#FFF2D9")}
        <linearGradient id="shot-shine" x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity=".22" />
          <stop offset=".25" stopColor="#fff" stopOpacity=".18" />
          <stop offset=".45" stopColor="#fff" stopOpacity="0" />
          <stop offset=".85" stopColor="#000" stopOpacity=".12" />
          <stop offset="1" stopColor="#000" stopOpacity=".3" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const SCALES = [
  { key: "body", name: "Body", ends: ["Light", "Full"] },
  { key: "acidity", name: "Acidity", ends: ["Soft", "Crisp"] },
  { key: "sweetness", name: "Sweetness", ends: ["Dry", "Sweet"] },
] as const;

const describe = (v: number, [lo, hi]: readonly [string, string]) =>
  v <= 2 ? lo.toLowerCase() : v >= 4 ? hi.toLowerCase() : "medium";

// Five-segment bars. Acidity doesn't apply to spirits, so it's left out for them.
export function TasteProfile({ product, ends = false }: { product: Product; ends?: boolean }) {
  const rows = SCALES.filter((s) => !(product.type === "Spirits" && s.key === "acidity"));
  return (
    <dl className={`taste ${ends ? "taste-ends" : ""}`}>
      {rows.map((s) => {
        const v = product[s.key];
        return (
          <div key={s.key} role="img" aria-label={`${s.name}: ${v} of 5, ${describe(v, s.ends)}`}>
            <dt>{s.name}</dt>
            <dd>
              {ends && <span className="taste-end">{s.ends[0]}</span>}
              <span className="taste-bar">
                {[1, 2, 3, 4, 5].map((k) => (
                  <i key={k} className={k <= v ? "on" : undefined} />
                ))}
              </span>
              {ends && <span className="taste-end">{s.ends[1]}</span>}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
