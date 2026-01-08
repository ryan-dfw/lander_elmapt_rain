import './App.css'
import Rain from "./img/rain.jpg"
import {useEffect, useLayoutEffect, useRef, useState} from "react";
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

    const [rotY, setRotY] = useState(0);
    const [dragging, setDragging] = useState(false);

    const dragRef = useRef({
        active: false,
        startX: 0,
        startRot: 0,

        // velocity tracking
        lastX: 0,
        lastT: 0,
        vel: 0, // px/ms (smoothed)

        // inertia
        raf: 0 as number | 0,
        vDeg: 0, // deg/ms
    });

    const PX_TO_DEG = 0.55;
    const CLAMP = 360000;
    const FRICTION = .999;
    const STOP_V = 0.001;
    const TURBO_THRESH = 5;   // px/ms threshold to trigger turbo on flick

    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

    const stopInertia = () => {
        if (dragRef.current.raf) cancelAnimationFrame(dragRef.current.raf);
        dragRef.current.raf = 0;
    };

    const snapToFace = (currentRot: number) => {
        // normalize to (-180..180] for snapping logic
        let n = ((currentRot % 360) + 360) % 360; // 0..359
        if (n > 180) n -= 360; // -180..180

        const snapped = Math.abs(n) >= 90 ? (n > 0 ? 180 : -180) : 0;
        return currentRot + (snapped - n);
    };

    const onDown = (e: React.PointerEvent) => {
        if (!e.isPrimary) return;

        stopInertia();

        dragRef.current.active = true;
        dragRef.current.startX = e.clientX;
        dragRef.current.startRot = rotY;

        dragRef.current.lastX = e.clientX;
        dragRef.current.lastT = performance.now();
        dragRef.current.vel = 0;
        dragRef.current.vDeg = 0;

        setDragging(true);
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    };

    const onMove = (e: React.PointerEvent) => {
        if (!dragRef.current.active) return;

        const now = performance.now();
        const dx = e.clientX - dragRef.current.startX;
        const next = dragRef.current.startRot + dx * PX_TO_DEG;

        // velocity (smoothed)
        const dt = Math.max(1, now - dragRef.current.lastT);
        const vx = (e.clientX - dragRef.current.lastX) / dt; // px/ms
        dragRef.current.vel = dragRef.current.vel * 0.75 + vx * 0.25;

        dragRef.current.lastX = e.clientX;
        dragRef.current.lastT = now;

        setRotY(clamp(next, -CLAMP, CLAMP));
    };

    const onUp = () => {
        if (!dragRef.current.active) return;

        dragRef.current.active = false;
        setDragging(false);

        // convert px/ms -> deg/ms
        let vDeg = dragRef.current.vel * PX_TO_DEG;

        // TURBO: amplify if it was a real flick
        if (Math.abs(dragRef.current.vel) > TURBO_THRESH) {
            vDeg *= 10;
        }

        dragRef.current.vDeg = vDeg;

        // if basically no velocity, just snap
        if (Math.abs(vDeg) < STOP_V) {
            setRotY(r => snapToFace(r));
            return;
        }

        // inertia loop
        let last = performance.now();
        const tick = (t: number) => {
            const dt = Math.max(1, t - last);
            last = t;

            // advance
            setRotY(r => clamp(r + dragRef.current.vDeg * dt, -CLAMP, CLAMP));

            // decay velocity
            dragRef.current.vDeg *= Math.pow(FRICTION, dt);

            // stop + snap
            if (Math.abs(dragRef.current.vDeg) < STOP_V) {
                stopInertia();
                setRotY(r => snapToFace(r));
                return;
            }

            dragRef.current.raf = requestAnimationFrame(tick);
        };

        dragRef.current.raf = requestAnimationFrame(tick);
    };

    useEffect(() => () => stopInertia(), []);

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
                        <div
                            className="card3d"
                            onPointerDown={onDown}
                            onPointerMove={onMove}
                            onPointerUp={onUp}
                            onPointerCancel={onUp}
                        >
                            <div className={`card3dInner ${dragging ? "dragging" : ""}`}
                                 style={{ transform: `rotateY(${rotY}deg)` }}>
                                {/* FRONT */}
                                <div className="cardFace cardFront">
                                    <img
                                        src={pfp.image}
                                        alt={pfp.name}
                                        loading="eager"
                                        fetchPriority="high"
                                        draggable={false}
                                        className="posterImg"
                                    />
                                </div>

                                {/* BACK (temporary black panel) */}
                                <div className="cardFace cardBack">
                                    <div
                                        style={{
                                            width: "100%",
                                            aspectRatio: "1",
                                            background: "#000",
                                            borderRadius: "5px",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

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