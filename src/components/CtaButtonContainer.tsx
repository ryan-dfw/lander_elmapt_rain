import { Button } from "./Button.tsx"

type CtaLink = {
    href: string;
    label: string;
    text: string;
    lessImportant?: boolean;
};

const linksList: CtaLink[] = [
    { href: "https://elmapt.com", label: "Portfolio", text: "Portfolio" },
    { href: "https://instagram.com/raindfwphotos", label: "Instagram", text: "Instagram" },
    { href: "https://vimeo.com/raindfwphotos", label: "Videography", text: "Videography", lessImportant: true },
];

export default function CtaButtonContainer() {
    return (
        <div className="ctaButtonContainer">
            {linksList.map(({ href, label, text, lessImportant }) => (
                <Button
                    key={href}
                    asChild
                    variant="glass"
                    className={`ctaBtn${lessImportant ? " less-important" : ""}`}
                    aria-label={label}
                >
                    <a href={href} target="_blank" rel="noopener noreferrer">
                        {text}
                    </a>
                </Button>
            ))}
        </div>
    );
}