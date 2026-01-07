import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    variant?: "glass" | "ghost";
    size?: "icon" | "md";
};

export function Button({
                           asChild,
                           variant = "glass",
                           size = "md",
                           className = "",
                           ...props
                       }: ButtonProps) {
    const Comp: React.ElementType = asChild ? Slot : "button";
    return (
        <Comp
            className={[
                "btn",
                `btn--${variant}`,
                `btn--${size}`,
                className,
            ].join(" ")}
            {...props}
        />
    );
}