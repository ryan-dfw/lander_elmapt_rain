import {Button} from "./Button.tsx";

type UtilityAction = {
    key: string;
    label: string;
    text: string;
    lessImportant?: boolean;
    action: () => void;
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

const actionsList: UtilityAction[] = [
    {
        key: "download-vcard",
        label: "Download",
        text: "⤓",
        action: serveVcard,
    },
];

export default function UtilityButtonContainer() {
    return (
        <div className="utilityButtonContainer">
            {actionsList.map(({ key, label, text, lessImportant, action }) => (
                <Button
                    key={key}
                    variant="glass"
                    className={`utilityBtn${lessImportant ? " less-important" : ""}`}
                    aria-label={label}
                    onClick={action}
                >
                    {text}
                </Button>
            ))}
        </div>
    )
}