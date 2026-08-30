export type Locale = "es" | "en";

export interface ProjectTranslation {
  title: string;
  description: string;
}

export interface Translations {
  nav: {
    about: string;
    skills: string;
    projects: string;
    contact: string;
    home: string;
  };
  hero: {
    prefix: string;
    name: string;
    subtitle: string;
    ctaProjects: string;
    ctaContact: string;
  };
  about: {
    title: string;
    subtitle: string;
    bio: string;
    quote: string;
    badges: {
      location: string;
      role: string;
      creator: string;
    };
  };
  skills: {
    title: string;
    subtitle: string;
    categories: {
      frontend: string;
      backend: string;
      tools: string;
      testing: string;
    };
  };
  projects: {
    title: string;
    subtitle: string;
    btnDemo: string;
    btnCode: string;
    btnStore: string;
    items: Record<string, ProjectTranslation>;
  };
  contact: {
    title: string;
    subtitle: string;
    connectTitle: string;
    connectText: string;
    emailLabel: string;
    githubLabel: string;
    linkedinLabel: string;
    googlePlayLabel: string;
    form: {
      nameLabel: string;
      namePlaceholder: string;
      emailLabel: string;
      emailPlaceholder: string;
      messageLabel: string;
      messagePlaceholder: string;
      sendBtn: string;
      sendingBtn: string;
      successMsg: string;
      errorMsg: string;
    };
  };
  footer: {
    rights: string;
  };
  meta: {
    title: string;
    description: string;
  };
  theme: {
    lightMode: string;
    darkMode: string;
    switchToLight: string;
    switchToDark: string;
  };
  lang: {
    es: string;
    en: string;
    selectLanguage: string;
    switchTo: string;
  };
}

