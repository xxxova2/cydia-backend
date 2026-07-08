# 3D / Depth Design Upgrade — Implementation Plan

**Scope:** Plan only. No code written yet. Execute against this spec.
**Stack (verified from repo):** React 19.0.1, Vite 6.2.3, TypeScript 5.8, Tailwind v4 (`@theme` in `src/index.css`, `--color-primary: #3d8a5e`), `motion@12.42.2` imported via `motion/react` (confirmed by `AdminDashboard.tsx`). `lucide-react` installed. Site is RTL: `index.html` has `<html lang="ar" dir="rtl">`, font IBM Plex Sans Arabic. `main.tsx` wraps App in `<StrictMode>`. No SSR. No dark-mode toggle exists; primary color is static `#3d8a5e`. No `prefers-reduced-motion` handling yet.

---

## 0. Design tokens to add (in `src/index.css` `@theme`)
Add once, reuse everywhere:
- `--color-primary-soft: #3d8a5e1a` (10% alpha for glass/glow)
- `--ease-spring: cubic-bezier(0.16, 1, 0.3, 1)` (used for tilt snap-back + reveals)
No new deps for Tier A.

---

## 1. `motion/react` API usage (v12 — correct import paths & names)

All Tier A motion work imports from `motion/react`:
```ts
import {
  motion,            // motion.div, motion.section, motion.span
  useScroll,         // ({ target, offset }) => { scrollYProgress }
  useTransform,      // map motion value ranges
  useMotionValue,    // useMotionValue(0)
  useSpring,         // useSpring(mv, { stiffness, damping })
  useReducedMotion,  // () => boolean | null  — gate ALL animation
} from "motion/react";
```
- `AnimatePresence` not needed for Tier A.
- Reveal = `motion.div` with `whileInView` + `viewport={{ once: true, margin: "0px 0px -15% 0px" }}`.
- Tilt = `motion.div` driven by `style={{ rotateX, rotateY }}` where rotateX/rotateY are `useSpring`(useMotionValue).
- Orbs = `motion.div` with `animate={{ ... }}` infinite loop.

### (a) whileInView scroll reveal
```ts
// spec only — concrete values
<motion.div
  initial={{ opacity: 0, y: 32, scale: 0.98 }}
  whileInView={{ opacity: 1, y: 0, scale: 1 }}
  viewport={{ once: true, margin: "0px 0px -12% 0px" }}
  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
>
```
- Use `once: true` so it doesn't re-run on scroll-up (cheaper, no scroll listener churn).
- Stagger children: parent sets `transition={{ staggerChildren: 0.08 }}`; children use `variants` with `hidden`/`show` and `initial="hidden" whileInView="show"`.
- RTL note: translate on `y` only (vertical) — never on `x`, so RTL layout is unaffected.

### (b) Mouse-driven tilt (useMotionValue + useTransform + spring + perspective)
```ts
// TiltCard internals — math spec
const px = useMotionValue(0);   // -0.5 .. 0.5 (cursor offset from card center, normalized)
const py = useMotionValue(0);
const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [intensity, -intensity]), SPRING);
const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-intensity, intensity]), SPRING);
const glareX  = useTransform(px, [-0.5, 0.5], ["0%", "100%"]);
const glareY  = useTransform(py, [-0.5, 0.5], ["0%", "100%"]);
// SPRING = { stiffness: 200, damping: 20, mass: 0.4 } (snappy, no jitter)
```
- `intensity` default `8` (degrees). Outer wrapper holds `style={{ perspective: 1000 }}`. Inner `motion.div` holds `style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}`.
- RTL note: rotateY sign is mirrored for RTL vs LTR cursor feel. Compute `dir = document.dir === "rtl" ? -1 : 1` and multiply the rotateY output by `dir` so the card "leans toward" the cursor in both directions. (Cursor at visual-right = positive local x in LTR; in RTL the same visual position is negative x. Mirror the sign.)

