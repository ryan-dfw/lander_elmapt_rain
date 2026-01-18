import React, {useEffect, useRef, useState} from "react";
import {Button} from "../ui/Button.tsx";
import type {Theme} from "../App.tsx";

import Rain from "../img/rain.webp"

export type Pfp = {
    name: string;
    image: string;
    theme: Theme;
};

const pfp: Pfp = {
    name: "Rain",
    image: Rain,
    theme: {
        base: "#070c14",
        c1: "#1e3a8a", c1a: 0.18,
        c2: "#0f172a", c2a: 0.22,
        c3: "#0c0132", c3a: 0.10,
        text: "#dbe3ee",
    },
};

const serveVcard = () => {
    const a = document.createElement("a");
    a.href = "/Rain.vcf";
    a.download = "Rain.vcf";
    a.target = "_self";
    a.rel = "noopener";

    document.body.appendChild(a);
    a.click();
    a.remove();
};

function PaintText({
                       text,
                       className = "",
                   }: {
    text: string;
    group?: string;
    className?: string;
}) {
    return (
        <span className={["paint", className].join(" ")}>
            {Array.from(text).map((ch, i) => (
                <span key={i} className="glyph">
                    {ch === " " ? "\u00A0" : ch}
                </span>
            ))}
        </span>
    );
}

export default function ProfileView() {

    const IMAGE_STEP = 0.94;
    const POSTER_STEP = 0.97;
    const IMAGE_MIN = 0.65;
    const POSTER_MIN = 0.75;

    const imageScaleRef = useRef(1);
    const posterScaleRef = useRef(1);
    const lockedRef = useRef(false);

    const posterRef = useRef<HTMLDivElement | null>(null);
    const slabRef = useRef<HTMLDivElement | null>(null);
    const utilityRef = useRef<HTMLButtonElement | null>(null);
    const buttonsRef = useRef<HTMLDivElement | null>(null);
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

    useEffect(() => {
        const poster = posterRef.current;
        const slab = slabRef.current;
        const utility = utilityRef.current;
        const buttons = buttonsRef.current;
        if (!poster || !slab || !utility || !buttons) return;

        const isOverlapping = () => {
            const u = utility.getBoundingClientRect();
            const b = buttons.getBoundingClientRect();
            return !(
                u.right + 8 < b.left ||
                u.left - 8 > b.right ||
                u.bottom + 8 < b.top ||
                u.top - 8 > b.bottom
            );
        };

        const tick = () => {
            if (lockedRef.current) return;

            if (!isOverlapping()) return;

            lockedRef.current = true;

            if (imageScaleRef.current > IMAGE_MIN) {
                imageScaleRef.current *= IMAGE_STEP;
                slab.style.setProperty(
                    "--slabMult",
                    String(imageScaleRef.current)
                );
            } else if (posterScaleRef.current > POSTER_MIN) {
                posterScaleRef.current *= POSTER_STEP;
                poster.style.setProperty(
                    "--posterMult",
                    String(posterScaleRef.current)
                );
            }

            requestAnimationFrame(() => {
                lockedRef.current = false;
            });
        };

        window.addEventListener("resize", tick);
        window.addEventListener("orientationchange", tick);
        document.fonts?.ready?.then(tick);

        return () => {
            window.removeEventListener("resize", tick);
            window.removeEventListener("orientationchange", tick);
        };
    }, []);

    return (
        <>
            <div ref={posterRef} className="poster">
                <div
                    ref={slabRef}
                    className="card3d"
                    onPointerDown={onDown}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onPointerCancel={onUp}
                >
                    <div
                        className={`card3dInner ${dragging ? "dragging" : ""}`}
                        style={{transform: `rotateY(${rotY}deg)`}}
                    >
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

                        <div className="cardSide sideTop"></div>
                        <div className="cardSide sideBottom"></div>
                        <div className="cardSide sideLeft"></div>
                        <div className="cardSide sideRight"></div>

                        {/* BACK (image seen through acrylic) */}
                        <div className="cardFace cardBack">
                            <img
                                src={pfp.image}
                                alt=""
                                draggable={false}
                                className="posterImg posterImgBack"
                            />
                        </div>
                    </div>
                </div>

                <div className="infoBlock">
                    <div className="wordmark" aria-label={`${pfp.name} — Lead Photographer — Elm Aperture`}>
                        <div className="wmTop">
                                <span className="wmName">
                                  <PaintText group="name" text={pfp.name}/>
                                </span>
                            <span className="wmDot">•</span>
                            <span className="wmRole">
                                  <PaintText group="role" text="Lead Photographer"/>
                                </span>
                        </div>
                        <div className="wmStudio">
                            <PaintText group="studio" text="ELM APERTURE"/>
                        </div>
                    </div>

                    <div className="label label-contact">
                        <span className="contact-prefix">ph</span>{" "}
                        <a className="contact-link" href="tel:+19728006775">
                            972.800.6775
                        </a>

                        <span className="contact-sep"> · </span>

                        <span className="contact-prefix">em</span>{" "}
                        <a className="contact-link" href="mailto:rain@elmapt.com">
                            rain@elmapt.com
                        </a>
                    </div>
                </div>

                <div
                    ref={buttonsRef}
                    className="buttonBlock"
                >
                    <Button
                        asChild
                        variant="glass"
                        className="ctaBtn"
                        aria-label="Portfolio"
                    >
                        <a
                            href="https://elmapt.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Portfolio
                        </a>
                    </Button>

                    <Button
                        asChild
                        variant="glass"
                        className="ctaBtn"
                        aria-label="Instagram"
                    >
                        <a
                            href="https://instagram.com/raindfwphotos"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Instagram
                        </a>
                    </Button>

                    <Button
                        asChild
                        variant="glass"
                        className="ctaBtn"
                        aria-label="Videography"
                    >
                        <a
                            href="https://vimeo.com/raindfwphotos"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Videography
                        </a>
                    </Button>

                </div>

                <Button
                    ref={utilityRef}
                    variant="glass"
                    className="utilityBtn"
                    aria-label="Download"
                    onClick={() => {
                        console.log("You've got mail!");
                        serveVcard()
                    }}
                >
                    ⤓
                </Button>

            </div>
        </>
    );
}