<template>
  <main class="min-h-dvh bg-[#F7F8FA] px-4 py-6 text-[#2D2D31] sm:px-6 lg:px-8">
    <div class="mx-auto flex max-w-6xl flex-col gap-5">
      <header class="flex flex-col gap-4 border-b border-[#E1E4EA] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <NuxtLink
            to="/push-notifications"
            class="mb-4 inline-flex min-h-11 items-center text-sm font-medium text-[#56565C] underline-offset-4 hover:text-[#2D2D31] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
          >
            Back to push demo
          </NuxtLink>
          <h1 class="font-[Poppins] text-3xl font-light text-[#2D2D31]">Messaging admin</h1>
          <p class="mt-2 max-w-2xl text-base leading-7 text-[#56565C]">
            Create Appwrite Messaging topics and send push notifications to subscribed browser
            targets.
          </p>
        </div>
      </header>

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

      <section class="rounded-md border border-[#E1E4EA] bg-white p-5 shadow-sm">
        <label class="grid gap-1.5">
          <span class="font-medium text-[#2D2D31]">Admin API token</span>
          <input
            v-model.trim="adminToken"
            type="password"
            autocomplete="off"
            class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
          />
          <span class="text-sm leading-6 text-[#6F6F76]">
            This must match server-side ADMIN_API_TOKEN. It is used only for local admin calls.
          </span>
        </label>
      </section>

      <div class="grid gap-6 lg:grid-cols-[minmax(22rem,27rem)_1fr] lg:items-start">
        <form
          class="rounded-md border border-[#E1E4EA] bg-white p-5 shadow-sm"
          @submit.prevent="createTopic"
        >
          <div>
            <h2 class="text-xl font-semibold text-[#2D2D31]">Create topic</h2>
            <p class="mt-1 text-sm leading-6 text-[#6F6F76]">
              Topics are groups that browser push targets can subscribe to.
            </p>
          </div>

          <div class="mt-5 grid gap-4">
            <label class="grid gap-1.5">
              <span class="font-medium text-[#2D2D31]">Topic ID</span>
              <input
                v-model.trim="topicForm.topicId"
                type="text"
                class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
                required
              />
            </label>

            <label class="grid gap-1.5">
              <span class="font-medium text-[#2D2D31]">Name</span>
              <input
                v-model.trim="topicForm.name"
                type="text"
                class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
                required
              />
            </label>

            <label class="grid gap-1.5">
              <span class="font-medium text-[#2D2D31]">Subscription access</span>
              <select
                v-model="topicForm.access"
                class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
              >
                <option value="users">Signed-in users</option>
                <option value="any">Public/guest allowed</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            class="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#FD366E] px-4 py-2 font-medium text-white transition hover:bg-[#E52E62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading || !adminToken"
          >
            {{ loading ? 'Saving...' : 'Create or ensure topic' }}
          </button>
        </form>

        <section class="overflow-hidden rounded-md border border-[#E1E4EA] bg-white shadow-sm">
          <div class="border-b border-[#E1E4EA] bg-[#FAFAFB] p-5">
            <h2 class="text-xl font-semibold text-[#2D2D31]">Topics</h2>
            <p class="mt-1 text-sm text-[#6F6F76]">
              Available topics that users can subscribe to from the push demo page.
            </p>
          </div>

          <div class="grid gap-3 p-5">
            <div
              v-for="topic in topics"
              :key="topic.$id"
              class="grid gap-2 rounded-md border border-[#EDEDF0] p-4 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div>
                <p class="font-medium text-[#2D2D31]">{{ topic.name }}</p>
                <code class="mt-1 block break-all font-[Fira_Code] text-sm text-[#56565C]">
                  {{ topic.$id }}
                </code>
              </div>
              <span class="w-fit rounded-sm bg-[#EDEDF0] px-2 py-1 text-sm font-medium text-[#56565C]">
                {{ accessLabel(topic.subscribe) }}
              </span>
            </div>

            <p v-if="!topics.length" class="rounded-md border border-[#EDEDF0] p-4 text-[#6F6F76]">
              No topics found yet.
            </p>
          </div>
        </section>
      </div>

      <form
        class="rounded-md border border-[#E1E4EA] bg-white p-5 shadow-sm"
        @submit.prevent="sendPush"
      >
        <div>
          <h2 class="text-xl font-semibold text-[#2D2D31]">Send push message</h2>
          <p class="mt-1 text-sm leading-6 text-[#6F6F76]">
            Sends to all push targets subscribed to the selected topic.
          </p>
        </div>

        <div class="mt-5 grid gap-4 lg:grid-cols-2">
          <label class="grid gap-1.5">
            <span class="font-medium text-[#2D2D31]">Topic</span>
            <select
              v-model="messageForm.topicId"
              class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
              required
            >
              <option value="" disabled>Select a topic</option>
              <option v-for="topic in topics" :key="topic.$id" :value="topic.$id">
                {{ topic.name }} ({{ topic.$id }})
              </option>
            </select>
          </label>

          <label class="grid gap-1.5">
            <span class="font-medium text-[#2D2D31]">Title</span>
            <input
              v-model.trim="messageForm.title"
              type="text"
              class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
              required
            />
          </label>

          <label class="grid gap-1.5 lg:col-span-2">
            <span class="font-medium text-[#2D2D31]">Body</span>
            <textarea
              v-model.trim="messageForm.body"
              rows="4"
              class="min-h-28 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
              required
            />
          </label>
        </div>

        <button
          type="submit"
          class="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-[#FD366E] px-4 py-2 font-medium text-white transition hover:bg-[#E52E62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loading || !adminToken"
        >
          {{ loading ? 'Sending...' : 'Send push' }}
        </button>
      </form>
    </div>
  </main>
