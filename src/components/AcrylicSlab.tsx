import type { CSSProperties } from "react";
import poster from "../data/profile.webp";
import { useInertialRotation } from "../hooks/useInertialRotation.ts";
import { profile } from "../data/profile";
import "../styles/acrylic.tokens.css";
import "../styles/acrylic.css";

type CSSVars = CSSProperties & {
    "--slabMult"?: number;
};

export default function AcrylicSlab() {
    const { rotY, dragging, bind } = useInertialRotation();

    const isSafari =
        typeof navigator !== "undefined" &&
        /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    return (
        <div
            className="card3d"
            {...bind}
            style={isSafari ? ({ "--slabMult": 0.8 } as CSSVars) : undefined}
        >
            <div
                className={`card3dInner ${dragging ? "dragging" : ""}`}
                style={{ transform: `rotateY(${rotY}deg)` }}
            >
                <div className="cardFace cardFront">
                    <img
                        className="posterImg"
                        src={poster}
                        alt={profile.name}
                        draggable={false}
                        loading="eager"
                        fetchPriority="high"
                    />
                </div>

                <div className="cardSide sideTop"></div>
                <div className="cardSide sideBottom"></div>
                <div className="cardSide sideLeft"></div>
                <div className="cardSide sideRight"></div>

                <div className="cardFace cardBack">
                    <img
                        src={poster}
                        alt=""
                        draggable={false}
                        className="posterImg posterImgBack"
                    />
                </div>
            </div>
        </div>
    );
}