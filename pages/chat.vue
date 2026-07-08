<template>
  <main class="min-h-dvh bg-[#F7F8FA] px-4 py-6 text-[#2D2D31] sm:px-6 lg:px-8">
    <div class="mx-auto flex max-w-5xl flex-col gap-5">
      <header class="flex flex-col gap-4 border-b border-[#E1E4EA] pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <NuxtLink
            to="/"
            class="mb-4 inline-flex min-h-11 items-center text-sm font-medium text-[#56565C] underline-offset-4 hover:text-[#2D2D31] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
          >
            Back to Appwrite check
          </NuxtLink>
          <h1 class="font-[Poppins] text-3xl font-light text-[#2D2D31]">Realtime chat</h1>
          <p class="mt-2 max-w-2xl text-base leading-7 text-[#56565C]">
            Messages are stored in Appwrite and pushed to connected browsers through realtime events.
          </p>
        </div>

        <div class="flex items-center gap-2 rounded-md border border-[#E1E4EA] bg-white px-3 py-2">
          <span
            :class="realtimeConnected ? 'bg-[#0A714F]' : 'bg-[#9EA3AE]'"
            class="h-2.5 w-2.5 rounded-full"
            aria-hidden="true"
          />
          <span class="text-sm font-medium text-[#56565C]">
            {{ realtimeConnected ? 'Realtime ready' : 'Connecting' }}
          </span>
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
        v-if="error"
        role="alert"
        class="rounded-md border border-[#F2A8A8] bg-[#FFF1F1] p-4 text-[#9F1D1D]"
      >
        {{ error }}
      </section>

      <section class="grid min-h-[36rem] overflow-hidden rounded-md border border-[#E1E4EA] bg-white shadow-sm">
        <div class="flex items-center justify-between border-b border-[#E1E4EA] bg-[#FAFAFB] px-5 py-4">
          <div>
            <h2 class="text-lg font-semibold text-[#2D2D31]">General room</h2>
            <p class="mt-1 text-sm text-[#6F6F76]">
              {{ messages.length }} {{ messages.length === 1 ? 'message' : 'messages' }}
            </p>
          </div>
          <button
            type="button"
            class="inline-flex min-h-11 items-center justify-center rounded-md border border-[#C9CDD6] bg-white px-4 py-2 font-medium text-[#2D2D31] transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading || Boolean(configurationError)"
            @click="listMessages"
          >
            {{ loading ? 'Refreshing...' : 'Refresh' }}
          </button>
        </div>

        <div ref="messageListRef" class="flex h-[28rem] flex-col gap-3 overflow-y-auto px-4 py-5 sm:px-5">
          <div v-if="loading" class="grid gap-3">
            <div v-for="index in 5" :key="index" class="h-16 animate-pulse rounded-md bg-[#EDEDF0]" />
          </div>

          <div v-else-if="messages.length === 0" class="m-auto max-w-sm text-center">
            <h3 class="text-lg font-semibold text-[#2D2D31]">No messages yet</h3>
            <p class="mt-2 leading-7 text-[#6F6F76]">
              Send the first message, then open this page in another browser window to see realtime updates.
            </p>
          </div>

          <article
            v-for="chatMessage in messages"
            v-else
            :key="chatMessage.$id"
            :class="chatMessage.senderName === senderName ? 'ml-auto bg-[#FD366E] text-white' : 'mr-auto bg-[#F2F3F5] text-[#2D2D31]'"
            class="max-w-[85%] rounded-md px-4 py-3 shadow-sm sm:max-w-[70%]"
          >
            <div class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <strong class="text-sm font-semibold">{{ chatMessage.senderName }}</strong>
              <time
                :class="chatMessage.senderName === senderName ? 'text-white/80' : 'text-[#6F6F76]'"
                class="text-xs"
                :datetime="chatMessage.$createdAt"
              >
                {{ formatTime(chatMessage.$createdAt) }}
              </time>
            </div>
            <p class="mt-1 whitespace-pre-wrap break-words text-base leading-7">
              {{ chatMessage.message }}
            </p>
          </article>
        </div>

        <form class="border-t border-[#E1E4EA] p-4 sm:p-5" @submit.prevent="submitMessage">
          <div class="grid gap-3 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
            <label class="grid gap-1.5">
              <span class="font-medium text-[#2D2D31]">Name</span>
              <input
                v-model.trim="senderName"
                type="text"
                autocomplete="name"
                class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
                required
              />
            </label>

            <label class="grid gap-1.5">
              <span class="font-medium text-[#2D2D31]">Message</span>
              <textarea
                v-model.trim="message"
                rows="1"
                class="min-h-11 resize-none rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
                required
                @keydown.enter.exact.prevent="submitMessage"
              />
            </label>

            <button
              type="submit"
              class="inline-flex min-h-11 items-center justify-center rounded-md bg-[#FD366E] px-5 py-2 font-medium text-white transition hover:bg-[#E52E62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="sending || !message.trim() || !senderName.trim() || Boolean(configurationError)"
            >
              {{ sending ? 'Sending...' : 'Send' }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
const roomId = "general";
const senderName = ref("Guest");
const message = ref("");
const messageListRef = ref<HTMLElement | null>(null);

const {
  configurationError,
  error,
  listMessages,
  loading,
  messages,
  realtimeConnected,
  sending,
  sendMessage,
  subscribeToMessages,
} = useChats(roomId);

let unsubscribe: (() => void) | undefined;

onMounted(async () => {
  await listMessages();
  unsubscribe = subscribeToMessages();
  scrollToLatest();
});

onBeforeUnmount(() => {
  unsubscribe?.();
});

watch(
  () => messages.value.length,
  () => scrollToLatest(),
);

async function submitMessage() {
  const normalizedMessage = message.value.trim();
  const normalizedName = senderName.value.trim();

  if (!normalizedMessage || !normalizedName || sending.value) {
    return;
  }

  await sendMessage({
    message: normalizedMessage,
    senderName: normalizedName,
    roomId,
  });

  if (!error.value) {
    message.value = "";
  }
}

function scrollToLatest() {
  requestAnimationFrame(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  });
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
</script>
