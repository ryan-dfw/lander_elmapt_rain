import { useEffect, useLayoutEffect, useRef } from "react";
import "../styles/theme.css"

export type Theme = {
    base: string;
    c1: string; c1a: number;
    c2: string; c2a: number;
    c3: string; c3a: number;
    text: string;
};

export const theme: Theme = {
    base: "#070c14",
    c1: "#1e3a8a", c1a: 0.18,
    c2: "#0f172a", c2a: 0.22,
    c3: "#0c0132", c3a: 0.10,
    text: "#dbe3ee",
};

const toRgb = (hex: string) => {
    const h = hex.replace("#", "");
    const n = parseInt(h.length === 3 ? h.split("")
        .map(c => c + c).join("") : h, 16);
    return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

function setTheme(t: Theme) {
    const r = document.documentElement;
    document.body.classList.remove("theme-transition");

    r.style.setProperty("--bg-base", t.base);
    r.style.setProperty("--c1", toRgb(t.c1));
    r.style.setProperty("--c2", toRgb(t.c2));
    r.style.setProperty("--c3", toRgb(t.c3));
    r.style.setProperty("--c1a", String(t.c1a));
    r.style.setProperty("--c2a", String(t.c2a));
    r.style.setProperty("--c3a", String(t.c3a));
    r.style.setProperty("--text", t.text);
}

type DriftBase = {
    p1x: number; p1y: number;
    p2x: number; p2y: number;
    p3x: number; p3y: number;
};

export function useThemeScene(t: Theme) {
    const driftBaseRef = useRef<DriftBase | null>(null);

    useLayoutEffect(() => {
        setTheme(t);
    }, [t]);

    useEffect(() => {
        const r = document.documentElement;
        const rand = (min: number, max: number) =>
            min + Math.random() * (max - min);

        const base: DriftBase = {
            p1x: rand(70, 95), p1y: rand(5, 30),
            p2x: rand(5, 30),  p2y: rand(70, 95),
            p3x: rand(60, 95), p3y: rand(40, 75),
        };

        driftBaseRef.current = base;

        const setP = (k: string, v: number) =>
            r.style.setProperty(k, `${v.toFixed(2)}%`);
        setP("--p1x", base.p1x); setP("--p1y", base.p1y);
        setP("--p2x", base.p2x); setP("--p2y", base.p2y);
        setP("--p3x", base.p3x); setP("--p3y", base.p3y);
    }, []);

    useEffect(() => {
        const r = document.documentElement;

        const fract = (x: number) => x - Math.floor(x);
        const smoothstep = (u: number) => u * u * (3 - 2 * u);
        const hash = (i: number, seed: number) =>
            fract(Math.sin((i * 127.1 + seed * 311.7)) * 43758.5453123);

        const noise1 = (x: number, seed: number) => {
            const i0 = Math.floor(x);
            const u = x - i0;
            const a = hash(i0, seed);
            const b = hash(i0 + 1, seed);
            return a + (b - a) * smoothstep(u);
        };

        const perlinish = (x: number, seed: number) => {
            let v = 0;
            let amp = 8;
            let freq = 1;
            let norm = 0;
            for (let o = 0; o < 3; o++) {
                v += amp * noise1(x * freq, seed + o * 101);
                norm += amp;
                amp *= 0.5;
                freq *= 2;
            }
            v /= norm;
            return v * 2 - 1;
        };

        const base = driftBaseRef.current ?? { p1x: 86, p1y: 18, p2x: 14, p2y: 82, p3x: 78, p3y: 58 };
        const amp = 8;
        const speed = 0.00006;

        const clamp = (v: number, lo: number, hi: number) =>
            Math.max(lo, Math.min(hi, v));
        const setP = (k: string, v: number) =>
            r.style.setProperty(k, `${v.toFixed(2)}%`);

        let raf = 0;
        const t0 = performance.now();

        const tick = (now: number) => {
            const tt = (now - t0) * speed;

            setP("--p1x", clamp(base.p1x + amp * perlinish(tt, 1), 0, 100));
            setP("--p1y", clamp(base.p1y + amp * perlinish(tt, 2), 0, 100));
            setP("--p2x", clamp(base.p2x + amp * perlinish(tt, 3), 0, 100));
            setP("--p2y", clamp(base.p2y + amp * perlinish(tt, 4), 0, 100));
            setP("--p3x", clamp(base.p3x + amp * perlinish(tt, 5), 0, 100));
            setP("--p3y", clamp(base.p3y + amp * perlinish(tt, 6), 0, 100));

            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);
}