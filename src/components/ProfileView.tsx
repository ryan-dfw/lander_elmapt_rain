import {useRef} from "react";
import {Button} from "../ui/Button.tsx";
import AcrylicSlab from "./AcrylicSlab";

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

    const posterRef = useRef<HTMLDivElement | null>(null);
    const utilityRef = useRef<HTMLButtonElement | null>(null);
    const buttonsRef = useRef<HTMLDivElement | null>(null);

    return (
        <div ref={posterRef} className="poster">
            <AcrylicSlab/>

            <div className="infoBlock">
                <div className="wordmark" aria-label={`Rain — Lead Photographer — Elm Aperture`}>
                    <div className="wmTop">
                            <span className="wmName">
                              <PaintText group="name" text={"Rain"}/>
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
                    className="ctaBtn less-important"
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
    );
}