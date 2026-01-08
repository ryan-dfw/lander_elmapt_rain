import './App.css'
import Rain from "./img/rain.jpg"
import {useEffect, useLayoutEffect, useRef} from "react";
import { Button } from "./ui/Button";

export type Theme = {
    base: string;
    c1: string; c1a: number;
    c2: string; c2a: number;
    c3: string; c3a: number;
    text: string;
};

export type Pfp = {
    name: string;
    year: string;
    handle: string;
    image: string;
    theme: Theme;
};

const pfp: Pfp = {
    name: "Rain",
    year: "xxxx",
    handle: "ipsum",
    image: Rain,
    theme: {
        base: "#070c14",
        c1: "#1e3a8a", c1a: 0.18,
        c2: "#0f172a", c2a: 0.22,
        c3: "#0c0132", c3a: 0.10,
        text: "#dbe3ee",
    },
};

function setTheme(t: Theme) {
    const r = document.documentElement;
    const body = document.body;

    const toRgb = (hex: string) => {
        const h = hex.replace("#", "");
        const n = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
        return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
    };

    body.classList.remove("theme-transition");

    r.style.setProperty("--bg-base", t.base);
    r.style.setProperty("--c1", toRgb(t.c1));
    r.style.setProperty("--c2", toRgb(t.c2));
    r.style.setProperty("--c3", toRgb(t.c3));
    r.style.setProperty("--c1a", String(t.c1a));
    r.style.setProperty("--c2a", String(t.c2a));
    r.style.setProperty("--c3a", String(t.c3a));
    r.style.setProperty("--text", t.text);
}

export default function App() {

    const driftBaseRef = useRef<null | {
        p1x: number; p1y: number;
        p2x: number; p2y: number;
        p3x: number; p3y: number;
    }>(null);

    useLayoutEffect(() => {
        setTheme(pfp.theme);
    }, []);

    useEffect(() => {
        const r = document.documentElement;
        const rand = (min: number, max: number) => min + Math.random() * (max - min);
        const base = {
            p1x: rand(70, 95), p1y: rand(5, 30),   // top-right-ish
            p2x: rand(5, 30),  p2y: rand(70, 95),  // bottom-left-ish
            p3x: rand(60, 95), p3y: rand(40, 75),  // mid-right-ish
        };

        driftBaseRef.current = base;

        r.style.setProperty("--p1x", `${base.p1x.toFixed(2)}%`);
        r.style.setProperty("--p1y", `${base.p1y.toFixed(2)}%`);
        r.style.setProperty("--p2x", `${base.p2x.toFixed(2)}%`);
        r.style.setProperty("--p2y", `${base.p2y.toFixed(2)}%`);
        r.style.setProperty("--p3x", `${base.p3x.toFixed(2)}%`);
        r.style.setProperty("--p3y", `${base.p3y.toFixed(2)}%`);
    }, []);

    useEffect(() => {
        const r = document.documentElement;
        const fract = (x: number) => x - Math.floor(x);
        const smoothstep = (t: number) => t * t * (3 - 2 * t);
        const hash = (i: number, seed: number) =>
            fract(Math.sin((i * 127.1 + seed * 311.7)) * 43758.5453123);

        const noise1 = (x: number, seed: number) => {
            const i0 = Math.floor(x);
            const t = x - i0;
            const a = hash(i0, seed);
            const b = hash(i0 + 1, seed);
            return a + (b - a) * smoothstep(t); // 0..1
        };

        const perlinish = (x: number, seed: number) => {
            // fBm: layered smooth noise for nicer motion
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
            v /= norm;            // 0..1
            return (v * 2 - 1);   // -1..1
        };

        const base = driftBaseRef.current ?? { p1x: 86, p1y: 18, p2x: 14, p2y: 82, p3x: 78, p3y: 58 };

        const amp = 8;
        const speed = 0.00006;

        let raf = 0;
        const t0 = performance.now();

        const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

        const tick = (now: number) => {
            const t = (now - t0) * speed;

            const p1x = clamp(base.p1x + amp * perlinish(t, 1), 0, 100);
            const p1y = clamp(base.p1y + amp * perlinish(t, 2), 0, 100);

            const p2x = clamp(base.p2x + amp * perlinish(t, 3), 0, 100);
            const p2y = clamp(base.p2y + amp * perlinish(t, 4), 0, 100);

            const p3x = clamp(base.p3x + amp * perlinish(t, 5), 0, 100);
            const p3y = clamp(base.p3y + amp * perlinish(t, 6), 0, 100);

            r.style.setProperty("--p1x", `${p1x.toFixed(2)}%`);
            r.style.setProperty("--p1y", `${p1y.toFixed(2)}%`);
            r.style.setProperty("--p2x", `${p2x.toFixed(2)}%`);
            r.style.setProperty("--p2y", `${p2y.toFixed(2)}%`);
            r.style.setProperty("--p3x", `${p3x.toFixed(2)}%`);
            r.style.setProperty("--p3y", `${p3y.toFixed(2)}%`);

            raf = requestAnimationFrame(tick);
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <>
            <div className="bg" />
            <div className="stage">
                <div className="frame">
                    <div className="poster">
                        <img
                            src={pfp.image}
                            alt={pfp.name}
                            loading="eager"
                            fetchPriority={"high"}
                            draggable={false}
                            className={"posterImg"}
                            />

                        <div className="infoBlock">
                            <div className="wordmark" aria-label={`${pfp.name} — Lead Photographer — Elm Aperture`}>
                                <div className="wmTop">
                                    <span className="wmName">{pfp.name}</span>
                                    <span className="wmDot">•</span>
                                    <span className="wmRole">Lead Photographer</span>
                                </div>
                                <div className="wmStudio">ELM&nbsp;APERTURE</div>
                            </div>

                            <div className="label label-contact">
                                <span className="contact-prefix">ph</span> 972.800.6775
                                <span className="contact-sep"> · </span>
                                <span className="contact-prefix">em</span> rain@elmapt.com
                            </div>
                        </div>

                        <div className="buttonBlock">
                            <Button
                                variant="glass"
                                className="ctaBtn"
                                aria-label="Portfolio"
                                onClick={() => {}}
                            >
                                Portfolio
                            </Button>

                            <Button
                                variant="glass"
                                className="ctaBtn"
                                aria-label="Portfolio"
                                onClick={() => {}}
                            >
                                Instagram
                            </Button>

                            <Button
                                variant="glass"
                                className="ctaBtn"
                                aria-label="Videography"
                                onClick={() => {}}
                            >
                               Videography
                            </Button>

                        </div>

                        <Button
                            variant="glass"
                            className="utilityBtn"
                            aria-label="Download"
                            onClick={() => {}}
                        >
                            ⤓
                        </Button>

                    </div>
                </div>
            </div>
        </>
    );
}