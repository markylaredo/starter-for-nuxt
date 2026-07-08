type FirebaseAppConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

type FirebaseCompatApp = {
  messaging: () => FirebaseCompatMessaging;
};

type FirebaseCompatMessaging = {
  getToken: (options: {
    vapidKey: string;
    serviceWorkerRegistration: ServiceWorkerRegistration;
  }) => Promise<string>;
  onMessage: (handler: (payload: FirebaseMessagePayload) => void) => () => void;
};

export type FirebaseMessagePayload = {
  notification?: {
    title?: string;
    body?: string;
    image?: string;
  };
  data?: Record<string, string>;
};

declare global {
  interface Window {
    firebase?: {
      apps: FirebaseCompatApp[];
      initializeApp: (config: FirebaseAppConfig) => FirebaseCompatApp;
      messaging: () => FirebaseCompatMessaging;
    };
  }
}

const firebaseAppScript = "https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js";
const firebaseMessagingScript =
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js";

export function useFirebaseBrowserMessaging() {
  const config = useRuntimeConfig();
  const error = ref("");
  const foregroundMessages = ref<FirebaseMessagePayload[]>([]);
  const loading = ref(false);
  const permission = ref<NotificationPermission>("default");
  const token = ref("");

  const firebaseConfig = computed<FirebaseAppConfig>(() => ({
    apiKey: config.public.firebaseApiKey || "",
    authDomain: config.public.firebaseAuthDomain || "",
    projectId: config.public.firebaseProjectId || "",
    storageBucket: config.public.firebaseStorageBucket || "",
    messagingSenderId: config.public.firebaseMessagingSenderId || "",
    appId: config.public.firebaseAppId || "",
  }));

  const vapidKey = computed(() => config.public.firebaseVapidKey || "");

  const configurationError = computed(() => {
    if (!firebaseConfig.value.apiKey) {
      return "Set NUXT_PUBLIC_FIREBASE_API_KEY to request a browser push token.";
    }

    if (!firebaseConfig.value.projectId) {
      return "Set NUXT_PUBLIC_FIREBASE_PROJECT_ID to request a browser push token.";
    }

    if (!firebaseConfig.value.messagingSenderId) {
      return "Set NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID to request a browser push token.";
    }

    if (!firebaseConfig.value.appId) {
      return "Set NUXT_PUBLIC_FIREBASE_APP_ID to request a browser push token.";
    }

    if (!vapidKey.value) {
      return "Set NUXT_PUBLIC_FIREBASE_VAPID_KEY to request a browser push token.";
    }

    return "";
  });

  async function getBrowserPushToken() {
    if (!import.meta.client) {
      return "";
    }

    if (configurationError.value) {
      error.value = configurationError.value;
      return "";
    }

    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      error.value = "This browser does not support web push notifications.";
      return "";
    }

    loading.value = true;
    error.value = "";

    try {
      permission.value = await Notification.requestPermission();

      if (permission.value !== "granted") {
        error.value = "Notification permission was not granted.";
        return "";
      }

      await loadFirebaseMessagingScripts();

      const registration = await registerFirebaseServiceWorker();
      const firebase = getFirebaseMessaging();
      const currentToken = await firebase.getToken({
        vapidKey: vapidKey.value,
        serviceWorkerRegistration: registration,
      });

      if (!currentToken) {
        error.value = "Firebase did not return a browser push token.";
        return "";
      }

      token.value = currentToken;
      firebase.onMessage((payload) => {
        foregroundMessages.value = [payload, ...foregroundMessages.value].slice(0, 5);
      });

      return currentToken;
    } catch (err) {
      error.value = getBrowserPushErrorMessage(err);
      return "";
    } finally {
      loading.value = false;
    }
  }

  function syncPermission() {
    if (import.meta.client && "Notification" in window) {
      permission.value = Notification.permission;
    }
  }

  async function registerFirebaseServiceWorker() {
    return navigator.serviceWorker.register("/firebase-messaging-sw.js");
  }

  function getFirebaseMessaging() {
    const firebase = window.firebase;

    if (!firebase) {
      throw new Error("Firebase Messaging failed to load.");
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig.value);
    }

    return firebase.messaging();
  }

  return {
    configurationError,
    error,
    foregroundMessages,
    getBrowserPushToken,
    loading,
    permission,
    syncPermission,
    token,
  };
}

async function loadFirebaseMessagingScripts() {
  await loadScript(firebaseAppScript);
  await loadScript(firebaseMessagingScript);
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);

    if (existingScript?.dataset.loaded === "true") {
      resolve();
      return;
    }

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error(`Unable to load ${src}`)), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.loaded = "false";
    script.addEventListener(
      "load",
      () => {
        script.dataset.loaded = "true";
        resolve();
      },
      { once: true },
    );
    script.addEventListener("error", () => reject(new Error(`Unable to load ${src}`)), {
      once: true,
    });
    document.head.appendChild(script);
  });
}

function getBrowserPushErrorMessage(err: unknown) {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return "Unable to request a browser push token.";
}
