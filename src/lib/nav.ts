export const MAIN_NAV = [
  { href: "/samfelag", label: "Samfélag" },
  { href: "/studningur", label: "Stuðningur" },
  { href: "/um-okkur", label: "Um okkur" },
  { href: "/neydarhjalp", label: "Neyðarhjálp" },
  { href: "/styrkja", label: "Styrktu okkur" },
] as const;

export const FOOTER_NAV = {
  Samfélag: [
    { href: "/samfelag", label: "Spjallsvæði" },
    { href: "/studningur", label: "Fagaðstoð" },
    { href: "/skra", label: "Skrá mig" },
  ],
  Verkefnið: [
    { href: "/um-okkur", label: "Um okkur" },
    { href: "/styrkja", label: "Styrktu okkur" },
    { href: "/samband", label: "Samband" },
  ],
  Lögfræðilegt: [
    { href: "/personuvernd", label: "Persónuvernd" },
    { href: "/skilmalar", label: "Skilmálar" },
    { href: "/neydarhjalp", label: "Neyðarhjálp" },
  ],
} as const;
