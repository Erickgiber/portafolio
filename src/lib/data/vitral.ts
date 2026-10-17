import type { Locale } from "../i18n/translations";
import type { ViewerCopy } from "../viewer/types";

export const VITRAL_PRODUCT_HUNT_URL = "https://www.producthunt.com/products/vitral";

export type VitralFeature = {
  icon: string;
  title: string;
  text: string;
};

export type VitralShot = {
  image: string;
  title: string;
  text: string;
};

export type VitralUnits = {
  megabytes: string;
  megabytesPerSecond: string;
  minutes: string;
  seconds: string;
};

export type VitralCopy = {
  pageTitle: string;
  back: string;
  badge: string;
  headline: string;
  headlineAccent: string;
  lead: string;
  download: string;
  downloading: string;
  preparing: string;
  saving: string;
  done: string;
  doneHint: string;
  saveAgain: string;
  cancel: string;
  retry: string;
  failed: string;
  canceled: string;
  leaveWhileBusy: string;
  version: string;
  size: string;
  remaining: string;
  requirements: string;
  licenseNote: string;
  mobileNote: string;
  units: VitralUnits;
  screenshotAlt: string;
  scrollHint: string;
  scrollLabel: string;
  tipsLink: string;
  handleOpen: string;
  handleClose: string;
  homeShot: VitralShot;
  viewer: ViewerCopy;
  openImage: string;
  featuresTitle: string;
  features: VitralFeature[];
  shotsTitle: string;
  shots: VitralShot[];
  stepsTitle: string;
  steps: string[];
  tipsTitle: string;
  tipsLead: string;
  tips: VitralFeature[];
  footer: string;
};

