import "../styles/infoBlock.css"

function ColorText({
                       text,
                       className = "",
                   }: {
    text: string;
    group?: string;
    className?: string;
}) {
    return (
        <span className={["color", className].join(" ")}>
            {Array.from(text).map((ch, i) => (
                <span key={i} className="glyph">
                    {ch === " " ? "\u00A0" : ch}
                </span>
            ))}
        </span>
    );
}

export function InfoBlock() {

    return (
        <div className="infoBlock">
            <div className="wordmark" aria-label={`Rain — Lead Photographer — Elm Aperture`}>
                <div className="wmTop">
                            <span className="wmName">
                              <ColorText group="name" text={"Rain"}/>
                            </span>
                    <span className="wmDot">•</span>
                    <span className="wmRole">
                              <ColorText group="role" text="Lead Photographer"/>
                            </span>
                </div>
                <div className="wmStudio">
                    <ColorText group="studio" text="ELM APERTURE"/>
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
    );
}