export const translations: Record<Locale, Translations> = {
  es: {
    nav: {
      about: "Sobre mí",
      skills: "Habilidades",
      projects: "Proyectos",
      contact: "Contacto",
      home: "Inicio",
    },
    hero: {
      prefix: "Hola, soy ",
      name: "Erick Ramírez",
      subtitle:
        "Desarrollador Full Stack & Mobile | Open Source Creator — Creando herramientas para desarrolladores, librerías modernas y aplicaciones de alto rendimiento.",
      ctaProjects: "Ver mis proyectos",
      ctaContact: "Contactarme",
    },
    about: {
      title: "Sobre mí",
      subtitle: "Conoce un poco más acerca de mi trayectoria, enfoque y filosofía de desarrollo.",
      bio: "¡Hola! 👋 Soy Erick Ramírez, Desarrollador Full Stack con enfoque en la creación de herramientas para desarrolladores, librerías modernas y aplicaciones web/móviles eficientes. Me encanta resolver problemas complejos y transformar ideas en productos open source funcionales y de alto rendimiento.",
      quote: "La tecnología no tiene fronteras, y tampoco mis sueños.",
      badges: {
        location: "Venezuela",
        role: "Full Stack & Mobile",
        creator: "Open Source Creator",
      },
    },
    skills: {
      title: "Habilidades Técnicas",
      subtitle:
        "Herramientas y tecnologías que domino para construir soluciones robustas de punta a punta.",
      categories: {
        frontend: "Frontend & UI",
        backend: "Backend & Mobile",
        tools: "Herramientas & Entorno",
        testing: "Testing & QA",
      },
    },
    projects: {
      title: "Proyectos Destacados",
      subtitle:
        "Una selección de aplicaciones, herramientas y librerías modernas que he desarrollado.",
      btnDemo: "Demo",
      btnCode: "Código",
      btnStore: "Google Play",
      items: {
        "wallet-track": {
          title: "WalletTrack: Control de Gastos",
          description:
            "Aplicación móvil para gestión de finanzas personales, presupuestos y control inteligente de gastos diarios.",
        },
        "canvapps-framework": {
          title: "CanvApps Framework",
          description:
            "Framework moderno diseñado para construir aplicaciones visuales, interactivas y ricas basadas en Canvas HTML5.",
        },
        "google-canvas": {
          title: "Google Canvas",
          description:
            "Clon interactivo de Google construido íntegramente sobre Canvas HTML5 con el framework CanvApps para demostrar su potencial.",
        },
        "cv-generator": {
          title: "CV Generator",
          description:
            "Página web hecha con Svelte 5 para crear currículums con variedad de plantillas, vista previa y exportación a PDF o imagen.",
        },
        sharedom: {
          title: "ShareDOM",
          description:
            "Librería ultraligera y rápida para capturar snapshots y screenshots del DOM para Browser y SSR (Next.js, SvelteKit).",
        },
        "svelte-spa-template": {
          title: "Svelte SPA Template",
          description:
            "Plantilla optimizada y lista para producción para Single Page Applications con Svelte (9 ⭐ en GitHub).",
        },
        "debts-my-clients": {
          title: "Debts My Clients",
          description:
            "Sistema integral para la gestión de cuentas y deudas de clientes con almacenamiento local y versión PWA.",
        },
        "audio-giber": {
          title: "Audio Giber",
          description:
            "Librería ligera para simplificar el manejo, contexto y reproducción de audio en la web.",
        },
        "video-downloader-by-link": {
          title: "Video Downloader by Link",
          description:
            "Página web para descargar videos desde enlaces con previsualizador integrado y soporte para múltiples servidores.",
        },
      },
    },
    contact: {
      title: "Contacto",
      subtitle: "¿Tienes una idea, propuesta o proyecto en mente? ¡Hablemos y hagámoslo realidad!",
      connectTitle: "¡Conectemos!",
      connectText:
        "Estoy siempre abierto a nuevas oportunidades, proyectos interesantes y colaboraciones open source.",
      emailLabel: "Email",
      githubLabel: "GitHub",
      linkedinLabel: "LinkedIn",
      googlePlayLabel: "Google Play",
      form: {
        nameLabel: "Nombre",
        namePlaceholder: "Tu nombre",
        emailLabel: "Email",
        emailPlaceholder: "tu@email.com",
        messageLabel: "Mensaje",
        messagePlaceholder: "Cuéntame sobre tu proyecto...",
        sendBtn: "Enviar mensaje",
        sendingBtn: "Enviando...",
        successMsg: "¡Mensaje enviado con éxito! Te responderé lo antes posible.",
        errorMsg: "Ocurrió un error al enviar el mensaje. Por favor intenta de nuevo.",
      },
    },
    footer: {
      rights: "Erick Ramírez. Todos los derechos reservados.",
    },
    meta: {
      title: "Erick Ramírez | Desarrollador Full Stack & Mobile | Open Source Creator",
      description:
        "Portafolio oficial de Erick Ramírez (Erickgiber) — Desarrollador Full Stack & Mobile de Venezuela. Creador del framework CanvApps, la librería ShareDOM y la app WalletTrack en Google Play.",
    },
    theme: {
      lightMode: "Modo claro",
      darkMode: "Modo oscuro",
      switchToLight: "Cambiar a modo claro",
      switchToDark: "Cambiar a modo oscuro",
    },
    lang: {
      es: "Español",
      en: "Inglés",
      selectLanguage: "Cambiar idioma",
      switchTo: "Cambiar a Inglés (EN)",
    },
  },
  en: {
    nav: {
      about: "About me",
      skills: "Skills",
      projects: "Projects",
      contact: "Contact",
      home: "Home",
    },
    hero: {
      prefix: "Hi, I'm ",
      name: "Erick Ramírez",
      subtitle:
        "Full Stack & Mobile Developer | Open Source Creator — Crafting developer tools, modern libraries, and high-performance applications.",
      ctaProjects: "View my projects",
      ctaContact: "Contact me",
    },
    about: {
      title: "About me",
      subtitle: "Learn more about my journey, technical focus, and development philosophy.",
      bio: "Hi! 👋 I'm Erick Ramírez, Full Stack Developer specialized in building developer tooling, modern open source libraries, and efficient web/mobile applications. I love solving challenging engineering problems and turning ideas into reliable, high-performance software.",
      quote: "Technology knows no borders, and neither do my dreams.",
      badges: {
        location: "Venezuela",
        role: "Full Stack & Mobile",
        creator: "Open Source Creator",
      },
    },
    skills: {
      title: "Technical Skills",
      subtitle: "Technologies and tools I master to engineer robust end-to-end solutions.",
      categories: {
        frontend: "Frontend & UI",
        backend: "Backend & Mobile",
        tools: "Tools & Environment",
        testing: "Testing & QA",
      },
    },
    projects: {
      title: "Featured Projects",
      subtitle:
        "A curated selection of modern applications, libraries, and developer tools I've built.",
      btnDemo: "Demo",
      btnCode: "Code",
      btnStore: "Google Play",
      items: {
        "wallet-track": {
          title: "WalletTrack: Expense Tracker",
          description:
            "Mobile application for personal finance management, budget planning, and smart daily expense tracking.",
        },
        "canvapps-framework": {
          title: "CanvApps Framework",
          description:
            "Modern lightweight framework designed to build rich, interactive visual applications on HTML5 Canvas.",
        },
        "google-canvas": {
          title: "Google Canvas",
          description:
            "Interactive Google clone built entirely on HTML5 Canvas using CanvApps to demonstrate its full capabilities.",
        },
        "cv-generator": {
          title: "CV Generator",
          description:
            "Web app built with Svelte 5 to create professional resumes with diverse templates, live preview, and PDF/image export.",
        },
        sharedom: {
          title: "ShareDOM",
          description:
            "Ultra-fast and lightweight DOM snapshotting and screenshot library for Browser and SSR environments.",
        },
        "svelte-spa-template": {
          title: "Svelte SPA Template",
          description:
            "Production-ready, highly optimized Single Page Application template powered by Svelte and Vite (9 ⭐ on GitHub).",
        },
        "debts-my-clients": {
          title: "Debts My Clients",
          description:
            "Comprehensive client accounts and debt tracking application with offline-first local storage and PWA support.",
        },
        "audio-giber": {
          title: "Audio Giber",
          description:
            "Lightweight JavaScript library to simplify web audio context, sound manipulation, and audio playback.",
        },
        "video-downloader-by-link": {
          title: "Video Downloader by Link",
          description:
            "Web platform to download videos from links with built-in preview and multi-provider media support.",
        },
      },
    },
    contact: {
      title: "Contact",
      subtitle: "Have an idea, project, or opportunity in mind? Let's connect and make it happen!",
      connectTitle: "Let's Connect!",
      connectText:
        "I'm always open to new professional opportunities, interesting projects, and open source collaboration.",
      emailLabel: "Email",
      githubLabel: "GitHub",
      linkedinLabel: "LinkedIn",
      googlePlayLabel: "Google Play",
      form: {
        nameLabel: "Name",
        namePlaceholder: "Your name",
        emailLabel: "Email",
        emailPlaceholder: "your@email.com",
        messageLabel: "Message",
        messagePlaceholder: "Tell me about your project...",
        sendBtn: "Send message",
        sendingBtn: "Sending...",
        successMsg: "Message sent successfully! I will get back to you as soon as possible.",
        errorMsg: "An error occurred while sending your message. Please try again.",
      },
    },
    footer: {
      rights: "Erick Ramírez. All rights reserved.",
    },
    meta: {
      title: "Erick Ramírez | Full Stack & Mobile Developer | Open Source Creator",
      description:
        "Official portfolio of Erick Ramírez (Erickgiber) — Full Stack & Mobile Developer from Venezuela. Creator of CanvApps framework, ShareDOM library, and WalletTrack on Google Play.",
    },
    theme: {
      lightMode: "Light mode",
      darkMode: "Dark mode",
      switchToLight: "Switch to light mode",
      switchToDark: "Switch to dark mode",
    },
    lang: {
      es: "Spanish",
      en: "English",
      selectLanguage: "Change language",
      switchTo: "Switch to Spanish (ES)",
    },
  },
};