export const vitralCopy: Record<Locale, VitralCopy> = {
  es: {
    pageTitle: "Vitral | Tu PC como una consola",
    back: "Portafolio",
    badge: "Para Windows 10 y 11",
    headline: "Tu PC,",
    headlineAccent: "como una consola",
    lead: "Vitral pone una pantalla de inicio pensada para el mando sobre tu biblioteca de juegos, y una guía que se abre encima de cualquier juego con el botón central.",
    download: "Descargar Vitral",
    downloading: "Descargando",
    preparing: "Preparando la descarga",
    saving: "Guardando el instalador",
    done: "Descarga completa",
    doneHint: "El instalador ya está en tu carpeta de descargas. Ábrelo para instalar Vitral.",
    saveAgain: "Guardar otra vez",
    cancel: "Cancelar",
    retry: "Reintentar",
    failed: "La descarga se interrumpió. Revisa tu conexión y vuelve a intentarlo.",
    canceled: "Descarga cancelada.",
    leaveWhileBusy:
      "La descarga de Vitral sigue en curso. Si sales de esta página se cancelará. ¿Salir de todos modos?",
    version: "Versión",
    size: "Tamaño",
    remaining: "restante",
    requirements: "Windows 10 u 11 de 64 bits · Mando Xbox, PlayStation o Switch",
    licenseNote: "Vitral se activa con una clave de licencia.",
    mobileNote:
      "Vitral es un programa para PC. Abre esta página desde tu computadora para descargarlo.",
    units: {
      megabytes: "MB",
      megabytesPerSecond: "MB/s",
      minutes: "min",
      seconds: "s",
    },
    screenshotAlt: "Pantalla de inicio de Vitral con la biblioteca de juegos",
    scrollHint: "Desliza para descubrir más",
    scrollLabel: "Ir al contenido",
    tipsLink: "Consejos para que el botón central abra solo Vitral",
    handleOpen: "Arrastra hacia arriba o toca para ver el contenido",
    handleClose: "Arrastra hacia abajo o toca para volver al inicio",
    homeShot: {
      image: "/vitral/home.webp",
      title: "Pantalla de inicio",
      text: "Tu biblioteca con carátulas y fondos.",
    },
    viewer: {
      label: "Visor de imágenes",
      close: "Cerrar visor",
      previous: "Imagen anterior",
      next: "Imagen siguiente",
      zoomIn: "Acercar",
      zoomOut: "Alejar",
      counter: "{current} de {total}",
    },
    openImage: "Ver imagen ampliada",
    featuresTitle: "Todo lo que esperas de una consola",
    features: [
      {
        icon: "mdi:controller",
        title: "Hecho para el mando",
        text: "Navega tu biblioteca, lanza juegos y cambia ajustes sin tocar el teclado. Los botones en pantalla siguen a tu mando: Xbox, PlayStation o Switch.",
      },
      {
        icon: "mdi:view-dashboard-outline",
        title: "Una guía sobre cualquier juego",
        text: "El botón central abre la guía encima de lo que estés jugando: volumen, juegos abiertos, amigos y ajustes, con el juego en pausa.",
      },
      {
        icon: "mdi:record-circle-outline",
        title: "Capturas y grabación",
        text: "Graba a 60 fps o captura la pantalla con un atajo del mando, y compártelo por WhatsApp, Discord o cualquier otra app.",
      },
      {
        icon: "mdi:account-group-outline",
        title: "Amigos e invitaciones",
        text: "Mira a qué juegan tus amigos, invítalos a tu partida y recibe sus invitaciones como notificaciones.",
      },
      {
        icon: "mdi:steam",
        title: "Tu biblioteca en un solo sitio",
        text: "Reúne los juegos de Steam, Epic Games, Xbox, Riot y Rockstar con sus carátulas y fondos.",
      },
      {
        icon: "mdi:cloud-download-outline",
        title: "Se actualiza solo",
        text: "Las versiones nuevas llegan desde la nube y se instalan al abrir Vitral, sin perder tus datos.",
      },
    ],
    shotsTitle: "Así se ve",
    shots: [
      {
        image: "/vitral/guide.webp",
        title: "La guía",
        text: "Se abre sobre el juego con el botón central.",
      },
      {
        image: "/vitral/details.webp",
        title: "Detalles del juego",
        text: "Carátula, descripción y tiempo jugado.",
      },
      {
        image: "/vitral/gallery.webp",
        title: "Capturas y grabaciones",
        text: "Tu galería, lista para compartir.",
      },
    ],
    stepsTitle: "Empieza en tres pasos",
    steps: [
      "Descarga el instalador con el botón de arriba.",
      "Ábrelo y elige dónde instalar Vitral.",
      "Escribe tu clave de licencia, elige tu nombre y empieza a jugar.",
    ],
    tipsTitle: "Consejos para usarlo mejor",
    tipsLead:
      "El botón central del mando lo usan varios programas a la vez. Para que solo abra la guía de Vitral:",
    tips: [
      {
        icon: "mdi:steam",
        title: "Desactiva el botón Guía en Steam",
        text: "En Steam, abre Configuración → Mando y apaga la opción que hace que el botón Guía abra Steam (Guide Button Focuses Steam). Así Steam no se pone delante de tus juegos al pulsarlo.",
      },
      {
        icon: "mdi:microsoft-xbox",
        title: "Desactiva Xbox Game Bar en el mando",
        text: "En la Configuración de Windows, entra en Juegos → Game Bar y apaga la opción que abre Game Bar con el botón del mando. Vitral intenta hacerlo solo al instalarse; si Game Bar sigue apareciendo, revísalo ahí.",
      },
    ],
    footer: "Vitral es un proyecto de Erick Ramírez.",
  },
  en: {
    pageTitle: "Vitral | Your PC as a console",
    back: "Portfolio",
    badge: "For Windows 10 and 11",
    headline: "Your PC,",
    headlineAccent: "as a console",
    lead: "Vitral puts a home screen made for the controller on top of your game library, and a guide that opens over any game with the home button.",
    download: "Download Vitral",
    downloading: "Downloading",
    preparing: "Preparing the download",
    saving: "Saving the installer",
    done: "Download complete",
    doneHint: "The installer is in your downloads folder. Open it to install Vitral.",
    saveAgain: "Save again",
    cancel: "Cancel",
    retry: "Try again",
    failed: "The download was interrupted. Check your connection and try again.",
    canceled: "Download canceled.",
    leaveWhileBusy: "Vitral is still downloading. Leaving this page will cancel it. Leave anyway?",
    version: "Version",
    size: "Size",
    remaining: "left",
    requirements: "64-bit Windows 10 or 11 · Xbox, PlayStation or Switch controller",
    licenseNote: "Vitral is activated with a license key.",
    mobileNote: "Vitral is a PC program. Open this page on your computer to download it.",
    units: {
      megabytes: "MB",
      megabytesPerSecond: "MB/s",
      minutes: "min",
      seconds: "s",
    },
    screenshotAlt: "Vitral home screen with the game library",
    scrollHint: "Scroll to discover more",
    scrollLabel: "Go to content",
    tipsLink: "Tips so the home button opens only Vitral",
    handleOpen: "Drag up or tap to see the content",
    handleClose: "Drag down or tap to go back to the top",
    homeShot: {
      image: "/vitral/home.webp",
      title: "Home screen",
      text: "Your library with covers and backgrounds.",
    },
    viewer: {
      label: "Image viewer",
      close: "Close viewer",
      previous: "Previous image",
      next: "Next image",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      counter: "{current} of {total}",
    },
    openImage: "View larger image",
    featuresTitle: "Everything you expect from a console",
    features: [
      {
        icon: "mdi:controller",
        title: "Made for the controller",
        text: "Browse your library, launch games and change settings without touching the keyboard. On-screen buttons follow your controller: Xbox, PlayStation or Switch.",
      },
      {
        icon: "mdi:view-dashboard-outline",
        title: "A guide over any game",
        text: "The home button opens the guide on top of whatever you are playing: volume, open games, friends and settings, with the game paused.",
      },
      {
        icon: "mdi:record-circle-outline",
        title: "Screenshots and recording",
        text: "Record at 60 fps or take a screenshot with a controller shortcut, and share it through WhatsApp, Discord or any other app.",
      },
      {
        icon: "mdi:account-group-outline",
        title: "Friends and invitations",
        text: "See what your friends are playing, invite them to your game and get their invitations as notifications.",
      },
      {
        icon: "mdi:steam",
        title: "Your library in one place",
        text: "Brings together your Steam, Epic Games, Xbox, Riot and Rockstar games with their covers and backgrounds.",
      },
      {
        icon: "mdi:cloud-download-outline",
        title: "Updates itself",
        text: "New versions arrive from the cloud and install when Vitral opens, without losing your data.",
      },
    ],
    shotsTitle: "How it looks",
    shots: [
      {
        image: "/vitral/guide.webp",
        title: "The guide",
        text: "Opens over the game with the home button.",
      },
      {
        image: "/vitral/details.webp",
        title: "Game details",
        text: "Cover, description and time played.",
      },
      {
        image: "/vitral/gallery.webp",
        title: "Screenshots and recordings",
        text: "Your gallery, ready to share.",
      },
    ],
    stepsTitle: "Start in three steps",
    steps: [
      "Download the installer with the button above.",
      "Open it and choose where to install Vitral.",
      "Type your license key, choose your name and start playing.",
    ],
    tipsTitle: "Tips for a better experience",
    tipsLead:
      "Several programs listen to the controller's home button. To make it open only the Vitral guide:",
    tips: [
      {
        icon: "mdi:steam",
        title: "Turn off the Guide button in Steam",
        text: "In Steam, open Settings → Controller and turn off Guide Button Focuses Steam. That way Steam won't jump in front of your games when you press it.",
      },
      {
        icon: "mdi:microsoft-xbox",
        title: "Turn off Xbox Game Bar on the controller",
        text: "In Windows Settings, go to Gaming → Game Bar and turn off the option that opens Game Bar with the controller button. Vitral tries to do this by itself when installed; if Game Bar still shows up, check it there.",
      },
    ],
    footer: "Vitral is a project by Erick Ramírez.",
  },
};