### (c) Drifting orbs (animate loop)
```ts
<motion.div
  className="absolute ... blur-3xl rounded-full bg-primary/30"
  animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.15, 0.95, 1] }}
  transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
/>
```
- 2–3 orbs, different durations (14s/18s/22s) and offsets so they don't sync.
- Each orb `position: absolute`, `filter: blur(80px)`, `will-change: transform`, `transform-gpu`.
- Respect reduced motion: if `useReducedMotion()` → render orbs static (no `animate`).

---

## 2. `TiltCard.tsx` component spec

**File:** `src/components/TiltCard.tsx` (new)
**Props:**
```ts
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;       // merged onto inner card
  intensity?: number;       // deg, default 8
  glare?: boolean;          // default true
  as?: "div" | "a";         // Portfolio links are <a>; default "div"
}
```
**Behavior:**
- Outer wrapper `<div style={{ perspective: 1000 }}>`. Pointer events here.
- `onPointerMove(e)`: `rect = ref.getBoundingClientRect()`; `px.set((e.clientX - rect.left)/rect.width - 0.5)`; `py.set((e.clientY - rect.top)/rect.height - 0.5)`.
- `onPointerLeave`: `px.set(0); py.set(0)` (spring eases back to flat).
- Inner `motion.{as}` gets `style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}` + `className` + `transform-gpu will-change-transform`.
- **Glare overlay:** absolutely-positioned `<motion.div>` child with `style={{ background: useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,0.35), transparent 60%)` }}` (import `useMotionTemplate`), `pointer-events-none`, `mix-blend-overlay`, rounded matching card. Hidden when `useReducedMotion()`.
- **RTL-safe / no layout shift:** card size is fixed by parent grid; tilt uses 3D transform only — never `margin`/`left`/`right`, so no reflow. Set `dir="rtl"` inherited from `<html>`; do not force LTR.
- **Touch fallback:** `onPointerMove` from Pointer Events covers touch, but tilt on touch is jarring — gate by `if (e.pointerType === "touch") return;` in the handler (still allow tap/scroll). Add `onPointerLeave`/`onPointerCancel` reset.
- **Pointer-events:** glare + any inner interactive (links) must keep `pointer-events` usable. Keep `pointer-events-none` ONLY on the glare layer; the card body stays interactive. For Portfolio the inner element is `<a>` so links keep working.
- **Reduced motion:** if `useReducedMotion()` → render a plain `<div>`/`<a>` with no motion values, no glare.
- **Perf:** `transform-gpu` + `will-change-transform` on inner card. `useSpring` dedupes renders (no React re-render per mousemove — values flow straight to DOM via Motion's renderer).

**Integration:**
- `Portfolio.tsx`: wrap each project card `<a>` in `<TiltCard as="a" href={...} className="...">`. Move the existing `bg-white rounded-xl shadow-md hover:shadow-lg border-...` classes onto TiltCard's inner element.
- `Services.tsx`: replace the static `bg-white/70 backdrop-blur-xl rounded-xl` div with `<TiltCard className="bg-white/70 backdrop-blur-xl rounded-xl p-6 ...">`.

---

## 3. Hero parallax + perspective-tilt spec

**File:** `src/components/Hero.tsx` (rewrite the `<section>` inner block)
**Layer stack (back → front):**
1. Background orbs (3 × `motion.div`, spec §1c) inside an `absolute inset-0 overflow-hidden -z-10` container. Keeps hero depth without blocking text.
2. Optional subtle parallax: `const { scrollYProgress } = useScroll()`; `const y = useTransform(scrollYProgress, [0,1], [0, 80])`; apply to orb container `style={{ y }}` so orbs drift up slower than scroll. Gate with reduced-motion + only while hero in view (cheap because transform-only).
3. Foreground content: wrap the `max-w-3xl` text block in `<motion.div>` with `style={{ rotateX, rotateY }}` + `perspective: 1000` on the section, so the whole headline block tilts toward the cursor (intensity ~5°, gentler than cards).
4. Scroll reveal: the badge/headline/paragraph/buttons each get a staggered `initial/whileInView` (§1a) with `transition={{ staggerChildren }}` on parent.

**Concrete transform values:**
- Perspective: `style={{ perspective: 1200 }}` on the section (or a dedicated wrapper).
- Headline tilt: `rotateX ∈ [-5,5]°`, `rotateY ∈ [-5,5]°` (mirror rotateY by RTL dir, §1b).
- Orb drift loop: `x ∈ [-20,40]px`, `y ∈ [-30,20]px`, `scale ∈ [0.95,1.15]`, `duration 16–22s`.
- All motion layers: `transform-gpu will-change-transform`.
- Orbs: `filter: blur(80px)`, `opacity ~0.3`, `bg-primary/30` + one `bg-[#7fd1a0]/20` accent for variation.

**RTL correctness:** Hero is `text-center`, so tilt direction is symmetric — only the rotateY *cursor* mapping needs the RTL sign mirror (§1b). No `x`-translate reveals. Keep `dir="rtl"` inherited.

**Perf:** limit orbs to 3; `will-change-transform` auto-removed by Motion after animation settles? No — for infinite loops keep `will-change` but it's GPU-only, fine. Throttle nothing (Motion handles rAF). Disable parallax+tilt entirely under reduced motion.

---

## 4. Tier B — Lazy WebGL hero (optional, NEW deps)

**Deps to add:**
```
npm i three @react-three/fiber @react-three/drei
npm i -D @types/three
```
- Versions compatible with React 19: `@react-three/fiber@^9` (R3F v9 is the React-19 line), `@react-three/drei@^10`, `three@^0.169+`. Verify peer ranges at install; if R3F v9 not resolved, use `@react-three/fiber@^9.0.0` explicitly.
- Bundle: three ~150KB gzipped (within target). Keep `@react-three/drei` imports minimal — import only `<OrbitControls>`/`<Float>`/`<MeshDistortMaterial>` what you use; drei is tree-shakeable.

**Setup:**
1. New `src/components/WebGLHero.tsx`:
   - `export default function WebGLHero()` returns `<Canvas>` with `camera={{ position:[0,0,5], fov:45 }}`, `dpr={[1,2]}`, `gl={{ antialias:true, alpha:true }}`.
   - Scene: `<Float>` (from drei) wrapping a `<mesh>` with `<icosahedronGeometry args={[1.4, 1]} />` + `<meshStandardMaterial wireframe color={PRIMARY} />`, OR a `torusKnotGeometry`. Slow auto-rotate via `useFrame(({clock}) => mesh.rotation.y = clock.elapsedTime * 0.2)`.
   - Mouse reactivity: track pointer with `useMotionValue` (reuse Tier A values) → `useTransform` to rotation, applied in `useFrame`; OR drei `<OrbitControls enableZoom={false} enablePan={false} autoRotate />` (simplest, but captures pointer — conflicts with scroll on mobile; prefer manual useFrame rotation toward mouse).
2. Primary color feed: read CSS var `getComputedStyle(document.documentElement).getPropertyValue('--color-primary')` once into a `useMemo` (or hardcode `"#3d8a5e"`). Pass to `color={primary}`. Since there's **no theme switch**, a static const is fine; if a theme is added later, lift color to context.
3. Lazy mount in `Hero.tsx`:
   ```ts
   const WebGLHero = lazy(() => import("./WebGLHero"));
   // in JSX, behind Suspense, behind a "mounted" flag:
   {show3D && <Suspense fallback={<StaticGradient/>}><WebGLHero/></Suspense>}
   ```
   - `show3D = !prefersReducedMotion && !isMobileSlow` (gate on `useReducedMotion()` + a `matchMedia("(pointer: coarse)")` / small-screen check).
   - `Suspense fallback` = the Tier A orb/gradient block so first paint shows depth instantly and the canvas swaps in when chunk arrives (never blocks first paint).
   - Position `<Canvas>` as `absolute inset-0 -z-10 pointer-events-none` so it sits behind text and doesn't eat scroll/tap. Manual mouse-rotation reads `window` pointer, not canvas pointer, so `pointer-events-none` is safe.

**Pitfalls (Tier B):**
- **StrictMode double-mount (React 19):** R3F `Canvas` mounts WebGL context twice in dev StrictMode → "too many WebGL contexts" warnings. R3F v9 handles cleanup correctly; ensure no manual `useEffect` that creates contexts. If warnings appear, the context is disposed on unmount — fine in prod (no double mount).
- **Canvas resize:** `<Canvas>` auto-resizes via ResizeObserver. Keep parent `position: relative` with explicit height (e.g. hero `min-h-[80vh]`); don't let canvas collapse to 0.
- **Mobile perf:** cap `dpr={[1, 1.5]}`, `frameloop="demand"` if only rotating on mouse (but we auto-rotate → keep `"always"` but gate whole hero off on coarse pointer). Provide fallback for `WebGL` unsupported (try/catch or feature check).
- **Bundle size:** confirm `three` is in its own lazy chunk (Vite splits `import()` automatically). Verify with `vite build` + inspect `dist/assets` — three should NOT be in the main entry chunk.
- **prefers-reduced-motion:** if set, never render `<Canvas>` at all (return static fallback).
- **RTL:** WebGL scene is LTR-internal but visually centered/symmetric; no text inside canvas, so RTL is irrelevant. Keep canvas `dir="ltr"` to avoid any inherited text-direction edge cases.

---

## 5. Respecting `prefers-reduced-motion` (both tiers)

Single source of truth: `const reduce = useReducedMotion();` (from `motion/react`) in every animated component.
- **Tier A:**
  - TiltCard: if `reduce` → render static `<div>/<a>`, skip motion values + glare.
  - Hero tilt/orbs/parallax: if `reduce` → orbs render static (no `animate`), no `rotateX/rotateY` binding, no scroll `y`.
  - Scroll reveals: if `reduce` → `initial={false}` and render at final state (no translate/fade). Easiest: `initial={reduce ? false : {...}}`.
- **Tier B:** if `reduce` → never lazy-load Canvas; render static gradient fallback only.
- Also add a global CSS safety net in `index.css`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
  }
  ```
  (Covers the existing `animate-spin` etc. too.)

---

## 6. Build order & ship decision

**Ship Tier A by default.** Tier B is opt-in behind a flag/probe; do not block first release on it.

Recommended order (each step independently verifiable):
1. Add design tokens to `index.css` `@theme` (§0) + reduced-motion CSS safety net (§5).
2. `TiltCard.tsx` (§2) — pure, testable; wrap Services cards first (simplest), then Portfolio.
3. Scroll reveals (§1a) on Portfolio, Services, ContactForm section headers + staggered grids.
4. Hero rework (§3): orbs + headline tilt + staggered reveal.
5. Reduced-motion passes across all of the above (§5).
6. *(Optional, separate PR)* Tier B: `WebGLHero.tsx` + lazy mount + perf gating (§4). Keep behind `?webgl=1` or a config flag until validated on mobile.

**Default ship = Tier A only.** Tier B merged only after bundle/chunk check (§4) and a real mobile perf pass.

---

## Verification checklist (post-implementation)
- `npm run lint` (tsc --noEmit) clean.
- `npm run build` succeeds; confirm `three` (if added) is in a lazy chunk, not entry.
- Manual: tilt follows cursor in both LTR-test and RTL; no layout shift; orbs drift; reveals fire once on scroll-in; toggle OS "reduce motion" → all animation stops, content fully visible.
- Mobile (coarse pointer): tilt disabled, orbs static or Canvas absent, scroll smooth.
