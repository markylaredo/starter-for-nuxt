<template>
  <main class="min-h-dvh bg-[#F7F8FA] px-4 py-6 text-[#2D2D31] sm:px-6 lg:px-8">
    <div class="mx-auto flex max-w-6xl flex-col gap-5">
      <header class="flex flex-col gap-4 border-b border-[#E1E4EA] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <NuxtLink
            to="/"
            class="mb-4 inline-flex min-h-11 items-center text-sm font-medium text-[#56565C] underline-offset-4 hover:text-[#2D2D31] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
          >
            Back to Appwrite check
          </NuxtLink>
          <h1 class="font-[Poppins] text-3xl font-light text-[#2D2D31]">Push notification demo</h1>
          <p class="mt-2 max-w-2xl text-base leading-7 text-[#56565C]">
            Register a device token as an Appwrite push target, then subscribe that target to a Messaging topic.
          </p>
        </div>

        <div class="grid gap-2 rounded-md border border-[#E1E4EA] bg-white px-4 py-3 text-sm shadow-sm">
          <span class="font-medium text-[#2D2D31]">Provider</span>
          <code class="break-all rounded-sm bg-[#EDEDF0] px-2 py-1 font-[Fira_Code] text-[#56565C]">
            {{ providerId || 'Not configured' }}
          </code>
        </div>
      </header>

      <section
        v-if="configurationError"
        role="alert"
        class="rounded-md border border-[#F6C453] bg-[#FFF8E6] p-4 text-[#6E5200]"
      >
        {{ configurationError }}
      </section>

      <section
        v-if="sessionStatus === 'guest'"
        role="alert"
        class="rounded-md border border-[#F6C453] bg-[#FFF8E6] p-4 text-[#6E5200]"
      >
        Push target registration requires a signed-in Appwrite account session.
      </section>

      <section
        v-if="error"
        role="alert"
        class="rounded-md border border-[#F2A8A8] bg-[#FFF1F1] p-4 text-[#9F1D1D]"
      >
        {{ error }}
      </section>

      <section
        v-if="success"
        role="status"
        aria-live="polite"
        class="rounded-md border border-[#9AD7BE] bg-[#ECFDF4] p-4 text-[#0A714F]"
      >
        {{ success }}
      </section>

      <div class="grid gap-6 lg:grid-cols-[minmax(20rem,26rem)_1fr] lg:items-start">
        <form
          class="rounded-md border border-[#E1E4EA] bg-white p-5 shadow-sm"
          @submit.prevent="submitRegistration"
        >
          <div>
            <h2 class="text-xl font-semibold text-[#2D2D31]">Register target</h2>
            <p class="mt-1 text-sm leading-6 text-[#6F6F76]">
              Use a real token from your browser push provider.
            </p>
          </div>

          <div class="mt-5 grid gap-4">
            <label class="grid gap-1.5">
              <span class="font-medium text-[#2D2D31]">Push token / identifier *</span>
              <textarea
                v-model.trim="identifier"
                rows="5"
                class="min-h-36 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 font-[Fira_Code] text-sm text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
                required
              />
              <span class="text-sm leading-6 text-[#6F6F76]">
                Appwrite sends notifications to this identifier through the configured provider.
              </span>
            </label>

            <label class="grid gap-1.5">
              <span class="font-medium text-[#2D2D31]">Topic ID</span>
              <input
                v-model.trim="topicId"
                type="text"
                class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
              />
              <span class="text-sm leading-6 text-[#6F6F76]">
                Leave blank to only register the target without a topic subscription.
              </span>
            </label>
          </div>

          <div class="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              class="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-[#FD366E] px-4 py-2 font-medium text-white transition hover:bg-[#E52E62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="loading || checkingSession || Boolean(configurationError)"
            >
              {{ loading ? 'Registering...' : 'Register and subscribe' }}
            </button>
            <button
              type="button"
              class="inline-flex min-h-11 items-center justify-center rounded-md border border-[#C9CDD6] bg-white px-4 py-2 font-medium text-[#2D2D31] transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="loading"
              @click="submitUnregister"
            >
              Unregister
            </button>
          </div>
        </form>

        <section class="overflow-hidden rounded-md border border-[#E1E4EA] bg-white shadow-sm">
          <div class="border-b border-[#E1E4EA] bg-[#FAFAFB] p-5">
            <h2 class="text-xl font-semibold text-[#2D2D31]">Demo status</h2>
            <p class="mt-1 text-sm text-[#6F6F76]">
              Current client-side registration state.
            </p>
          </div>

          <div class="grid gap-4 p-5">
            <div class="grid gap-2 rounded-md border border-[#EDEDF0] p-4 sm:grid-cols-[10rem_1fr] sm:items-center">
              <span class="font-medium text-[#2D2D31]">Account session</span>
              <span :class="sessionBadgeClass" class="w-fit rounded-sm px-2 py-1 text-sm font-medium">
                {{ sessionLabel }}
              </span>
            </div>

            <div class="grid gap-2 rounded-md border border-[#EDEDF0] p-4 sm:grid-cols-[10rem_1fr] sm:items-center">
              <span class="font-medium text-[#2D2D31]">Target ID</span>
              <code class="break-all font-[Fira_Code] text-sm text-[#56565C]">
                {{ target?.$id || storedTargetId || 'Not registered in this browser' }}
              </code>
            </div>

            <div class="grid gap-2 rounded-md border border-[#EDEDF0] p-4 sm:grid-cols-[10rem_1fr] sm:items-center">
              <span class="font-medium text-[#2D2D31]">Topic</span>
              <code class="break-all font-[Fira_Code] text-sm text-[#56565C]">
                {{ topicId || 'No topic selected' }}
              </code>
            </div>

            <div class="rounded-md border border-[#EDEDF0] p-4">
              <h3 class="font-semibold text-[#2D2D31]">How to test</h3>
              <ol class="mt-3 grid list-decimal gap-2 pl-5 leading-7 text-[#56565C]">
                <li>Sign in with Appwrite Auth in this browser.</li>
                <li>Paste a real push token from your provider into the identifier field.</li>
                <li>Enter an existing Appwrite Messaging topic ID.</li>
                <li>Submit, then send a message to that topic from Appwrite Console or a server function.</li>
              </ol>
            </div>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { account } from "~/lib/appwrite";

type SessionStatus = "checking" | "authenticated" | "guest";

const {
  configurationError,
  error,
  loading,
  providerId,
  registerPushTarget,
  target,
  unregisterPushTarget,
} = usePushNotifications();

const identifier = ref("");
const topicId = ref("general");
const success = ref("");
const sessionStatus = ref<SessionStatus>("checking");
const storedTargetId = ref("");

const checkingSession = computed(() => sessionStatus.value === "checking");
const sessionLabel = computed(() => {
  if (sessionStatus.value === "checking") {
    return "Checking";
  }

  return sessionStatus.value === "authenticated" ? "Signed in" : "No session";
});
const sessionBadgeClass = computed(() =>
  sessionStatus.value === "authenticated"
    ? "bg-[#ECFDF4] text-[#0A714F]"
    : "bg-[#FFF8E6] text-[#6E5200]",
);

onMounted(async () => {
  storedTargetId.value = localStorage.getItem("omeco.pushTargetId") || "";

  try {
    await account.get();
    sessionStatus.value = "authenticated";
  } catch {
    sessionStatus.value = "guest";
  }
});

async function submitRegistration() {
  success.value = "";

  const registeredTarget = await registerPushTarget({
    identifier: identifier.value,
    topicId: topicId.value || undefined,
  });

  if (!registeredTarget) {
    return;
  }

  storedTargetId.value = registeredTarget.$id;
  success.value = topicId.value
    ? `Target ${registeredTarget.$id} was registered and subscribed to ${topicId.value}.`
    : `Target ${registeredTarget.$id} was registered.`;
}

async function submitUnregister() {
  success.value = "";
  await unregisterPushTarget();

  if (!error.value) {
    storedTargetId.value = "";
    success.value = "The stored push target was unregistered for this browser.";
  }
}
</script>