</template>

<script setup lang="ts">
type TopicSummary = {
  $id: string;
  name: string;
  subscribe: string[];
};

const adminToken = ref("");
const error = ref("");
const loading = ref(false);
const success = ref("");
const topics = ref<TopicSummary[]>([]);
const topicForm = reactive({
  access: "users",
  name: "Announcements",
  topicId: "announcements",
});
const messageForm = reactive({
  body: "A new announcement is available.",
  title: "New announcement",
  topicId: "",
});

onMounted(async () => {
  adminToken.value = sessionStorage.getItem("omeco.adminToken") || "";
  await loadTopics();
});

watch(adminToken, (value) => {
  sessionStorage.setItem("omeco.adminToken", value);
});

async function loadTopics() {
  const response = await $fetch<{ topics: TopicSummary[] }>("/api/messaging/topics");
  topics.value = response.topics;

  if (!messageForm.topicId && topics.value.length) {
    messageForm.topicId = topics.value[0].$id;
  }
}

async function createTopic() {
  await runAdminAction(async () => {
    await $fetch("/api/admin/messaging/topics", {
      method: "POST",
      headers: adminHeaders(),
      body: {
        name: topicForm.name,
        subscribe: [topicForm.access],
        topicId: topicForm.topicId,
      },
    });
    await loadTopics();
    messageForm.topicId = topicForm.topicId;
    success.value = `Topic ${topicForm.topicId} is ready.`;
  });
}

async function sendPush() {
  await runAdminAction(async () => {
    await $fetch("/api/admin/messaging/push", {
      method: "POST",
      headers: adminHeaders(),
      body: {
        body: messageForm.body,
        title: messageForm.title,
        topicId: messageForm.topicId,
      },
    });
    success.value = `Push message sent to ${messageForm.topicId}.`;
  });
}

async function runAdminAction(action: () => Promise<void>) {
  loading.value = true;
  error.value = "";
  success.value = "";

  try {
    await action();
  } catch (err) {
    error.value = getErrorMessage(err);
  } finally {
    loading.value = false;
  }
}

function adminHeaders() {
  return {
    "x-admin-token": adminToken.value,
  };
}

function accessLabel(subscribe: string[]) {
  return subscribe.includes("any") ? "Public" : "Signed-in users";
}

function getErrorMessage(err: unknown) {
  if (typeof err === "object" && err !== null && "statusMessage" in err) {
    return String(err.statusMessage);
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return "Admin messaging request failed.";
}
</script>
