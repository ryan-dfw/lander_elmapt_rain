import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean;
    variant?: "glass" | "ghost";
    size?: "icon" | "md";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        { asChild, variant = "glass", size = "md", className = "", ...props },
        ref
    ) => {
        const Comp: React.ElementType = asChild ? Slot : "button";

        if (asChild) {
            return (
                <Comp
                    className={["btn", `btn--${variant}`, `btn--${size}`, className].join(" ")}
                    {...props}
                />
            );
        }

        return (
            <Comp
                ref={ref}
                className={["btn", `btn--${variant}`, `btn--${size}`, className].join(" ")}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";