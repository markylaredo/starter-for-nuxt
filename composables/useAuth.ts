import { ID, type Models } from "appwrite";
import { account, configureAppwrite } from "~/lib/appwrite";

export type AuthMode = "login" | "signup";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload extends LoginPayload {
  name: string;
}

export function useAuth() {
  const config = useRuntimeConfig();
  const user = useState<Models.User<Models.Preferences> | null>("auth.user", () => null);
  const checking = useState("auth.checking", () => false);
  const loading = ref(false);
  const error = ref("");

  const isAuthenticated = computed(() => Boolean(user.value));
  const configurationError = computed(() => {
    if (!config.public.appwriteEndpoint) {
      return "Set NUXT_PUBLIC_APPWRITE_ENDPOINT to enable Appwrite login.";
    }

    if (!config.public.appwriteProjectId) {
      return "Set NUXT_PUBLIC_APPWRITE_PROJECT_ID to enable Appwrite login.";
    }

    return "";
  });

  async function loadUser() {
    if (!ensureConfigured()) {
      user.value = null;
      return null;
    }

    checking.value = true;
    error.value = "";

    try {
      user.value = await account.get();
      return user.value;
    } catch {
      user.value = null;
      return null;
    } finally {
      checking.value = false;
    }
  }

  async function login(payload: LoginPayload) {
    if (!ensureConfigured()) {
      return null;
    }

    loading.value = true;
    error.value = "";

    try {
      await clearCurrentSession();
      await account.createEmailPasswordSession({
        email: payload.email,
        password: payload.password,
      });
      user.value = await account.get();
      return user.value;
    } catch (err) {
      error.value = getAuthErrorMessage(err, "Unable to sign in.");
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function signup(payload: SignupPayload) {
    if (!ensureConfigured()) {
      return null;
    }

    loading.value = true;
    error.value = "";

    try {
      await clearCurrentSession();
      await account.create({
        userId: ID.unique(),
        email: payload.email,
        password: payload.password,
        name: payload.name,
      });
      await account.createEmailPasswordSession({
        email: payload.email,
        password: payload.password,
      });
      user.value = await account.get();
      return user.value;
    } catch (err) {
      error.value = getAuthErrorMessage(err, "Unable to create account.");
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    if (!ensureConfigured()) {
      return;
    }

    loading.value = true;
    error.value = "";

    try {
      await account.deleteSession("current");
      user.value = null;
    } catch (err) {
      error.value = getAuthErrorMessage(err, "Unable to sign out.");
    } finally {
      loading.value = false;
    }
  }

  return {
    checking,
    configurationError,
    error,
    isAuthenticated,
    loading,
    loadUser,
    login,
    logout,
    signup,
    user,
  };

  function ensureConfigured() {
    if (configurationError.value) {
      error.value = configurationError.value;
      return false;
    }

    if (
      !configureAppwrite(
        config.public.appwriteEndpoint,
        config.public.appwriteProjectId,
      )
    ) {
      error.value = "Appwrite endpoint URL is invalid.";
      return false;
    }

    return true;
  }
}

async function clearCurrentSession() {
  try {
    await account.deleteSession("current");
  } catch {
    // No active session is fine before login or signup.
  }
}

function getAuthErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}
