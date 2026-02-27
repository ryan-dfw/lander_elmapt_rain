import { profile } from "../data/profile";
import "../styles/infoBlock.css";

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

const formatUSPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");

    // Assume US/+1 when 10 digits.
    if (digits.length === 10) {
        return {
            display: `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`,
            href: `tel:+1${digits}`,
        };
    }

    // Accept 11 digits with leading 1.
    if (digits.length === 11 && digits.startsWith("1")) {
        const d = digits.slice(1);
        return {
            display: `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`,
            href: `tel:+${digits}`,
        };
    }

    // Fallback for unexpected/non-US inputs.
    return {
        display: raw,
        href: digits ? `tel:+${digits}` : "",
    };
};

export function InfoBlock() {
    const phoneRaw = profile.contact?.phone;
    const email = profile.contact?.email;

    const phoneOk = !!phoneRaw;
    const emailOk = !!email;

    const showContact = phoneOk || emailOk;

    const phone = phoneOk ? formatUSPhone(phoneRaw!) : null;

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

                    {profile.role ? <span className="wmDot">•</span> : null}

                    {profile.role ? (
                        <span className="wmRole">
              <ColorText text={profile.role} />
            </span>
                    ) : null}
                </div>

                {profile.company ? (
                    <div className="wmCompany">
                        <ColorText text={profile.company} />
                    </div>
                ) : null}
            </div>

            {showContact ? (
                <div className="label label-contact">
                    {phoneOk ? (
                        <>
                            <span className="contact-prefix">ph</span>{" "}
                            <a className="contact-link" href={phone!.href}>
                                {phone!.display}
                            </a>
                        </>
                    ) : null}

                    {phoneOk && emailOk ? <span className="contact-sep"> · </span> : null}

                    {emailOk ? (
                        <>
                            <span className="contact-prefix">em</span>{" "}
                            <a className="contact-link" href={`mailto:${email}`}>
                                {email}
                            </a>
                        </>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}