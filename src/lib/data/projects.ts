export type ProjectLink = {
  label: "Demo" | "Código" | "Google Play" | "Docs" | "NPM" | string;
  href: string;
  variant: "primary" | "muted";
};

export type Project = {
  id: string;
  title: string;
  description: string;
  tech: string[];
  links: ProjectLink[];
  icon: string;
  gradientClass: string;
};

export const projects: Project[] = [
  {
    id: "wallet-track",
    title: "WalletTrack: Control de Gastos",
    description:
      "Aplicación móvil para gestión de finanzas personales, presupuestos y control inteligente de gastos diarios.",
    tech: ["Android", "Google Play", "Mobile", "Finanzas", "Capacitor", "React", "Tailwind", "Typescript", "Vite"],
    links: [
      {
        label: "Google Play",
        href: "https://play.google.com/store/apps/details?id=com.wallettrack.giber",
        variant: "primary",
      },
    ],
    icon: "mdi:google-play",
    gradientClass: "from-emerald-600 to-teal-700",
  },
  {
    id: "canvapps-framework",
    title: "CanvApps Framework",
    description:
      "Framework moderno diseñado para construir aplicaciones visuales, interactivas y ricas basadas en Canvas HTML5.",
    tech: ["TypeScript", "JavaScript", "Canvas API", "Framework"],
    links: [
      {
        label: "Demo",
        href: "https://erickgiber.github.io/CanvApps/",
        variant: "primary",
      },
      {
        label: "Código",
        href: "https://github.com/Erickgiber/CanvApps",
        variant: "muted",
      },
    ],
    icon: "mdi:palette-swatch-outline",
    gradientClass: "from-blue-600 to-indigo-600",
  },
  {
    id: "google-canvas",
    title: "Google Canvas",
    description:
      "Clon interactivo de Google construido íntegramente sobre Canvas HTML5 con el framework CanvApps para demostrar su potencial.",
    tech: ["CanvApps", "Canvas API", "JavaScript", "HTML5"],
    links: [
      {
        label: "Demo",
        href: "https://erickgiber.github.io/google-canvapps/",
        variant: "primary",
      },
      {
        label: "Código",
        href: "https://github.com/Erickgiber/google-canvapps",
        variant: "muted",
      },
    ],
    icon: "mdi:google",
    gradientClass: "from-blue-500 to-cyan-600",
  },
  {
    id: "cv-generator",
    title: "CV Generator",
    description:
      "Página web hecha con Svelte 5 para crear currículums con variedad de plantillas, vista previa y exportación a PDF o imagen.",
    tech: ["Svelte 5", "TypeScript", "PDF Export", "Tailwind CSS"],
    links: [
      {
        label: "Demo",
        href: "https://cv-generator-app-js.vercel.app/",
        variant: "primary",
      },
      {
        label: "Código",
        href: "https://github.com/Erickgiber/cv-generator",
        variant: "muted",
      },
    ],
    icon: "mdi:file-account-outline",
    gradientClass: "from-purple-600 to-indigo-700",
  },
  {
    id: "sharedom",
    title: "ShareDOM",
    description:
      "Librería ultraligera y rápida para capturar snapshots y screenshots del DOM para Browser y SSR (Next.js, SvelteKit).",
    tech: ["TypeScript", "NPM", "DOM", "SSR"],
    links: [
      {
        label: "Demo",
        href: "https://erickgiber.github.io/sharedom/",
        variant: "primary",
      },
      {
        label: "Código",
        href: "https://github.com/Erickgiber/sharedom",
        variant: "muted",
      },
    ],
    icon: "mdi:camera-iris",
    gradientClass: "from-indigo-500 to-purple-600",
  },
  {
    id: "svelte-spa-template",
    title: "Svelte SPA Template",
    description:
      "Plantilla optimizada y lista para producción para Single Page Applications con Svelte (9 ⭐ en GitHub).",
    tech: ["Svelte", "SPA", "Vite", "Template"],
    links: [
      {
        label: "Demo",
        href: "https://svelte-spa-template.vercel.app/",
        variant: "primary",
      },
      {
        label: "Código",
        href: "https://github.com/Erickgiber/svelte-spa-template",
        variant: "muted",
      },
    ],
    icon: "simple-icons:svelte",
    gradientClass: "from-orange-500 to-rose-600",
  },
  {
    id: "debts-my-clients",
    title: "Debts My Clients",
    description:
      "Sistema integral para la gestión de cuentas y deudas de clientes con almacenamiento local y versión PWA.",
    tech: ["Svelte", "TypeScript", "PWA", "Offline"],
    links: [
      {
        label: "Demo",
        href: "https://debts-my-clients.vercel.app/",
        variant: "primary",
      },
      {
        label: "Código",
        href: "https://github.com/Erickgiber/debts-my-clients",
        variant: "muted",
      },
    ],
    icon: "mdi:currency-usd",
    gradientClass: "from-secondary to-accent",
  },
  {
    id: "audio-giber",
    title: "Audio Giber",
    description:
      "Librería ligera para simplificar el manejo, contexto y reproducción de audio en la web.",
    tech: ["JavaScript", "Web Audio API", "Library"],
    links: [
      {
        label: "Demo",
        href: "https://audio-giber-website.vercel.app/",
        variant: "primary",
      },
      {
        label: "Código",
        href: "https://github.com/Erickgiber/audio-giber-website",
        variant: "muted",
      },
    ],
    icon: "mdi:music-note",
    gradientClass: "from-accent to-primary",
  },
  {
    id: "video-downloader-by-link",
    title: "Video Downloader by Link",
    description:
      "Página web para descargar videos desde enlaces con previsualizador integrado y soporte para múltiples servidores.",
    tech: ["Next.js", "TypeScript", "Video Downloader", "ytdl-core"],
    links: [
      {
        label: "Demo",
        href: "https://video-downloader-by-link.vercel.app/",
        variant: "primary",
      },
      {
        label: "Código",
        href: "https://github.com/Erickgiber/video-downloader-by-link",
        variant: "muted",
      },
    ],
    icon: "mdi:video",
    gradientClass: "from-cyan-600 to-blue-700",
  },
];
