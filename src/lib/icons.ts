/**
 * Built-in Lucide icon catalogue used by the editor Icon Picker.
 * Plain data only (no React imports) so it is safe to import from both the
 * server-side `/api/admin/icons` route and the client-side picker component.
 */

export type LucideCategory = {
  key: string;
  label: string;
  icons: string[];
};

export const LUCIDE_CATEGORIES: LucideCategory[] = [
  {
    key: "people",
    label: "Fólk & Samfélag",
    icons: [
      "Heart",
      "Users",
      "UserPlus",
      "HandHeart",
      "Shield",
      "ShieldCheck",
      "Star",
      "Award",
      "Handshake",
    ],
  },
  {
    key: "emergency",
    label: "Neyðarhjálp",
    icons: [
      "Phone",
      "PhoneCall",
      "AlertTriangle",
      "Siren",
      "LifeBuoy",
      "Cross",
      "Ambulance",
      "HeartPulse",
    ],
  },
  {
    key: "communication",
    label: "Samskipti",
    icons: ["MessageCircle", "Mail", "Send", "Globe", "Link", "ExternalLink"],
  },
  {
    key: "general",
    label: "Almenn",
    icons: [
      "Home",
      "BookOpen",
      "FileText",
      "CheckCircle",
      "ArrowRight",
      "Clock",
      "Calendar",
      "MapPin",
      "Lock",
      "Unlock",
      "Eye",
      "Settings",
      "Info",
      "HelpCircle",
    ],
  },
];

/** Flat list of all built-in Lucide icon names offered by the picker. */
export const LUCIDE_ICONS: string[] = LUCIDE_CATEGORIES.flatMap((c) => c.icons);

/** Size presets (px) shared by the picker and resize controls. */
export const ICON_SIZES = {
  XS: 24,
  S: 40,
  M: 64,
  L: 96,
  XL: 128,
} as const;

export type IconSizeKey = keyof typeof ICON_SIZES;

/** Color swatches for SVG (Lucide) icons. */
export const ICON_COLORS = [
  { label: "Gull", value: "#F59E0B" },
  { label: "Hvítt", value: "#FFFFFF" },
  { label: "Grátt", value: "#9CA3AF" },
  { label: "Blátt", value: "#3B82F6" },
  { label: "Rautt", value: "#EF4444" },
  { label: "Grænt", value: "#10B981" },
];
