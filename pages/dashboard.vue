<template>
  <main class="min-h-dvh bg-[#F7F8FA] text-[#2D2D31]">
    <div class="mx-auto grid min-h-dvh max-w-7xl lg:grid-cols-[16rem_1fr]">
      <aside class="border-b border-[#E1E4EA] bg-white px-4 py-4 lg:border-r lg:border-b-0">
        <div class="flex items-center justify-between gap-3 lg:block">
          <div>
            <p class="text-xs font-semibold uppercase text-[#6F6F76]">Workspace</p>
            <h1 class="mt-1 font-[Poppins] text-2xl font-light">Operations</h1>
          </div>
          <NuxtLink
            to="/"
            class="inline-flex min-h-11 items-center rounded-md px-3 py-2 text-sm font-medium text-[#56565C] underline-offset-4 hover:text-[#2D2D31] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
          >
            Home
          </NuxtLink>
        </div>

        <nav class="mt-5 grid gap-1 text-sm">
          <NuxtLink
            v-for="item in navigation"
            :key="item.to"
            :to="item.to"
            class="flex min-h-11 items-center rounded-md px-3 py-2 font-medium text-[#56565C] transition hover:bg-[#F7F8FA] hover:text-[#2D2D31] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </aside>

      <section class="px-4 py-6 sm:px-6 lg:px-8">
        <header class="flex flex-col gap-4 border-b border-[#E1E4EA] pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-sm font-medium text-[#6F6F76]">Dashboard</p>
            <h2 class="mt-1 font-[Poppins] text-3xl font-light text-[#2D2D31]">
              Welcome{{ user?.name ? `, ${user.name}` : "" }}
            </h2>
            <p class="mt-2 max-w-2xl text-base leading-7 text-[#56565C]">
              Manage account-backed demos, messaging, records, and realtime tools from one place.
            </p>
          </div>

          <button
            type="button"
            class="inline-flex min-h-11 items-center justify-center rounded-md border border-[#F2A8A8] bg-white px-4 py-2 font-medium text-[#9F1D1D] transition hover:bg-[#FFF1F1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="loading"
            @click="signOut"
          >
            {{ loading ? "Signing out..." : "Sign out" }}
          </button>
        </header>

        <section
          v-if="configurationError || error"
          role="alert"
          class="mt-5 rounded-md border border-[#F2A8A8] bg-[#FFF1F1] p-4 text-[#9F1D1D]"
        >
          {{ configurationError || error }}
        </section>

        <section v-if="!ready || checking" class="mt-6 grid gap-4 md:grid-cols-3">
          <div v-for="index in 6" :key="index" class="h-28 animate-pulse rounded-md bg-[#EDEDF0]" />
        </section>

        <template v-else>
          <section class="mt-6 grid gap-4 md:grid-cols-3">
            <div class="rounded-md border border-[#E1E4EA] bg-white p-5 shadow-sm">
              <p class="text-sm font-medium text-[#6F6F76]">Session</p>
              <p class="mt-2 text-2xl font-semibold text-[#0A714F]">Active</p>
              <p class="mt-1 break-all text-sm text-[#56565C]">{{ user?.email }}</p>
            </div>
            <div class="rounded-md border border-[#E1E4EA] bg-white p-5 shadow-sm">
              <p class="text-sm font-medium text-[#6F6F76]">Project</p>
              <p class="mt-2 text-2xl font-semibold">{{ appwriteProjectName || "Appwrite" }}</p>
              <p class="mt-1 break-all text-sm text-[#56565C]">{{ appwriteProjectId || "Not configured" }}</p>
            </div>
            <div class="rounded-md border border-[#E1E4EA] bg-white p-5 shadow-sm">
              <p class="text-sm font-medium text-[#6F6F76]">Endpoint</p>
              <p class="mt-2 text-lg font-semibold">Connected client</p>
              <p class="mt-1 break-all text-sm text-[#56565C]">{{ appwriteEndpoint || "Not configured" }}</p>
            </div>
          </section>

          <section class="mt-6 overflow-hidden rounded-md border border-[#E1E4EA] bg-white shadow-sm">
            <div class="border-b border-[#E1E4EA] bg-[#FAFAFB] px-5 py-4">
              <h3 class="text-lg font-semibold">Work areas</h3>
              <p class="mt-1 text-sm text-[#6F6F76]">Open the operational tools for this starter app.</p>
            </div>

            <div class="grid gap-0 divide-y divide-[#EDEDF0] md:grid-cols-2 md:divide-x md:divide-y-0">
              <NuxtLink
                v-for="area in workAreas"
                :key="area.to"
                :to="area.to"
                class="block p-5 transition hover:bg-[#FAFAFB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FD366E]"
              >
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <h4 class="font-semibold text-[#2D2D31]">{{ area.title }}</h4>
                    <p class="mt-2 text-sm leading-6 text-[#56565C]">{{ area.description }}</p>
                  </div>
                  <span class="shrink-0 rounded-sm bg-[#EDEDF0] px-2 py-1 text-xs font-medium text-[#56565C]">
                    Open
                  </span>
                </div>
              </NuxtLink>
            </div>
          </section>
        </template>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
const router = useRouter();
const config = useRuntimeConfig();
const { checking, configurationError, error, loadUser, loading, logout, user } = useAuth();

const ready = ref(false);
const { appwriteEndpoint, appwriteProjectId, appwriteProjectName } = config.public;

const navigation = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Push notifications", to: "/push-notifications" },
  { label: "People", to: "/persons" },
  { label: "Chat", to: "/chat" },
  { label: "Admin messaging", to: "/admin-messaging" },
];

const workAreas = [
  {
    title: "Announcement notifications",
    description: "Register this account browser for Appwrite Messaging topic pushes.",
    to: "/push-notifications",
  },
  {
    title: "Person management",
    description: "Create, review, update, and remove person records stored in Appwrite.",
    to: "/persons",
  },
  {
    title: "Realtime chat",
    description: "Test database-backed realtime messages with connected browser sessions.",
    to: "/chat",
  },
  {
    title: "Admin messaging",
    description: "Create topics and send push messages through protected server endpoints.",
    to: "/admin-messaging",
  },
];

onMounted(async () => {
  const currentUser = await loadUser();
  ready.value = true;

  if (!currentUser && !configurationError.value) {
    await router.push("/login?redirect=/dashboard");
  }
});

async function signOut() {
  await logout();

  if (!error.value) {
    await router.push("/login");
  }
}
</script>
