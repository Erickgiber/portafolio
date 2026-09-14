export type Review = {
  id: string;
  name: string;
  role: string;
  company: string;
  project: string;
  content: string;
  rating: number;
  avatarInitials: string;
  avatarGradient: string;
  accentGradient: string;
};

export const reviews: Review[] = [
  {
    id: "carlos-mendez",
    name: "Carlos Méndez",
    role: "Tech Lead",
    company: "NovaTech Labs",
    project: "Plataforma Web & Optimización",
    content:
      "Trabajar con Erick en el desarrollo de nuestra plataforma fue una experiencia excelente. Su dominio en TypeScript y optimización de rendimiento nos permitió acelerar los tiempos de carga y entregar antes de lo previsto. Es un desarrollador con gran criterio técnico y proactivo.",
    rating: 5,
    avatarInitials: "CM",
    avatarGradient: "from-sky-500 to-blue-600",
    accentGradient: "from-sky-500 to-blue-600",
  },
  {
    id: "valentina-morales",
    name: "Valentina Morales",
    role: "Product Lead",
    company: "Kroma Studio",
    project: "Aplicación Móvil & UI Interactiva",
    content:
      "Erick transformó nuestros diseños en una aplicación móvil fluida y reactiva. Su atención al detalle en animaciones, accesibilidad y experiencia de usuario es impresionante. La comunicación fue impecable de inicio a fin.",
    rating: 5,
    avatarInitials: "VM",
    avatarGradient: "from-emerald-500 to-teal-600",
    accentGradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "david-hoffmann",
    name: "David Hoffmann",
    role: "Senior Frontend Architect",
    company: "DevPulse Open Source",
    project: "Librerías & Arquitectura Modular",
    content:
      "El trabajo de Erick en el desarrollo de librerías y componentes interactivos es de nivel internacional. Escribe código limpio, robusto y muy bien documentado. Resolver problemas complejos de arquitectura con elegancia es sin duda su fuerte.",
    rating: 5,
    avatarInitials: "DH",
    avatarGradient: "from-violet-500 to-indigo-600",
    accentGradient: "from-violet-500 to-indigo-600",
  },
  {
    id: "sofia-alarcon",
    name: "Sofía Alarcón",
    role: "Founder & CEO",
    company: "Nexo Digital",
    project: "Sistema Web & PWA",
    content:
      "Contratar a Erick fue una de las mejores decisiones técnicas que tomamos. Desarrolló una solución que superó todas nuestras expectativas en velocidad y facilidad de uso. Es un profesional confiable y sumamente comprometido con los resultados.",
    rating: 5,
    avatarInitials: "SA",
    avatarGradient: "from-amber-500 to-orange-600",
    accentGradient: "from-amber-500 to-orange-600",
  },
];
