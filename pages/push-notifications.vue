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
          <h1 class="font-[Poppins] text-3xl font-light text-[#2D2D31]">Announcement notifications</h1>
          <p class="mt-2 max-w-2xl text-base leading-7 text-[#56565C]">
            Subscribe this browser to an Appwrite Messaging topic using a Firebase Cloud Messaging
            browser token.
          </p>
          <NuxtLink
            to="/admin-messaging"
            class="mt-3 inline-flex min-h-11 items-center text-sm font-medium text-[#FD366E] underline-offset-4 hover:text-[#E52E62] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
          >
            Open admin messaging
          </NuxtLink>
        </div>

        <div class="grid gap-2 rounded-md border border-[#E1E4EA] bg-white px-4 py-3 text-sm shadow-sm">
          <span class="font-medium text-[#2D2D31]">Appwrite push provider</span>
          <code class="break-all rounded-sm bg-[#EDEDF0] px-2 py-1 font-[Fira_Code] text-[#56565C]">
            {{ providerId || 'Not configured' }}
          </code>
        </div>
      </header>

      <section
        v-if="configurationError || browserConfigurationError"
        role="alert"
        class="rounded-md border border-[#F6C453] bg-[#FFF8E6] p-4 text-[#6E5200]"
      >
        {{ configurationError || browserConfigurationError }}
      </section>

      <section
        v-if="sessionStatus === 'guest'"
        role="alert"
        class="flex flex-col gap-3 rounded-md border border-[#F6C453] bg-[#FFF8E6] p-4 text-[#6E5200] sm:flex-row sm:items-center sm:justify-between"
      >
        <span>Push target registration requires an Appwrite account session.</span>
        <div class="flex flex-col gap-2 sm:flex-row">
          <NuxtLink
            to="/login?redirect=/push-notifications"
            class="inline-flex min-h-11 items-center justify-center rounded-md bg-[#FD366E] px-4 py-2 font-medium text-white transition hover:bg-[#E52E62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
          >
            Login or sign up
          </NuxtLink>
          <button
            type="button"
            class="inline-flex min-h-11 items-center justify-center rounded-md border border-[#D89B00] bg-white px-4 py-2 font-medium text-[#6E5200] transition hover:bg-[#FFF3CC] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D89B00] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="creatingDemoSession"
            @click="createDemoSession"
          >
            {{ creatingDemoSession ? 'Creating session...' : 'Demo user' }}
          </button>
        </div>
      </section>

      <section
        v-if="combinedError"
        role="alert"
        class="rounded-md border border-[#F2A8A8] bg-[#FFF1F1] p-4 text-[#9F1D1D]"
      >
        {{ combinedError }}
      </section>

      <section
        v-if="success"
        role="status"
        aria-live="polite"
        class="rounded-md border border-[#9AD7BE] bg-[#ECFDF4] p-4 text-[#0A714F]"
      >
        {{ success }}
      </section>

      <div class="grid gap-6 lg:grid-cols-[minmax(21rem,27rem)_1fr] lg:items-start">
        <section class="rounded-md border border-[#E1E4EA] bg-white p-5 shadow-sm">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-xl font-semibold text-[#2D2D31]">Announcements</h2>
              <p class="mt-1 text-sm leading-6 text-[#6F6F76]">
                Toggle this browser on to receive announcement pushes in the foreground,
                minimized, or after the tab is closed.
              </p>
            </div>
            <span :class="subscriptionBadgeClass" class="shrink-0 rounded-sm px-2 py-1 text-sm font-medium">
              {{ isSubscribed ? 'On' : 'Off' }}
            </span>
          </div>

          <label class="mt-5 grid gap-1.5">
            <span class="font-medium text-[#2D2D31]">Topic</span>
            <select
              v-model="topicId"
              class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
            >
              <option value="" disabled>Select a topic</option>
              <option v-for="topic in topics" :key="topic.$id" :value="topic.$id">
                {{ topic.name }} ({{ accessLabel(topic.subscribe) }})
              </option>
            </select>
            <span class="text-sm leading-6 text-[#6F6F76]">
              Topics marked signed-in require an Appwrite account session before subscribing.
            </span>
          </label>

          <div class="mt-5 rounded-md border border-[#EDEDF0] bg-[#FAFAFB] p-4">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="font-medium text-[#2D2D31]">Receive announcement pushes</p>
                <p class="mt-1 text-sm text-[#6F6F76]">{{ toggleHelperText }}</p>
              </div>
              <button
                type="button"
                role="switch"
                :aria-checked="isSubscribed"
                :disabled="toggleDisabled"
                class="relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full border border-transparent transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
                :class="isSubscribed ? 'bg-[#FD366E]' : 'bg-[#C9CDD6]'"
                @click="toggleAnnouncements"
              >
                <span
                  class="inline-block h-6 w-6 rounded-full bg-white shadow-sm transition"
                  :class="isSubscribed ? 'translate-x-7' : 'translate-x-1'"
                />
              </button>
            </div>
          </div>

          <div class="mt-5 grid gap-3 text-sm">
            <div class="flex items-center justify-between gap-3 border-t border-[#EDEDF0] pt-3">
              <span class="font-medium text-[#2D2D31]">Notification permission</span>
              <span :class="permissionBadgeClass" class="rounded-sm px-2 py-1 font-medium">
                {{ permissionLabel }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-3 border-t border-[#EDEDF0] pt-3">
              <span class="font-medium text-[#2D2D31]">Account session</span>
              <span :class="sessionBadgeClass" class="rounded-sm px-2 py-1 font-medium">
                {{ sessionLabel }}
              </span>
            </div>
            <div class="flex items-center justify-between gap-3 border-t border-[#EDEDF0] pt-3">
              <span class="font-medium text-[#2D2D31]">Topic access</span>
              <span class="rounded-sm bg-[#EDEDF0] px-2 py-1 font-medium text-[#56565C]">
                {{ selectedTopic ? accessLabel(selectedTopic.subscribe) : 'No topic' }}
              </span>
            </div>
          </div>
        </section>

        <section class="overflow-hidden rounded-md border border-[#E1E4EA] bg-white shadow-sm">
          <div class="border-b border-[#E1E4EA] bg-[#FAFAFB] p-5">
            <h2 class="text-xl font-semibold text-[#2D2D31]">Demo status</h2>
            <p class="mt-1 text-sm text-[#6F6F76]">
              Current browser target and latest foreground notification payloads.
            </p>
          </div>

          <div class="grid gap-4 p-5">
            <div class="grid gap-2 rounded-md border border-[#EDEDF0] p-4 sm:grid-cols-[10rem_1fr] sm:items-center">
              <span class="font-medium text-[#2D2D31]">Target ID</span>
              <code class="break-all font-[Fira_Code] text-sm text-[#56565C]">
                {{ target?.$id || storedTargetId || 'Not registered in this browser' }}
              </code>
            </div>

            <div class="grid gap-2 rounded-md border border-[#EDEDF0] p-4 sm:grid-cols-[10rem_1fr] sm:items-center">
              <span class="font-medium text-[#2D2D31]">FCM token</span>
              <code class="break-all font-[Fira_Code] text-sm text-[#56565C]">
                {{ browserToken || 'Not requested yet' }}
              </code>
            </div>

            <div class="rounded-md border border-[#EDEDF0] p-4">
              <h3 class="font-semibold text-[#2D2D31]">Foreground messages</h3>
              <div v-if="foregroundMessages.length" class="mt-3 grid gap-3">
                <article
                  v-for="(message, index) in foregroundMessages"
                  :key="index"
                  class="rounded-md border border-[#EDEDF0] bg-[#FAFAFB] p-3"
                >
                  <p class="font-medium text-[#2D2D31]">
                    {{ message.notification?.title || message.data?.title || 'Announcement' }}
                  </p>
                  <p class="mt-1 text-sm leading-6 text-[#56565C]">
                    {{ message.notification?.body || message.data?.body || 'No body provided.' }}
                  </p>
                </article>
              </div>
              <p v-else class="mt-3 text-sm leading-6 text-[#6F6F76]">
                Messages received while this page is open will appear here. Background messages are
                shown by the service worker as system notifications.
              </p>
            </div>

            <div class="rounded-md border border-[#EDEDF0] p-4">
              <h3 class="font-semibold text-[#2D2D31]">How to test</h3>
              <ol class="mt-3 grid list-decimal gap-2 pl-5 leading-7 text-[#56565C]">
                <li>Sign in with Appwrite Auth in this browser.</li>
                <li>Set Firebase web app env values and the Web Push certificate VAPID key.</li>
                <li>Toggle announcements on for an existing Appwrite Messaging topic.</li>
                <li>Send a push to that topic from Appwrite Console or a server function.</li>
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
type TopicSummary = {
  $id: string;
  name: string;
  subscribe: string[];
};

const {
  configurationError,
  error,
  loading,
  providerId,
  registerPushTarget,
  target,
  unregisterPushTarget,
} = usePushNotifications();

const {
  configurationError: browserConfigurationError,
  error: browserError,
  foregroundMessages,
  getBrowserPushToken,
  loading: browserLoading,
  permission,
  syncPermission,
  token: browserToken,
} = useFirebaseBrowserMessaging();

const topicId = ref("announcements");
const creatingDemoSession = ref(false);
const success = ref("");
const sessionStatus = ref<SessionStatus>("checking");
const storedTargetId = ref("");
const topics = ref<TopicSummary[]>([]);

const checkingSession = computed(() => sessionStatus.value === "checking");
const isSubscribed = computed(() => Boolean(storedTargetId.value || target.value?.$id));
const combinedError = computed(() => error.value || browserError.value);
const selectedTopic = computed(() => topics.value.find((topic) => topic.$id === topicId.value));
const selectedTopicRequiresSession = computed(
  () => !selectedTopic.value || !selectedTopic.value.subscribe.includes("any"),
);
const toggleDisabled = computed(
  () =>
    loading.value ||
    browserLoading.value ||
    checkingSession.value ||
    sessionStatus.value === "guest" ||
    Boolean(configurationError.value || browserConfigurationError.value),
);
const toggleHelperText = computed(() => {
  if (loading.value || browserLoading.value) {
    return "Updating subscription...";
  }

  if (sessionStatus.value === "guest") {
    return selectedTopicRequiresSession.value
      ? "Sign in before subscribing to this topic."
      : "Create a demo session before subscribing this browser.";
  }

  if (isSubscribed.value) {
    return `Subscribed to ${topicId.value || "the selected topic"}.`;
  }

  return "The browser will ask for notification permission when you turn this on.";
});
const sessionLabel = computed(() => {
  if (sessionStatus.value === "checking") {
    return "Checking";
  }

  return sessionStatus.value === "authenticated" ? "Signed in" : "No session";
});
const permissionLabel = computed(() => {
  if (permission.value === "granted") {
    return "Granted";
  }

  if (permission.value === "denied") {
    return "Blocked";
  }

  return "Not requested";
});
const sessionBadgeClass = computed(() =>
  sessionStatus.value === "authenticated"
    ? "bg-[#ECFDF4] text-[#0A714F]"
    : "bg-[#FFF8E6] text-[#6E5200]",
);
const permissionBadgeClass = computed(() =>
  permission.value === "granted"
    ? "bg-[#ECFDF4] text-[#0A714F]"
    : "bg-[#FFF8E6] text-[#6E5200]",
);
const subscriptionBadgeClass = computed(() =>
  isSubscribed.value ? "bg-[#ECFDF4] text-[#0A714F]" : "bg-[#EDEDF0] text-[#56565C]",
);

onMounted(async () => {
  storedTargetId.value = localStorage.getItem("omeco.pushTargetId") || "";
  syncPermission();
  await loadTopics();

  try {
    await account.get();
    sessionStatus.value = "authenticated";
  } catch {
    sessionStatus.value = "guest";
  }
});

async function createDemoSession() {
  creatingDemoSession.value = true;
  success.value = "";
  error.value = "";
  browserError.value = "";

  try {
    await account.createAnonymousSession();
    sessionStatus.value = "authenticated";
    success.value = "Demo Appwrite session created. You can now subscribe this browser.";
  } catch (err) {
    error.value =
      err instanceof Error && err.message
        ? err.message
        : "Unable to create a demo Appwrite session.";
  } finally {
    creatingDemoSession.value = false;
  }
}

async function toggleAnnouncements() {
  success.value = "";

  if (sessionStatus.value === "guest") {
    error.value = selectedTopicRequiresSession.value
      ? "Sign in before subscribing to this topic."
      : "Create a demo Appwrite session before subscribing this browser.";
    return;
  }

  if (isSubscribed.value) {
    await unregisterPushTarget();

    if (!combinedError.value) {
      storedTargetId.value = "";
      success.value = "Announcements are turned off for this browser.";
    }

    return;
  }

  if (!topicId.value) {
    browserError.value = "Choose an Appwrite Messaging topic before subscribing.";
    return;
  }

  const fcmToken = await getBrowserPushToken();

  if (!fcmToken) {
    return;
  }

  const registeredTarget = await registerPushTarget({
    identifier: fcmToken,
    topicId: topicId.value,
  });

  if (!registeredTarget) {
    return;
  }

  storedTargetId.value = registeredTarget.$id;
  success.value = `Announcements are on for ${topicId.value}. You can close or minimize the browser and still receive pushes.`;
}

async function loadTopics() {
  try {
    const response = await $fetch<{ topics: TopicSummary[] }>("/api/messaging/topics");
    topics.value = response.topics;

    if (!topics.value.some((topic) => topic.$id === topicId.value) && topics.value.length) {
      topicId.value = topics.value[0].$id;
    }
  } catch (err) {
    browserError.value = err instanceof Error && err.message
      ? err.message
      : "Unable to load messaging topics.";
  }
}

function accessLabel(subscribe: string[]) {
  return subscribe.includes("any") ? "Public" : "Signed-in users";
}
</script>
