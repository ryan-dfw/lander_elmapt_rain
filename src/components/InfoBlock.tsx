import { profile } from "../data/profile";
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
            <div
                className="wordmark"
                aria-label={`${profile.name} — ${profile.role} — ${profile.company}`}
            >
                <div className="wmTop">
          <span className="wmName">
            <ColorText text={profile.name} />
          </span>

                    <span className="wmDot">•</span>

                    <span className="wmRole">
            <ColorText text={profile.role} />
          </span>
                </div>

                <div className="wmCompany">
                    <ColorText text={profile.company} />
                </div>
            </div>

            <div className="label label-contact">
                <span className="contact-prefix">ph</span>{" "}
                <a className="contact-link" href={profile.contact.phoneHref}>
                    {profile.contact.phoneDisplay}
                </a>

                <span className="contact-sep"> · </span>

                <span className="contact-prefix">em</span>{" "}
                <a className="contact-link" href={`mailto:${profile.contact.email}`}>
                    {profile.contact.email}
                </a>
            </div>
        </div>
    );
}