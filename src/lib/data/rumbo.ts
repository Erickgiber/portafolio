import type { Locale } from "../i18n/translations";
import type { ViewerCopy } from "../viewer/types";
import type { VitralFeature, VitralShot, VitralUnits } from "./vitral";

export const PROTON_DOWNLOADS_URL = "https://account.protonvpn.com/downloads";

export type RumboCopy = {
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
  freeNote: string;
  mobileNote: string;
  units: VitralUnits;
  screenshotAlt: string;
  scrollHint: string;
  scrollLabel: string;
  guideLink: string;
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
  guideTitle: string;
  guideLead: string;
  guide: VitralFeature[];
  guideAction: string;
  footer: string;
};

export const rumboCopy: Record<Locale, RumboCopy> = {
  es: {
    pageTitle: "Rumbo | Proton VPN solo para los sitios que elijas",
    back: "Portafolio",
    badge: "Gratis · Para Windows 10 y 11",
    headline: "Proton VPN,",
    headlineAccent: "solo donde lo necesitas",
    lead: "Rumbo envía por el proxy de Proton VPN únicamente los sitios que elijas. El resto de tu conexión sigue directa, como siempre, y todo se controla desde la bandeja de Windows con un clic.",
    download: "Descargar Rumbo",
    downloading: "Descargando",
    preparing: "Preparando la descarga",
    saving: "Guardando el instalador",
    done: "Descarga completa",
    doneHint: "El instalador ya está en tu carpeta de descargas. Ábrelo para instalar Rumbo.",
    saveAgain: "Guardar otra vez",
    cancel: "Cancelar",
    retry: "Reintentar",
    failed: "La descarga se interrumpió. Revisa tu conexión y vuelve a intentarlo.",
    canceled: "Descarga cancelada.",
    leaveWhileBusy:
      "La descarga de Rumbo sigue en curso. Si sales de esta página se cancelará. ¿Salir de todos modos?",
    version: "Versión",
    size: "Tamaño",
    remaining: "restante",
    requirements: "Windows 10 u 11 de 64 bits · Cuenta de Proton VPN (sirve la gratuita)",
    freeNote:
      "Rumbo es gratis. Solo pide tu nombre y tu correo al empezar; tus claves de Proton nunca salen de tu PC.",
    mobileNote:
      "Rumbo es un programa para PC. Abre esta página desde tu computadora para descargarlo.",
    units: {
      megabytes: "MB",
      megabytesPerSecond: "MB/s",
      minutes: "min",
      seconds: "s",
    },
    screenshotAlt: "Ventana de Rumbo con el proxy activo",
    scrollHint: "Desliza para descubrir más",
    scrollLabel: "Ir al contenido",
    guideLink: "Cómo conseguir tu archivo de Proton VPN",
    handleOpen: "Arrastra hacia arriba o toca para ver el contenido",
    handleClose: "Arrastra hacia abajo o toca para volver al inicio",
    homeShot: {
      image: "/rumbo/home.webp",
      title: "Inicio",
      text: "Activa o desactiva el proxy con un interruptor.",
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
    featuresTitle: "Un proxy cómodo, no una VPN completa",
    features: [
      {
        icon: "mdi:source-branch",
        title: "Solo los sitios que elijas",
        text: "Agrega dominios como chatgpt.com o claude.ai. Esos pasan por Proton VPN; todo lo demás sigue por tu conexión normal, sin perder velocidad.",
      },
      {
        icon: "mdi:gesture-tap-button",
        title: "Un clic desde la bandeja",
        text: "Rumbo vive junto al reloj de Windows. Actívalo o desactívalo con clic derecho, y el color del icono te dice si está conectado.",
      },
      {
        icon: "mdi:power",
        title: "Se inicia con Windows",
        text: "Arranca en segundo plano al encender el PC y vuelve a conectar si lo dejaste activo. Si el túnel cae, se reconecta solo.",
      },
      {
        icon: "mdi:file-cog-outline",
        title: "Tu archivo PAC, a tu manera",
        text: "Rumbo lo genera y lo sirve en tu propio PC, lo guarda en un gist secreto de GitHub o usa la dirección del que ya tengas. Windows se configura solo.",
      },
      {
        icon: "mdi:shield-lock-outline",
        title: "Tus claves se quedan en tu PC",
        text: "La configuración de Proton se guarda cifrada con la protección de Windows. Al desactivar o desinstalar, el proxy del sistema vuelve a como estaba.",
      },
      {
        icon: "mdi:cloud-download-outline",
        title: "Se actualiza solo",
        text: "Las versiones nuevas llegan desde la nube y se instalan en segundo plano, sin perder tu configuración ni tu lista de sitios.",
      },
    ],
    shotsTitle: "Así se ve",
    shots: [
      {
        image: "/rumbo/sites.webp",
        title: "Tus sitios",
        text: "Pega direcciones o dominios y comprueba cuáles irán por el proxy.",
      },
      {
        image: "/rumbo/proton.webp",
        title: "Claves de Proton VPN",
        text: "Importa el archivo .conf en un paso.",
      },
      {
        image: "/rumbo/pac.webp",
        title: "Archivo PAC",
        text: "En tu PC, en un gist o en tu propia dirección.",
      },
    ],
    stepsTitle: "Empieza en tres pasos",
    steps: [
      "Descarga el instalador con el botón de arriba y ábrelo.",
      "Escribe tu nombre y tu correo, e importa tu archivo de Proton VPN.",
      "Elige los sitios que deben usar el proxy y actívalo.",
    ],
    guideTitle: "Tu archivo de Proton VPN",
    guideLead:
      "Rumbo usa la configuración WireGuard de tu cuenta de Proton VPN. Se consigue gratis en un minuto:",
    guide: [
      {
        icon: "mdi:login",
        title: "Entra en tu cuenta de Proton",
        text: "Abre account.protonvpn.com con tu cuenta, aunque sea la gratuita, y ve a Descargas.",
      },
      {
        icon: "mdi:server-network",
        title: "Crea una configuración WireGuard",
        text: "En «Configuración de WireGuard» ponle un nombre al equipo, elige cualquier plataforma y un servidor, y pulsa Crear.",
      },
      {
        icon: "mdi:file-import-outline",
        title: "Impórtala en Rumbo",
        text: "Descarga el archivo .conf y elígelo con «Importar archivo .conf…». Rumbo lee las claves y el servidor por ti.",
      },
    ],
    guideAction: "Abrir las descargas de Proton VPN",
    footer: "Rumbo es un proyecto de Erick Ramírez. No está afiliado a Proton AG.",
  },
  en: {
    pageTitle: "Rumbo | Proton VPN only for the sites you choose",
    back: "Portfolio",
    badge: "Free · For Windows 10 and 11",
    headline: "Proton VPN,",
    headlineAccent: "only where you need it",
    lead: "Rumbo sends only the sites you choose through the Proton VPN proxy. The rest of your connection stays direct, as always, and everything is controlled from the Windows tray with one click.",
    download: "Download Rumbo",
    downloading: "Downloading",
    preparing: "Preparing the download",
    saving: "Saving the installer",
    done: "Download complete",
    doneHint: "The installer is in your downloads folder. Open it to install Rumbo.",
    saveAgain: "Save again",
    cancel: "Cancel",
    retry: "Try again",
    failed: "The download was interrupted. Check your connection and try again.",
    canceled: "Download canceled.",
    leaveWhileBusy: "Rumbo is still downloading. Leaving this page will cancel it. Leave anyway?",
    version: "Version",
    size: "Size",
    remaining: "left",
    requirements: "64-bit Windows 10 or 11 · Proton VPN account (the free one works)",
    freeNote:
      "Rumbo is free. It only asks for your name and email to get started; your Proton keys never leave your PC.",
    mobileNote: "Rumbo is a PC program. Open this page on your computer to download it.",
    units: {
      megabytes: "MB",
      megabytesPerSecond: "MB/s",
      minutes: "min",
      seconds: "s",
    },
    screenshotAlt: "Rumbo window with the proxy on",
    scrollHint: "Scroll to discover more",
    scrollLabel: "Go to content",
    guideLink: "How to get your Proton VPN file",
    handleOpen: "Drag up or tap to see the content",
    handleClose: "Drag down or tap to go back to the top",
    homeShot: {
      image: "/rumbo/home.webp",
      title: "Home",
      text: "Turn the proxy on or off with a switch.",
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
    featuresTitle: "A handy proxy, not a full VPN",
    features: [
      {
        icon: "mdi:source-branch",
        title: "Only the sites you choose",
        text: "Add domains like chatgpt.com or claude.ai. Those go through Proton VPN; everything else keeps using your normal connection, at full speed.",
      },
      {
        icon: "mdi:gesture-tap-button",
        title: "One click from the tray",
        text: "Rumbo lives next to the Windows clock. Turn it on or off with a right click, and the icon color tells you whether it is connected.",
      },
      {
        icon: "mdi:power",
        title: "Starts with Windows",
        text: "It starts in the background when you turn on your PC and reconnects if you left it on. If the tunnel drops, it reconnects by itself.",
      },
      {
        icon: "mdi:file-cog-outline",
        title: "Your PAC file, your way",
        text: "Rumbo creates it and serves it from your own PC, keeps it in a secret GitHub gist, or uses the address of the one you already have. Windows is set up for you.",
      },
      {
        icon: "mdi:shield-lock-outline",
        title: "Your keys stay on your PC",
        text: "Your Proton settings are encrypted with Windows data protection. When you turn it off or uninstall it, the system proxy goes back to how it was.",
      },
      {
        icon: "mdi:cloud-download-outline",
        title: "Updates itself",
        text: "New versions arrive from the cloud and install in the background, without losing your settings or your list of sites.",
      },
    ],
    shotsTitle: "How it looks",
    shots: [
      {
        image: "/rumbo/sites.webp",
        title: "Your sites",
        text: "Paste addresses or domains and check which ones use the proxy.",
      },
      {
        image: "/rumbo/proton.webp",
        title: "Proton VPN keys",
        text: "Import the .conf file in one step.",
      },
      {
        image: "/rumbo/pac.webp",
        title: "PAC file",
        text: "On your PC, in a gist or at your own address.",
      },
    ],
    stepsTitle: "Start in three steps",
    steps: [
      "Download the installer with the button above and open it.",
      "Type your name and email, and import your Proton VPN file.",
      "Choose the sites that should use the proxy and turn it on.",
    ],
    guideTitle: "Your Proton VPN file",
    guideLead:
      "Rumbo uses the WireGuard settings from your Proton VPN account. You can get them for free in a minute:",
    guide: [
      {
        icon: "mdi:login",
        title: "Sign in to Proton",
        text: "Open account.protonvpn.com with your account, even the free one, and go to Downloads.",
      },
      {
        icon: "mdi:server-network",
        title: "Create a WireGuard configuration",
        text: "Under “WireGuard configuration”, name the device, pick any platform and a server, and press Create.",
      },
      {
        icon: "mdi:file-import-outline",
        title: "Import it into Rumbo",
        text: "Download the .conf file and choose it with “Importar archivo .conf…” (the app is in Spanish). Rumbo reads the keys and the server for you.",
      },
    ],
    guideAction: "Open Proton VPN downloads",
    footer: "Rumbo is a project by Erick Ramírez. It is not affiliated with Proton AG.",
  },
};
