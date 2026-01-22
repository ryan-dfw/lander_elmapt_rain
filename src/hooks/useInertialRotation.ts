import { useEffect, useRef, useState, type PointerEvent } from "react";

type Options = {
    pxToDeg?: number;
    clampAbsDeg?: number;
    friction?: number;
    stopVDegPerMs?: number;
    turboThreshPxPerMs?: number;
};

type Bind = {
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => void;
    onPointerUp: () => void;
    onPointerCancel: () => void;
};

export function useInertialRotation (opts: Options = {}) {
    const PX_TO_DEG = opts.pxToDeg ?? 0.55;
    const CLAMP = opts.clampAbsDeg ?? 360000;
    const FRICTION = opts.friction ?? 0.999;
    const STOP_V = opts.stopVDegPerMs ?? 0.001;
    const TURBO_THRESH = opts.turboThreshPxPerMs ?? 5;

    const [rotY, setRotY] = useState(0);
    const [dragging, setDragging] = useState(false);

    const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

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

    const snapToFace = (currentRot: number) => {
        let n = ((currentRot % 360) + 360) % 360; // 0..359
        if (n > 180) n -= 360; // -180..180
        const snapped = Math.abs(n) >= 90 ? (n > 0 ? 180 : -180) : 0;
        return currentRot + (snapped - n);
    };

    const stopInertia = () => {
        if (dragRef.current.raf) cancelAnimationFrame(dragRef.current.raf);
        dragRef.current.raf = 0;
    };

    const onDown = (e: PointerEvent<HTMLDivElement>) => {
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

    const onMove = (e: PointerEvent<HTMLDivElement>) => {
        if (!dragRef.current.active) return;

        const now = performance.now();
        const dx = e.clientX - dragRef.current.startX;
        const next = dragRef.current.startRot + dx * PX_TO_DEG;

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

        let vDeg = dragRef.current.vel * PX_TO_DEG;

        if (Math.abs(dragRef.current.vel) > TURBO_THRESH) {
            vDeg *= 10;
        }

        dragRef.current.vDeg = vDeg;

        if (Math.abs(vDeg) < STOP_V) {
            setRotY((r) => snapToFace(r));
            return;
        }

        let last = performance.now();
        const tick = (t: number) => {
            const dt = Math.max(1, t - last);
            last = t;

            setRotY((r) => clamp(r + dragRef.current.vDeg * dt, -CLAMP, CLAMP));
            dragRef.current.vDeg *= Math.pow(FRICTION, dt);

            if (Math.abs(dragRef.current.vDeg) < STOP_V) {
                stopInertia();
                setRotY((r) => snapToFace(r));
                return;
            }

            dragRef.current.raf = requestAnimationFrame(tick);
        };

        dragRef.current.raf = requestAnimationFrame(tick);
    };

    useEffect(() => () => stopInertia(), []);

    const bind: Bind = {
        onPointerDown: onDown,
        onPointerMove: onMove,
        onPointerUp: onUp,
        onPointerCancel: onUp,
    };

    return { rotY, dragging, bind };
}