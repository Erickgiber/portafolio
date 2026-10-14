type PaypalButtons = {
  render: (container: HTMLElement) => Promise<void>;
  close: () => Promise<void>;
  isEligible: () => boolean;
};

type PaypalNamespace = {
  Buttons: (options: Record<string, unknown>) => PaypalButtons;
};

type SubscriptionActions = {
  subscription: { create: (options: Record<string, unknown>) => Promise<string> };
};

export type SubscriptionButtonOptions = {
  clientId: string;
  planId: string;
  purchaseId: string;
  locale: string;
  onApprove: (subscriptionId: string) => void;
  onCancel: () => void;
  onError: () => void;
};

const SDK_URL = "https://www.paypal.com/sdk/js";
let loading: Promise<PaypalNamespace> | null = null;
let loadedClientId = "";

function loadSdk(clientId: string, locale: string): Promise<PaypalNamespace> {
  if (loading && loadedClientId === clientId) {
    return loading;
  }

  loadedClientId = clientId;
  loading = new Promise((resolve, reject) => {
    const params = new URLSearchParams({
      "client-id": clientId,
      vault: "true",
      intent: "subscription",
      components: "buttons",
      locale,
    });
    const script = document.createElement("script");
    script.src = `${SDK_URL}?${params}`;
    script.async = true;
    script.dataset.namespace = "paypalVitral";
    script.onload = () => {
      const namespace = (window as unknown as { paypalVitral?: PaypalNamespace }).paypalVitral;
      if (namespace) {
        resolve(namespace);
      } else {
        reject(new Error("PayPal SDK missing"));
      }
    };
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("PayPal SDK failed to load"));
    };
    document.head.append(script);
  });
  return loading;
}

export async function renderSubscriptionButton(
  container: HTMLElement,
  options: SubscriptionButtonOptions
): Promise<() => void> {
  const paypal = await loadSdk(options.clientId, options.locale);
  const buttons = paypal.Buttons({
    style: { layout: "vertical", color: "gold", shape: "pill", label: "subscribe", height: 48 },
    createSubscription: (_data: unknown, actions: SubscriptionActions) =>
      actions.subscription.create({
        plan_id: options.planId,
        custom_id: options.purchaseId,
        application_context: {
          brand_name: "Vitral",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
        },
      }),
    onApprove: (data: { subscriptionID?: string }) => {
      if (data.subscriptionID) {
        options.onApprove(data.subscriptionID);
      } else {
        options.onError();
      }
    },
    onCancel: options.onCancel,
    onError: options.onError,
  });
  await buttons.render(container);
  return () => {
    buttons.close().catch(() => {});
  };
}
