import { ID, type Models } from "appwrite";
import { account, messaging } from "~/lib/appwrite";

const pushTargetStorageKey = "omeco.pushTargetId";

export interface RegisterPushTargetOptions {
  identifier: string;
  topicId?: string;
}

export function usePushNotifications() {
  const config = useRuntimeConfig();

  const providerId = computed(() => config.public.appwritePushProviderId || "");
  const error = ref("");
  const loading = ref(false);
  const target = ref<Models.Target | null>(null);

  const configurationError = computed(() => {
    if (!providerId.value) {
      return "Set NUXT_PUBLIC_APPWRITE_PUSH_PROVIDER_ID to enable push notifications.";
    }

    return "";
  });

  async function registerPushTarget(options: RegisterPushTargetOptions) {
    const identifier = options.identifier.trim();

    if (configurationError.value) {
      error.value = configurationError.value;
      return null;
    }

    if (!identifier) {
      error.value = "A push notification identifier is required.";
      return null;
    }

    loading.value = true;
    error.value = "";

    try {
      const existingTargetId = getStoredTargetId();
      const registeredTarget = existingTargetId
        ? await updatePushTarget(existingTargetId, identifier)
        : await createPushTarget(identifier);

      target.value = registeredTarget;
      storeTargetId(registeredTarget.$id);

      if (options.topicId) {
        await subscribeTargetToTopic(options.topicId, registeredTarget.$id);
      }

      return registeredTarget;
    } catch (err) {
      error.value = getPushNotificationErrorMessage(
        err,
        "Unable to register this device for push notifications.",
      );
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function unregisterPushTarget() {
    const targetId = target.value?.$id || getStoredTargetId();

    if (!targetId) {
      return;
    }

    loading.value = true;
    error.value = "";

    try {
      await account.deletePushTarget({ targetId });
      target.value = null;
      clearStoredTargetId();
    } catch (err) {
      error.value = getPushNotificationErrorMessage(
        err,
        "Unable to unregister this device from push notifications.",
      );
    } finally {
      loading.value = false;
    }
  }

  async function updatePushTarget(targetId: string, identifier: string) {
    try {
      return await account.updatePushTarget({ targetId, identifier });
    } catch (err) {
      if (isNotFoundError(err)) {
        clearStoredTargetId();
        return createPushTarget(identifier);
      }

      throw err;
    }
  }

  function createPushTarget(identifier: string) {
    return account.createPushTarget({
      targetId: ID.unique(),
      identifier,
      providerId: providerId.value,
    });
  }

  function subscribeTargetToTopic(topicId: string, targetId: string) {
    return messaging.createSubscriber({
      topicId,
      subscriberId: ID.unique(),
      targetId,
    });
  }

  return {
    configurationError,
    error,
    loading,
    providerId,
    registerPushTarget,
    target,
    unregisterPushTarget,
  };
}

function getStoredTargetId() {
  if (!import.meta.client) {
    return "";
  }

  return localStorage.getItem(pushTargetStorageKey) || "";
}

function storeTargetId(targetId: string) {
  if (import.meta.client) {
    localStorage.setItem(pushTargetStorageKey, targetId);
  }
}

function clearStoredTargetId() {
  if (import.meta.client) {
    localStorage.removeItem(pushTargetStorageKey);
  }
}

function isNotFoundError(err: unknown) {
  return typeof err === "object" && err !== null && "code" in err && err.code === 404;
}

function getPushNotificationErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}
