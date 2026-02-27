import { Button } from "./Button.tsx";
import { profile } from "../data/profile";

const serveVcard = () => {
    const a = document.createElement("a");
    a.href = "/profile.vcf";
    a.download = `${profile.name}.vcf`;
    a.target = "_self";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
};

const actionsList = [
    {
        key: "download-vcard",
        label: `Download ${profile.name} contact`,
        text: "⤓",
        action: serveVcard,
    },
] as const;

export default function UtilityButtonContainer() {
    return (
        <div className="utilityButtonContainer">
            {actionsList.map(({ key, label, text, action }) => (
                <Button
                    key={key}
                    variant="glass"
                    className="utilityBtn"
                    aria-label={label}
                    onClick={action}
                >
                    {text}
                </Button>
            ))}
        </div>
    );
}