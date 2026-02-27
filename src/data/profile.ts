export type CtaLink = {
    href: string;
    label: string;
    lessImportant?: boolean;
};

export const profile = {
    name: "Rain",
    role: "Lead Photographer",
    company: "Elm Aperture",

    contact: {
        phone: "9728006775",
        email: "rain@elmapt.com",
    },

    ctas: [
        {
            href: "https://elmapt.com",
            label: "Portfolio"
        },
        {
            href: "https://instagram.com/raindfwphotos",
            label: "Instagram"
        },
        {
            href: "https://vimeo.com/raindfwphotos",
            label: "Videography",
            lessImportant: true
        },
    ] satisfies readonly CtaLink[],

    colors: {
        c1: "#1e3a8a",
        c2: "#0f172a",
        c3: "#0c0132",
    },
} as const;