import { Button } from "./Button.tsx";
import { profile } from "../data/profile";

export default function CtaButtonContainer() {
    return (
        <div className="ctaButtonContainer">
            {profile.ctas.map(({ href, label, lessImportant }) => (
                <Button
                    key={href}
                    asChild
                    variant="glass"
                    className={`ctaBtn${lessImportant ? " less-important" : ""}`}
                    aria-label={label}
                >
                    <a href={href} target="_blank" rel="noopener noreferrer">
                        {label}
                    </a>
                </Button>
            ))}
        </div>
    );
}