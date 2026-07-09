<template>
  <div class="min-h-dvh bg-[#F7F8FA] text-[#2D2D31]">
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:font-medium focus:text-[#2D2D31] focus:shadow"
    >
      Skip to main content
    </a>

    <div class="mx-auto grid min-h-dvh max-w-[96rem] lg:grid-cols-[17rem_1fr]">
      <aside
        class="sticky top-0 z-30 border-b border-[#E1E4EA] bg-white/95 px-4 py-3 backdrop-blur lg:h-dvh lg:border-b-0 lg:border-r lg:px-5 lg:py-5"
      >
        <div class="flex items-center justify-between gap-3">
          <NuxtLink
            to="/"
            class="flex min-h-11 items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
            aria-label="Open Appwrite Nuxt starter home"
          >
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#E1E4EA] bg-[#FAFAFB]">
              <img src="/appwrite.svg" alt="" class="h-6 w-6" width="24" height="24" />
            </span>
            <span class="min-w-0">
              <span class="block text-xs font-semibold uppercase text-[#6F6F76]">Appwrite</span>
              <span class="block truncate font-[Poppins] text-lg font-light text-[#2D2D31]">
                Nuxt Starter
              </span>
            </span>
          </NuxtLink>

          <button
            type="button"
            class="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[#C9CDD6] bg-white text-[#2D2D31] transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] lg:hidden"
            :aria-expanded="mobileNavOpen"
            aria-controls="app-navigation"
            aria-label="Toggle navigation"
            @click="mobileNavOpen = !mobileNavOpen"
          >
            <span class="grid gap-1" aria-hidden="true">
              <span class="block h-0.5 w-5 rounded-full bg-current" />
              <span class="block h-0.5 w-5 rounded-full bg-current" />
              <span class="block h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>
        </div>

        <nav
          id="app-navigation"
          class="mt-4 grid gap-6 lg:flex lg:h-[calc(100dvh-7rem)] lg:flex-col"
          :class="mobileNavOpen ? 'block' : 'hidden lg:flex'"
          aria-label="Primary navigation"
        >
          <div>
            <p class="px-3 text-xs font-semibold uppercase text-[#6F6F76]">Workspace</p>
            <div class="mt-2 grid gap-1">
              <NuxtLink
                v-for="item in primaryNavigation"
                :key="item.to"
                :to="item.to"
                class="group flex min-h-11 items-center gap-3 rounded-md px-3 py-2 font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
                :class="navLinkClass(item.to)"
                :aria-current="isActive(item.to) ? 'page' : undefined"
                @click="mobileNavOpen = false"
              >
                <span
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold"
                  :class="isActive(item.to) ? 'bg-white text-[#FD366E]' : 'bg-[#F2F3F5] text-[#56565C] group-hover:bg-white'"
                  aria-hidden="true"
                >
                  {{ item.shortLabel }}
                </span>
                <span>{{ item.label }}</span>
              </NuxtLink>
            </div>
          </div>

          <div>
            <p class="px-3 text-xs font-semibold uppercase text-[#6F6F76]">Admin</p>
            <div class="mt-2 grid gap-1">
              <NuxtLink
                v-for="item in adminNavigation"
                :key="item.to"
                :to="item.to"
                class="group flex min-h-11 items-center gap-3 rounded-md px-3 py-2 font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
                :class="navLinkClass(item.to)"
                :aria-current="isActive(item.to) ? 'page' : undefined"
                @click="mobileNavOpen = false"
              >
                <span
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold"
                  :class="isActive(item.to) ? 'bg-white text-[#FD366E]' : 'bg-[#F2F3F5] text-[#56565C] group-hover:bg-white'"
                  aria-hidden="true"
                >
                  {{ item.shortLabel }}
                </span>
                <span>{{ item.label }}</span>
              </NuxtLink>
            </div>
          </div>

          <div class="mt-auto grid gap-2 border-t border-[#EDEDF0] pt-4">
            <NuxtLink
              to="/login"
              class="inline-flex min-h-11 items-center justify-center rounded-md border border-[#C9CDD6] bg-white px-4 py-2 font-medium text-[#2D2D31] transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
              @click="mobileNavOpen = false"
            >
              Account
            </NuxtLink>
            <a
              href="https://cloud.appwrite.io"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex min-h-11 items-center justify-center rounded-md bg-[#FD366E] px-4 py-2 font-medium text-white transition hover:bg-[#E52E62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
            >
              Appwrite Console
            </a>
          </div>
        </nav>
      </aside>

      <div class="min-w-0">
        <header class="border-b border-[#E1E4EA] bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p class="text-sm font-medium text-[#6F6F76]">{{ currentSection }}</p>
              <h1 class="font-[Poppins] text-2xl font-light text-[#2D2D31]">{{ currentTitle }}</h1>
            </div>
            <NuxtLink
              to="/dashboard"
              class="inline-flex min-h-11 w-fit items-center justify-center rounded-md border border-[#C9CDD6] bg-white px-4 py-2 font-medium text-[#2D2D31] transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
            >
              Open dashboard
            </NuxtLink>
          </div>
        </header>

        <div id="main-content" tabindex="-1">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type NavigationItem = {
  label: string;
  section: string;
  shortLabel: string;
  title: string;
  to: string;
};

const route = useRoute();
const mobileNavOpen = ref(false);

const primaryNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    section: "Workspace",
    shortLabel: "DB",
    title: "Dashboard",
    to: "/dashboard",
  },
  {
    label: "Connection check",
    section: "Setup",
    shortLabel: "CK",
    title: "Connection check",
    to: "/",
  },
  {
    label: "Push notifications",
    section: "Messaging",
    shortLabel: "PN",
    title: "Announcement notifications",
    to: "/push-notifications",
  },
  {
    label: "People",
    section: "Data",
    shortLabel: "PE",
    title: "Person management",
    to: "/persons",
  },
  {
    label: "Chat",
    section: "Realtime",
    shortLabel: "CH",
    title: "Realtime chat",
    to: "/chat",
  },
  {
    label: "Storage",
    section: "Files",
    shortLabel: "ST",
    title: "Storage demo",
    to: "/storage-demo",
  },
];

const adminNavigation: NavigationItem[] = [
  {
    label: "Messaging admin",
    section: "Admin",
    shortLabel: "AD",
    title: "Messaging admin",
    to: "/admin-messaging",
  },
];

const allNavigation = [...primaryNavigation, ...adminNavigation];

const currentNavigationItem = computed(() => {
  if (route.path === "/login") {
    return {
      label: "Account",
      section: "Account",
      shortLabel: "AC",
      title: "Appwrite account access",
      to: "/login",
    };
  }

  return allNavigation.find((item) => isActive(item.to)) || primaryNavigation[0];
});

const currentSection = computed(() => currentNavigationItem.value.section);
const currentTitle = computed(() => currentNavigationItem.value.title);

watch(
  () => route.fullPath,
  () => {
    mobileNavOpen.value = false;
  },
);

function isActive(path: string) {
  if (path === "/") {
    return route.path === "/";
  }

  return route.path === path || route.path.startsWith(`${path}/`);
}

function navLinkClass(path: string) {
  return isActive(path)
    ? "bg-[#FFF1F5] text-[#C9154F]"
    : "text-[#56565C] hover:bg-[#F7F8FA] hover:text-[#2D2D31]";
}
</script>
