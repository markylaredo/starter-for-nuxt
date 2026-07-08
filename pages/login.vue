<template>
  <main class="min-h-dvh bg-[#F7F8FA] px-4 py-6 text-[#2D2D31] sm:px-6 lg:px-8">
    <div class="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-6xl items-center">
      <div class="grid w-full gap-6 lg:grid-cols-[1fr_minmax(22rem,28rem)] lg:items-center">
        <section class="max-w-2xl">
          <NuxtLink
            to="/"
            class="mb-5 inline-flex min-h-11 items-center text-sm font-medium text-[#56565C] underline-offset-4 hover:text-[#2D2D31] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
          >
            Back to Appwrite check
          </NuxtLink>
          <h1 class="font-[Poppins] text-4xl font-light leading-tight text-[#2D2D31]">
            Appwrite account access
          </h1>
          <p class="mt-4 max-w-xl text-base leading-7 text-[#56565C]">
            Sign in or create an account for authenticated Appwrite features like browser push
            target registration and signed-in messaging topics.
          </p>
        </section>

        <section class="rounded-md border border-[#E1E4EA] bg-white p-5 shadow-sm">
          <div class="grid grid-cols-2 rounded-md border border-[#E1E4EA] bg-[#FAFAFB] p-1">
            <button
              type="button"
              class="min-h-11 rounded-sm px-3 py-2 font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
              :class="mode === 'login' ? 'bg-white text-[#2D2D31] shadow-sm' : 'text-[#56565C] hover:text-[#2D2D31]'"
              @click="setMode('login')"
            >
              Login
            </button>
            <button
              type="button"
              class="min-h-11 rounded-sm px-3 py-2 font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
              :class="mode === 'signup' ? 'bg-white text-[#2D2D31] shadow-sm' : 'text-[#56565C] hover:text-[#2D2D31]'"
              @click="setMode('signup')"
            >
              Sign up
            </button>
          </div>

          <div v-if="user" class="mt-5 rounded-md border border-[#9AD7BE] bg-[#ECFDF4] p-4 text-[#0A714F]">
            <p class="font-medium">Signed in as {{ user.name || user.email }}</p>
            <p class="mt-1 text-sm">{{ user.email }}</p>
            <NuxtLink
              to="/dashboard"
              class="mt-3 inline-flex min-h-11 items-center justify-center rounded-md border border-[#9AD7BE] bg-white px-4 py-2 font-medium text-[#0A714F] transition hover:bg-[#ECFDF4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A714F]"
            >
              Open dashboard
            </NuxtLink>
          </div>

          <section
            v-if="configurationError || error"
            role="alert"
            class="mt-5 rounded-md border border-[#F2A8A8] bg-[#FFF1F1] p-4 text-[#9F1D1D]"
          >
            {{ configurationError || error }}
          </section>

          <form class="mt-5 grid gap-4" @submit.prevent="submitAuth">
            <label v-if="mode === 'signup'" class="grid gap-1.5">
              <span class="font-medium text-[#2D2D31]">Name *</span>
              <input
                v-model.trim="form.name"
                type="text"
                autocomplete="name"
                class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
                required
              />
            </label>

            <label class="grid gap-1.5">
              <span class="font-medium text-[#2D2D31]">Email *</span>
              <input
                v-model.trim="form.email"
                type="email"
                autocomplete="email"
                class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
                required
              />
            </label>

            <label class="grid gap-1.5">
              <span class="font-medium text-[#2D2D31]">Password *</span>
              <input
                v-model="form.password"
                :autocomplete="mode === 'signup' ? 'new-password' : 'current-password'"
                type="password"
                minlength="8"
                class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
                required
              />
              <span v-if="mode === 'signup'" class="text-sm leading-6 text-[#6F6F76]">
                Password must be at least 8 characters.
              </span>
            </label>

            <button
              type="submit"
              class="inline-flex min-h-11 items-center justify-center rounded-md bg-[#FD366E] px-4 py-2 font-medium text-white transition hover:bg-[#E52E62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="loading || Boolean(configurationError)"
            >
              {{ loading ? 'Working...' : mode === 'login' ? 'Login' : 'Create account' }}
            </button>
          </form>

          <div class="mt-5 flex flex-col gap-3 border-t border-[#EDEDF0] pt-5 sm:flex-row">
            <NuxtLink
              to="/push-notifications"
              class="inline-flex min-h-11 flex-1 items-center justify-center rounded-md border border-[#C9CDD6] bg-white px-4 py-2 font-medium text-[#2D2D31] transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
            >
              Open push demo
            </NuxtLink>
            <button
              v-if="user"
              type="button"
              class="inline-flex min-h-11 items-center justify-center rounded-md border border-[#F2A8A8] bg-white px-4 py-2 font-medium text-[#9F1D1D] transition hover:bg-[#FFF1F1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="loading"
              @click="logout"
            >
              Sign out
            </button>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
const route = useRoute();
const router = useRouter();
const { configurationError, error, loadUser, loading, login, logout, signup, user } = useAuth();

const mode = ref<AuthMode>(route.query.mode === "signup" ? "signup" : "login");
const form = reactive({
  email: "",
  name: "",
  password: "",
});

onMounted(() => {
  loadUser();
});

function setMode(nextMode: AuthMode) {
  mode.value = nextMode;
  error.value = "";
}

async function submitAuth() {
  const email = form.email.trim();
  const password = form.password;

  if (mode.value === "signup") {
    const name = form.name.trim();

    if (!name || !email || password.length < 8) {
      error.value = "Name, valid email, and an 8 character password are required.";
      return;
    }

    await signup({ email, name, password });
  } else {
    if (!email || !password) {
      error.value = "Email and password are required.";
      return;
    }

    await login({ email, password });
  }

  const redirect = getSafeRedirect();

  if (user.value) {
    await router.push(redirect);
  }
}

function getSafeRedirect() {
  const redirect = typeof route.query.redirect === "string" ? route.query.redirect : "";

  if (redirect.startsWith("/") && !redirect.startsWith("//") && redirect !== "/login") {
    return redirect;
  }

  return "/dashboard";
}
</script>
