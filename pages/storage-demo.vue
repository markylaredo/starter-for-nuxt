<template>
  <main class="min-h-dvh bg-[#F7F8FA] px-4 py-6 text-[#2D2D31] sm:px-6 lg:px-8">
    <div class="mx-auto flex max-w-7xl flex-col gap-6">
      <header class="flex flex-col gap-4 border-b border-[#E1E4EA] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <NuxtLink
            to="/dashboard"
            class="mb-4 inline-flex min-h-11 items-center text-sm font-medium text-[#56565C] underline-offset-4 hover:text-[#2D2D31] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
          >
            Back to dashboard
          </NuxtLink>
          <h1 class="font-[Poppins] text-3xl font-light text-[#2D2D31]">Storage demo</h1>
          <p class="mt-2 max-w-2xl text-base leading-7 text-[#56565C]">
            Retrieve Appwrite buckets, upload files to the configured bucket, then preview or download them.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center rounded-md border border-[#C9CDD6] bg-white px-4 py-2 font-medium text-[#2D2D31] transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loadingBuckets || loadingFiles"
          @click="refreshAll"
        >
          {{ loadingBuckets || loadingFiles ? "Refreshing..." : "Refresh" }}
        </button>
      </header>

      <section
        v-if="configurationError"
        role="alert"
        class="rounded-md border border-[#F6C453] bg-[#FFF8E6] p-4 text-[#6E5200]"
      >
        {{ configurationError }}
      </section>

      <section
        v-if="authError"
        role="alert"
        class="rounded-md border border-[#F6C453] bg-[#FFF8E6] p-4 text-[#6E5200]"
      >
        {{ authError }}
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

      <div class="grid gap-6 lg:grid-cols-[minmax(20rem,24rem)_1fr] lg:items-start">
        <section class="grid gap-6">
          <div class="rounded-md border border-[#E1E4EA] bg-white p-5 shadow-sm">
            <h2 class="text-xl font-semibold text-[#2D2D31]">Active bucket</h2>
            <p class="mt-2 break-all text-sm leading-6 text-[#56565C]">
              {{ bucketId || "Create or select a bucket" }}
            </p>

            <label class="mt-5 grid gap-1.5">
              <span class="font-medium text-[#2D2D31]">Use bucket</span>
              <select
                v-model="activeBucketId"
                class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
                :disabled="loadingBuckets || buckets.length === 0"
              >
                <option value="" disabled>Select a bucket</option>
                <option v-for="bucket in buckets" :key="bucket.$id" :value="bucket.$id">
                  {{ bucket.name }} ({{ bucket.$id }})
                </option>
              </select>
              <span class="text-sm leading-6 text-[#6F6F76]">
                The configured env bucket is {{ configuredBucketId || "not set" }}.
              </span>
            </label>

            <div class="mt-5 grid gap-3 text-sm">
              <div class="rounded-md bg-[#FAFAFB] p-3">
                <p class="font-medium text-[#6F6F76]">Name</p>
                <p class="mt-1 text-[#2D2D31]">{{ selectedBucket?.name || "Not found in bucket list" }}</p>
              </div>
              <div class="rounded-md bg-[#FAFAFB] p-3">
                <p class="font-medium text-[#6F6F76]">Status</p>
                <p class="mt-1 text-[#2D2D31]">
                  {{ selectedBucket ? selectedBucket.enabled ? "Enabled" : "Disabled" : "Unknown" }}
                </p>
              </div>
              <div class="rounded-md bg-[#FAFAFB] p-3">
                <p class="font-medium text-[#6F6F76]">Max file size</p>
                <p class="mt-1 text-[#2D2D31]">
                  {{ selectedBucket ? formatBytes(selectedBucket.maximumFileSize) : "Unknown" }}
                </p>
              </div>
            </div>
          </div>

          <form
            class="rounded-md border border-[#E1E4EA] bg-white p-5 shadow-sm"
            @submit.prevent="submitCreateBucket"
          >
            <h2 class="text-xl font-semibold text-[#2D2D31]">Create bucket</h2>
            <p class="mt-1 text-sm leading-6 text-[#6F6F76]">
              Creates an Appwrite Storage bucket through the protected server endpoint.
            </p>

            <div class="mt-5 grid gap-4">
              <label class="grid gap-1.5">
                <span class="font-medium text-[#2D2D31]">Admin API token *</span>
                <input
                  v-model.trim="adminToken"
                  type="password"
                  autocomplete="off"
                  class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
                  required
                />
                <span class="text-sm leading-6 text-[#6F6F76]">
                  Must match server-side ADMIN_API_TOKEN.
                </span>
              </label>

              <label class="grid gap-1.5">
                <span class="font-medium text-[#2D2D31]">Name *</span>
                <input
                  v-model.trim="bucketForm.name"
                  type="text"
                  class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
                  required
                />
                <span class="text-sm leading-6 text-[#6F6F76]">
                  Bucket ID is generated automatically from the name.
                </span>
              </label>

              <label class="grid gap-1.5">
                <span class="font-medium text-[#2D2D31]">Maximum file size (MB)</span>
                <input
                  v-model.number="bucketForm.maximumFileSizeMb"
                  type="number"
                  min="1"
                  max="5120"
                  class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
                />
              </label>

              <label class="grid gap-1.5">
                <span class="font-medium text-[#2D2D31]">Allowed extensions</span>
                <input
                  v-model.trim="allowedExtensionsInput"
                  type="text"
                  placeholder="jpg, png, pdf"
                  class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
                />
                <span class="text-sm leading-6 text-[#6F6F76]">
                  Leave blank to allow every file extension.
                </span>
              </label>

              <label class="grid gap-1.5">
                <span class="font-medium text-[#2D2D31]">Access</span>
                <select
                  v-model="bucketForm.access"
                  class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
                >
                  <option value="authenticated">Signed-in users</option>
                  <option value="public-read">Public read, signed-in writes</option>
                </select>
              </label>
            </div>

            <button
              type="submit"
              class="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#FD366E] px-4 py-2 font-medium text-white transition hover:bg-[#E52E62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="creatingBucket || !adminToken"
            >
              {{ creatingBucket ? "Creating..." : "Create storage bucket" }}
            </button>
          </form>

          <form
            class="rounded-md border border-[#E1E4EA] bg-white p-5 shadow-sm"
            @submit.prevent="submitUpload"
          >
            <h2 class="text-xl font-semibold text-[#2D2D31]">Upload file</h2>
            <p class="mt-1 text-sm leading-6 text-[#6F6F76]">
              Upload uses the browser Appwrite Storage SDK and the current account session.
            </p>

            <label class="mt-5 grid gap-1.5">
              <span class="font-medium text-[#2D2D31]">File *</span>
              <input
                ref="fileInput"
                type="file"
                class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-[#EDEDF0] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#2D2D31] focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
                required
                @change="selectFile"
              />
            </label>

            <div v-if="selectedFile" class="mt-4 rounded-md bg-[#FAFAFB] p-3 text-sm text-[#56565C]">
              <p class="break-all font-medium text-[#2D2D31]">{{ selectedFile.name }}</p>
              <p class="mt-1">{{ selectedFile.type || "Unknown type" }} · {{ formatBytes(selectedFile.size) }}</p>
            </div>

            <div v-if="uploading" class="mt-4">
              <div class="h-2 overflow-hidden rounded-full bg-[#EDEDF0]">
                <div
                  class="h-full rounded-full bg-[#FD366E] transition-[width]"
                  :style="{ width: `${uploadProgress}%` }"
                />
              </div>
              <p class="mt-2 text-sm text-[#6F6F76]">{{ uploadProgress }}% uploaded</p>
            </div>

            <button
              type="submit"
              class="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-[#FD366E] px-4 py-2 font-medium text-white transition hover:bg-[#E52E62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="uploading || Boolean(configurationError) || !selectedFile"
            >
              {{ uploading ? "Uploading..." : "Upload to bucket" }}
            </button>
          </form>

          <section class="rounded-md border border-[#E1E4EA] bg-white shadow-sm">
            <div class="border-b border-[#E1E4EA] p-5">
              <h2 class="text-xl font-semibold text-[#2D2D31]">Buckets</h2>
              <p class="mt-1 text-sm text-[#6F6F76]">
                {{ buckets.length }} {{ buckets.length === 1 ? "bucket" : "buckets" }} retrieved
              </p>
            </div>

            <div v-if="loadingBuckets" class="grid gap-3 p-5">
              <div v-for="index in 3" :key="index" class="h-16 animate-pulse rounded-md bg-[#EDEDF0]" />
            </div>

            <div v-else-if="buckets.length === 0" class="p-5 text-sm leading-6 text-[#6F6F76]">
              No buckets returned from Appwrite.
            </div>

            <ul v-else class="divide-y divide-[#EDEDF0]">
              <li v-for="bucket in buckets" :key="bucket.$id" class="p-5">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="font-semibold text-[#2D2D31]">{{ bucket.name }}</p>
                    <p class="mt-1 break-all text-sm text-[#6F6F76]">{{ bucket.$id }}</p>
                  </div>
                  <span
                    class="shrink-0 rounded-sm px-2 py-1 text-xs font-semibold"
                    :class="bucket.enabled ? 'bg-[#ECFDF4] text-[#0A714F]' : 'bg-[#F2F3F5] text-[#56565C]'"
                  >
                    {{ bucket.enabled ? "Enabled" : "Disabled" }}
                  </span>
                </div>
              </li>
            </ul>
          </section>
        </section>

        <section class="overflow-hidden rounded-md border border-[#E1E4EA] bg-white shadow-sm">
          <div class="flex flex-col gap-3 border-b border-[#E1E4EA] p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-xl font-semibold text-[#2D2D31]">Files</h2>
              <p class="mt-1 text-sm text-[#6F6F76]">
                {{ files.length }} {{ files.length === 1 ? "file" : "files" }} in the configured bucket
              </p>
            </div>
            <button
              type="button"
              class="inline-flex min-h-11 items-center justify-center rounded-md border border-[#C9CDD6] bg-white px-4 py-2 font-medium text-[#2D2D31] transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="loadingFiles || Boolean(configurationError)"
              @click="listFiles"
            >
              {{ loadingFiles ? "Loading..." : "Reload files" }}
            </button>
          </div>

          <div v-if="loadingFiles" class="grid gap-4 p-5 md:grid-cols-2">
            <div v-for="index in 4" :key="index" class="h-52 animate-pulse rounded-md bg-[#EDEDF0]" />
          </div>

          <div v-else-if="files.length === 0" class="p-8 text-center">
            <h3 class="text-lg font-semibold text-[#2D2D31]">No files yet</h3>
            <p class="mx-auto mt-2 max-w-md leading-7 text-[#6F6F76]">
              Choose a file and upload it. Uploaded files will appear here with view and download links.
            </p>
          </div>

          <div v-else class="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
            <article
              v-for="file in files"
              :key="file.$id"
              class="overflow-hidden rounded-md border border-[#E1E4EA] bg-white"
            >
              <div class="flex aspect-[4/3] items-center justify-center bg-[#F2F3F5]">
                <img
                  v-if="isImage(file)"
                  :src="getFilePreviewUrl(file.$id)"
                  :alt="file.name"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
                <div v-else class="px-4 text-center">
                  <p class="text-sm font-semibold text-[#2D2D31]">{{ file.mimeType || "File" }}</p>
                  <p class="mt-1 text-sm text-[#6F6F76]">{{ formatBytes(file.sizeOriginal) }}</p>
                </div>
              </div>

              <div class="p-4">
                <h3 class="break-all font-semibold text-[#2D2D31]">{{ file.name }}</h3>
                <dl class="mt-3 grid gap-2 text-sm text-[#56565C]">
                  <div class="flex justify-between gap-3">
                    <dt>Size</dt>
                    <dd>{{ formatBytes(file.sizeOriginal) }}</dd>
                  </div>
                  <div class="flex justify-between gap-3">
                    <dt>Created</dt>
                    <dd>{{ formatDate(file.$createdAt) }}</dd>
                  </div>
                </dl>

                <div class="mt-4 grid grid-cols-2 gap-2">
                  <a
                    :href="getFileViewUrl(file.$id)"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex min-h-11 items-center justify-center rounded-md border border-[#C9CDD6] bg-white px-3 py-2 font-medium text-[#2D2D31] transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
                  >
                    View
                  </a>
                  <a
                    :href="getFileDownloadUrl(file.$id)"
                    class="inline-flex min-h-11 items-center justify-center rounded-md border border-[#C9CDD6] bg-white px-3 py-2 font-medium text-[#2D2D31] transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
                  >
                    Download
                  </a>
                  <button
                    type="button"
                    class="col-span-2 inline-flex min-h-11 items-center justify-center rounded-md border border-[#F2A8A8] bg-white px-3 py-2 font-medium text-[#9F1D1D] transition hover:bg-[#FFF1F1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
                    :disabled="deletingId === file.$id"
                    @click="confirmDelete(file)"
                  >
                    {{ deletingId === file.$id ? "Deleting..." : "Delete" }}
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { Models } from "appwrite";

const {
  activeBucketId,
  bucketId,
  buckets,
  configurationError,
  configuredBucketId,
  createBucket,
  creatingBucket,
  deletingId,
  error,
  files,
  getFileDownloadUrl,
  getFilePreviewUrl,
  getFileViewUrl,
  listBuckets,
  listFiles,
  loadingBuckets,
  loadingFiles,
  selectedBucket,
  success,
  uploadFile,
  uploadProgress,
  uploading,
  deleteFile,
} = useStorageDemo();
const { error: authError, loadUser } = useAuth();

const adminToken = ref("");
const allowedExtensionsInput = ref("");
const selectedFile = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const bucketForm = reactive({
  access: "authenticated" as "authenticated" | "public-read",
  maximumFileSizeMb: 10,
  name: "",
});

onMounted(async () => {
  adminToken.value = sessionStorage.getItem("omeco.adminToken") || "";
  await loadUser();
  await refreshAll();
});

watch(adminToken, (value) => {
  sessionStorage.setItem("omeco.adminToken", value);
});

watch(activeBucketId, async () => {
  if (bucketId.value) {
    await listFiles();
  } else {
    files.value = [];
  }
});

async function refreshAll() {
  await listBuckets();

  if (!configurationError.value) {
    await listFiles();
  }
}

async function submitCreateBucket() {
  const name = bucketForm.name.trim();

  if (!name) {
    error.value = "Bucket name is required.";
    return;
  }

  await createBucket(
    {
      access: bucketForm.access,
      allowedFileExtensions: normalizeExtensions(allowedExtensionsInput.value),
      maximumFileSizeMb: Number(bucketForm.maximumFileSizeMb || 10),
      name,
    },
    adminToken.value,
  );

  if (!error.value) {
    bucketForm.name = "";
    bucketForm.maximumFileSizeMb = 10;
    allowedExtensionsInput.value = "";
  }
}

function selectFile(event: Event) {
  selectedFile.value = (event.target as HTMLInputElement).files?.[0] || null;
}

async function submitUpload() {
  if (!selectedFile.value) {
    return;
  }

  await uploadFile(selectedFile.value);

  if (!error.value) {
    selectedFile.value = null;

    if (fileInput.value) {
      fileInput.value.value = "";
    }
  }
}

function confirmDelete(file: Models.File) {
  const confirmed = window.confirm(`Delete ${file.name}?`);

  if (confirmed) {
    void deleteFile(file.$id);
  }
}

function isImage(file: Models.File) {
  return file.mimeType.startsWith("image/");
}

function formatBytes(value: number) {
  if (!value) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const amount = value / 1024 ** index;

  return `${amount.toFixed(amount >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizeExtensions(value: string) {
  return value
    .split(",")
    .map((extension) => extension.trim().replace(/^\./, "").toLowerCase())
    .filter(Boolean);
}
</script>
