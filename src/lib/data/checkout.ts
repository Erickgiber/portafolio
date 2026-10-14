import type { Locale } from "../i18n/translations";
import type { CheckoutStep, PurchaseKind, PurchaseStatus } from "../checkout/state";

export const PAGO_MOVIL = {
  bankCode: "0191",
  bankName: "BNC Banco Nacional de Crédito",
  phone: "0412-0204257",
  idNumber: "V28733885",
};

export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  );
}

type Option = { title: string; text: string };

export type CheckoutCopy = {
  pageTitle: string;
  back: string;
  title: string;
  lead: string;
  perMonth: string;
  approx: string;
  rateNote: string;
  steps: Record<CheckoutStep, string>;
  kinds: Record<PurchaseKind, Option>;
  details: {
    title: string;
    buyerName: string;
    buyerNamePlaceholder: string;
    buyerEmail: string;
    buyerEmailHint: string;
    giftBuyerEmailHint: string;
    recipientName: string;
    recipientNamePlaceholder: string;
    recipientEmail: string;
    recipientEmailHint: string;
    renewEmailHint: string;
    optional: string;
  };
  fieldErrors: {
    emailInvalid: string;
    recipientSame: string;
    nameTooLong: string;
    referenceInvalid: string;
    phoneInvalid: string;
    bankInvalid: string;
    dateInvalid: string;
  };
  method: {
    title: string;
    paypal: Option & { badge: string };
    pagoMovil: Option & { badge: string };
    months: string;
    month: string;
    monthsPlural: string;
  };
  summary: {
    title: string;
    plan: string;
    total: string;
    monthly: string;
    forEmail: string;
    giftFor: string;
    renewFor: string;
  };
  actions: {
    next: string;
    back: string;
    toPayment: string;
    preparing: string;
    changeData: string;
    newPurchase: string;
    retry: string;
    copy: string;
    copied: string;
    copyLink: string;
    send: string;
    sending: string;
    refresh: string;
  };
  paypal: {
    title: string;
    text: string;
    approving: string;
    cancelled: string;
    error: string;
    loading: string;
  };
  pagoMovil: {
    title: string;
    text: string;
    bank: string;
    phone: string;
    idNumber: string;
    amount: string;
    formTitle: string;
    reference: string;
    referenceHint: string;
    payerPhone: string;
    payerBank: string;
    searchBank: string;
    date: string;
    today: string;
    yesterday: string;
    otherDate: string;
  };
  status: {
    names: Record<PurchaseStatus, string>;
    pendingTitle: string;
    pendingText: string;
    paypalPendingTitle: string;
    paypalPendingText: string;
    reviewingTitle: string;
    reviewingText: string;
    completedTitle: string;
    renewedTitle: string;
    renewedText: string;
    completedText: string;
    giftText: string;
    licenseKey: string;
    paidUntil: string;
    activateHint: string;
    subscriptionNote: string;
    rejectedTitle: string;
    rejectedText: string;
    reason: string;
    cancelledTitle: string;
    cancelledText: string;
    privateLink: string;
    privateLinkHint: string;
    savedHere: string;
  };
  history: {
    title: string;
    open: string;
    kinds: Record<PurchaseKind, string>;
  };
  errors: Record<string, string>;
  banners: {
    unavailableTitle: string;
    offlineTitle: string;
    errorTitle: string;
    infoTitle: string;
  };
  cta: {
    buy: string;
    gift: string;
    renew: string;
    note: string;
  };
};

