export type ProjectLink = {
  label: "Demo" | "Código";
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
    id: "video-downloader-by-link",
    title: "Video Downloader by Link",
    description:
      "Aplicación web en Next.js para previsualizar enlaces de video y descargar archivos cuando es posible (incluye soporte para YouTube mediante ytdl-core).",
    tech: ["Next.js", "TypeScript", "ytdl-core"],
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
    gradientClass: "from-primary to-secondary",
  },
  {
    id: "debts-my-clients",
    title: "Debts my clients",
    description:
      "Deudas & Ventas: PWA instalable para gestionar ventas y deudas de clientes, con datos guardados localmente (sin servidor) y versión Android (APK).",
    tech: ["PWA", "Offline", "Local Storage"],
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
    id: "audio-giber-js",
    title: "AudioGiber JS",
    description:
      "Librería en JavaScript para crear fácilmente un contexto de reproductor de audio y gestionar pistas dentro de tu aplicación.",
    tech: ["JavaScript", "Web Audio", "Library"],
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
];