export const checkoutCopy: Record<Locale, CheckoutCopy> = {
  es: {
    pageTitle: "Comprar Vitral | Licencia mensual",
    back: "Vitral",
    title: "Compra tu licencia de Vitral",
    lead: "Una licencia por equipo, $2 al mes. Paga con PayPal o con Pago Móvil y recibe tu clave en esta misma página.",
    perMonth: "$2 al mes",
    approx: "≈ {amount} al mes",
    rateNote: "Tasa de referencia: {rate} {currency} por dólar ({date}).",
    steps: { kind: "Tipo", details: "Datos", method: "Pago", payment: "Pagar", status: "Listo" },
    kinds: {
      new: { title: "Para mí", text: "Una licencia nueva a tu nombre." },
      gift: { title: "Regalar", text: "Compra una licencia para otra persona." },
      renew: { title: "Renovar", text: "Suma meses a una licencia que ya tienes." },
    },
    details: {
      title: "Tus datos",
      buyerName: "Tu nombre",
      buyerNamePlaceholder: "Cómo te llamas",
      buyerEmail: "Tu correo",
      buyerEmailHint: "La licencia quedará asociada a este correo. Vitral lo usará para tu perfil.",
      giftBuyerEmailHint: "Lo usamos para identificar tu compra y contactarte si hace falta.",
      recipientName: "Nombre de quien la recibe",
      recipientNamePlaceholder: "A quién se la regalas",
      recipientEmail: "Correo de quien la recibe",
      recipientEmailHint: "La licencia quedará asociada a este correo.",
      renewEmailHint:
        "Escribe el correo asociado a tu licencia. Ahí sumaremos los meses que pagues.",
      optional: "opcional",
    },
    fieldErrors: {
      emailInvalid: "Escribe un correo válido.",
      recipientSame: "Debe ser un correo distinto al tuyo.",
      nameTooLong: "Como mucho 80 caracteres.",
      referenceInvalid: "Escribe la referencia del pago (solo números).",
      phoneInvalid: "Escribe un teléfono como 0412-1234567.",
      bankInvalid: "Elige el banco desde el que pagaste.",
      dateInvalid: "Elige la fecha del pago.",
    },
    method: {
      title: "¿Cómo quieres pagar?",
      paypal: {
        title: "PayPal",
        text: "Suscripción de $2 al mes que se cobra sola. La licencia se activa al instante y puedes cancelar cuando quieras desde PayPal.",
        badge: "Automático",
      },
      pagoMovil: {
        title: "Pago Móvil",
        text: "Paga en bolívares desde tu banco. Verificamos el pago y activamos tu licencia.",
        badge: "Venezuela",
      },
      months: "¿Cuántos meses?",
      month: "{n} mes",
      monthsPlural: "{n} meses",
    },
    summary: {
      title: "Resumen",
      plan: "Licencia de Vitral",
      total: "Total",
      monthly: "{amount} cada mes",
      forEmail: "Asociada a {email}",
      giftFor: "Regalo para {email}",
      renewFor: "Renovación de la licencia de {email}",
    },
    actions: {
      next: "Continuar",
      back: "Atrás",
      toPayment: "Ir a pagar",
      preparing: "Preparando…",
      changeData: "Cambiar datos",
      newPurchase: "Hacer otra compra",
      retry: "Reintentar",
      copy: "Copiar",
      copied: "Copiado",
      copyLink: "Copiar enlace privado",
      send: "Enviar pago",
      sending: "Enviando…",
      refresh: "Actualizar",
    },
    paypal: {
      title: "Paga con PayPal",
      text: "Se abrirá PayPal para aprobar la suscripción de $2 al mes. Al volver, tu licencia aparecerá aquí.",
      approving: "Confirmando tu pago con PayPal…",
      cancelled: "Cerraste PayPal sin terminar. Puedes intentarlo otra vez cuando quieras.",
      error: "PayPal no pudo completar el pago. Inténtalo otra vez o usa Pago Móvil.",
      loading: "Cargando PayPal…",
    },
    pagoMovil: {
      title: "Paga con Pago Móvil",
      text: "Haz un Pago Móvil con estos datos desde tu banco y luego cuéntanos la referencia.",
      bank: "Banco",
      phone: "Teléfono",
      idNumber: "Cédula",
      amount: "Monto exacto",
      formTitle: "Datos de tu pago",
      reference: "Referencia",
      referenceHint: "El número que te dio tu banco al pagar.",
      payerPhone: "Teléfono desde el que pagaste",
      payerBank: "Banco desde el que pagaste",
      searchBank: "Buscar banco",
      date: "Fecha del pago",
      today: "Hoy",
      yesterday: "Ayer",
      otherDate: "Otra fecha",
    },
    status: {
      names: {
        pending: "Esperando pago",
        reviewing: "Verificando",
        completed: "Lista",
        rejected: "Rechazada",
        cancelled: "Cancelada",
      },
      pendingTitle: "Esperando tu pago",
      pendingText: "Tu compra está guardada. Completa el pago para recibir la licencia.",
      paypalPendingTitle: "Confirmando con PayPal",
      paypalPendingText:
        "PayPal aprobó tu suscripción y estamos esperando la confirmación del primer cobro. Suele tardar unos segundos.",
      reviewingTitle: "Estamos verificando tu pago",
      reviewingText:
        "En cuanto veamos tu Pago Móvil activaremos la licencia, normalmente en pocas horas. Puedes cerrar esta página: tu compra queda guardada en este navegador y en tu enlace privado.",
      completedTitle: "¡Tu licencia está lista!",
      renewedTitle: "¡Licencia renovada!",
      renewedText:
        "No tienes que hacer nada más: Vitral verá la nueva fecha en su próxima comprobación.",
      completedText: "Gracias por apoyar Vitral.",
      giftText: "Envíale esta clave a {email}. La licencia ya está asociada a su correo.",
      licenseKey: "Clave de licencia",
      paidUntil: "Pagada hasta el {date}",
      activateHint: "Abre Vitral, escribe la clave cuando te la pida y listo.",
      subscriptionNote:
        "Tu suscripción de PayPal renovará la licencia cada mes. Puedes cancelarla desde tu cuenta de PayPal.",
      rejectedTitle: "No pudimos confirmar tu pago",
      rejectedText: "Revisa los datos y envíalos otra vez.",
      reason: "Motivo: {note}",
      cancelledTitle: "Pago cancelado",
      cancelledText:
        "La suscripción se canceló antes del primer cobro. Puedes empezar una compra nueva.",
      privateLink: "Enlace privado de tu compra",
      privateLinkHint:
        "Guárdalo: muestra tu compra y tu clave desde cualquier dispositivo. No lo compartas.",
      savedHere: "Compra guardada en este navegador",
    },
    history: {
      title: "Tus compras en este navegador",
      open: "Ver",
      kinds: { new: "Licencia", gift: "Regalo", renew: "Renovación" },
    },
    errors: {
      network: "No hay conexión con el servidor de pagos. Revisa tu internet e inténtalo otra vez.",
      unavailable: "Las compras en línea todavía no están disponibles.",
      license_not_found:
        "No encontramos una licencia asociada a ese correo. Usa el mismo correo con el que activaste Vitral.",
      rate_unavailable:
        "No pudimos obtener la tasa del día. Inténtalo en unos minutos o paga con PayPal.",
      paypal_unavailable: "PayPal no está disponible en este momento. Prueba con Pago Móvil.",
      too_many_requests: "Demasiados intentos seguidos. Espera unos minutos.",
      invalid_fields: "Revisa los datos marcados.",
      not_found: "No encontramos esa compra.",
      already_submitted: "Ya enviaste este pago; lo estamos verificando.",
      subscription_mismatch: "Esa suscripción de PayPal no corresponde a esta compra.",
      already_linked: "Esta compra ya tiene una suscripción de PayPal.",
      server_error: "Algo salió mal. Inténtalo otra vez en un momento.",
    },
    banners: {
      unavailableTitle: "Las compras llegan muy pronto",
      offlineTitle: "No pudimos conectar con los pagos",
      errorTitle: "Algo no salió bien",
      infoTitle: "Un detalle",
    },
    cta: {
      buy: "Comprar licencia",
      gift: "Regalar",
      renew: "Renovar",
      note: "Una licencia por equipo. PayPal o Pago Móvil.",
    },
  },
  en: {
    pageTitle: "Buy Vitral | Monthly license",
    back: "Vitral",
    title: "Get your Vitral license",
    lead: "One license per PC, $2 a month. Pay with PayPal or Pago Móvil and get your key right on this page.",
    perMonth: "$2 a month",
    approx: "≈ {amount} a month",
    rateNote: "Reference rate: {rate} {currency} per dollar ({date}).",
    steps: { kind: "Type", details: "Details", method: "Payment", payment: "Pay", status: "Done" },
    kinds: {
      new: { title: "For me", text: "A new license in your name." },
      gift: { title: "Gift", text: "Buy a license for someone else." },
      renew: { title: "Renew", text: "Add months to a license you already have." },
    },
    details: {
      title: "Your details",
      buyerName: "Your name",
      buyerNamePlaceholder: "What's your name",
      buyerEmail: "Your email",
      buyerEmailHint: "The license will be linked to this email. Vitral uses it for your profile.",
      giftBuyerEmailHint: "We use it to identify your purchase and reach you if needed.",
      recipientName: "Recipient's name",
      recipientNamePlaceholder: "Who it's for",
      recipientEmail: "Recipient's email",
      recipientEmailHint: "The license will be linked to this email.",
      renewEmailHint: "Enter the email linked to your license. We'll add the months you pay there.",
      optional: "optional",
    },
    fieldErrors: {
      emailInvalid: "Enter a valid email.",
      recipientSame: "It must be different from your email.",
      nameTooLong: "80 characters at most.",
      referenceInvalid: "Enter the payment reference (numbers only).",
      phoneInvalid: "Enter a phone like 0412-1234567.",
      bankInvalid: "Choose the bank you paid from.",
      dateInvalid: "Choose the payment date.",
    },
    method: {
      title: "How do you want to pay?",
      paypal: {
        title: "PayPal",
        text: "A $2 monthly subscription that charges itself. The license activates instantly and you can cancel anytime from PayPal.",
        badge: "Automatic",
      },
      pagoMovil: {
        title: "Pago Móvil",
        text: "Pay in bolívares from your bank. We verify the payment and activate your license.",
        badge: "Venezuela",
      },
      months: "How many months?",
      month: "{n} month",
      monthsPlural: "{n} months",
    },
    summary: {
      title: "Summary",
      plan: "Vitral license",
      total: "Total",
      monthly: "{amount} every month",
      forEmail: "Linked to {email}",
      giftFor: "Gift for {email}",
      renewFor: "Renewal of the license for {email}",
    },
    actions: {
      next: "Continue",
      back: "Back",
      toPayment: "Go to payment",
      preparing: "Preparing…",
      changeData: "Change details",
      newPurchase: "Make another purchase",
      retry: "Try again",
      copy: "Copy",
      copied: "Copied",
      copyLink: "Copy private link",
      send: "Send payment",
      sending: "Sending…",
      refresh: "Refresh",
    },
    paypal: {
      title: "Pay with PayPal",
      text: "PayPal will open so you can approve the $2 monthly subscription. When you come back, your license will show up here.",
      approving: "Confirming your payment with PayPal…",
      cancelled: "You closed PayPal before finishing. You can try again anytime.",
      error: "PayPal couldn't complete the payment. Try again or use Pago Móvil.",
      loading: "Loading PayPal…",
    },
    pagoMovil: {
      title: "Pay with Pago Móvil",
      text: "Send a Pago Móvil with these details from your bank, then tell us the reference.",
      bank: "Bank",
      phone: "Phone",
      idNumber: "ID number",
      amount: "Exact amount",
      formTitle: "Your payment details",
      reference: "Reference",
      referenceHint: "The number your bank gave you after paying.",
      payerPhone: "Phone you paid from",
      payerBank: "Bank you paid from",
      searchBank: "Search bank",
      date: "Payment date",
      today: "Today",
      yesterday: "Yesterday",
      otherDate: "Another date",
    },
    status: {
      names: {
        pending: "Awaiting payment",
        reviewing: "Verifying",
        completed: "Ready",
        rejected: "Rejected",
        cancelled: "Cancelled",
      },
      pendingTitle: "Waiting for your payment",
      pendingText: "Your purchase is saved. Complete the payment to get your license.",
      paypalPendingTitle: "Confirming with PayPal",
      paypalPendingText:
        "PayPal approved your subscription and we're waiting for the first charge to clear. It usually takes a few seconds.",
      reviewingTitle: "We're verifying your payment",
      reviewingText:
        "As soon as we see your Pago Móvil we'll activate the license, usually within a few hours. You can close this page: your purchase is saved in this browser and in your private link.",
      completedTitle: "Your license is ready!",
      renewedTitle: "License renewed!",
      renewedText: "Nothing else to do: Vitral will see the new date on its next check.",
      completedText: "Thanks for supporting Vitral.",
      giftText: "Send this key to {email}. The license is already linked to their email.",
      licenseKey: "License key",
      paidUntil: "Paid until {date}",
      activateHint: "Open Vitral, type the key when asked and you're set.",
      subscriptionNote:
        "Your PayPal subscription will renew the license every month. You can cancel it from your PayPal account.",
      rejectedTitle: "We couldn't confirm your payment",
      rejectedText: "Check the details and send them again.",
      reason: "Reason: {note}",
      cancelledTitle: "Payment cancelled",
      cancelledText:
        "The subscription was cancelled before the first charge. You can start a new purchase.",
      privateLink: "Private link to your purchase",
      privateLinkHint: "Keep it: it shows your purchase and key from any device. Don't share it.",
      savedHere: "Purchase saved in this browser",
    },
    history: {
      title: "Your purchases in this browser",
      open: "View",
      kinds: { new: "License", gift: "Gift", renew: "Renewal" },
    },
    errors: {
      network: "Can't reach the payment server. Check your connection and try again.",
      unavailable: "Online purchases aren't available yet.",
      license_not_found:
        "We couldn't find a license linked to that email. Use the same email you activated Vitral with.",
      rate_unavailable:
        "We couldn't get today's rate. Try again in a few minutes or pay with PayPal.",
      paypal_unavailable: "PayPal isn't available right now. Try Pago Móvil.",
      too_many_requests: "Too many attempts in a row. Wait a few minutes.",
      invalid_fields: "Check the highlighted fields.",
      not_found: "We couldn't find that purchase.",
      already_submitted: "You already sent this payment; we're verifying it.",
      subscription_mismatch: "That PayPal subscription doesn't belong to this purchase.",
      already_linked: "This purchase already has a PayPal subscription.",
      server_error: "Something went wrong. Try again in a moment.",
    },
    banners: {
      unavailableTitle: "Purchases are coming very soon",
      offlineTitle: "We couldn't reach the payment server",
      errorTitle: "Something went wrong",
      infoTitle: "Heads up",
    },
    cta: {
      buy: "Buy license",
      gift: "Gift",
      renew: "Renew",
      note: "One license per PC. PayPal or Pago Móvil.",
    },
  },
};
