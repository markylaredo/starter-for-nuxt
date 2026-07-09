import { ID, Query, type Models } from "appwrite";
import { storage } from "~/lib/appwrite";

export type StorageBucketSummary = {
  $id: string;
  name: string;
  enabled: boolean;
  maximumFileSize: number;
  allowedFileExtensions: string[];
  permissions: string[];
};

export type CreateStorageBucketPayload = {
  access: "authenticated" | "public-read";
  allowedFileExtensions: string[];
  maximumFileSizeMb: number;
  name: string;
};

export function useStorageDemo() {
  const config = useRuntimeConfig();

  const configuredBucketId = computed(() => config.public.appwriteStorageBucketId || "");
  const activeBucketId = ref(configuredBucketId.value);
  const bucketId = computed(() => activeBucketId.value || configuredBucketId.value);
  const buckets = ref<StorageBucketSummary[]>([]);
  const creatingBucket = ref(false);
  const files = ref<Models.File[]>([]);
  const loadingBuckets = ref(false);
  const loadingFiles = ref(false);
  const uploading = ref(false);
  const deletingId = ref<string | null>(null);
  const uploadProgress = ref(0);
  const error = ref("");
  const success = ref("");

  const selectedBucket = computed(() =>
    buckets.value.find((bucket) => bucket.$id === bucketId.value),
  );

  const configurationError = computed(() => {
    if (!bucketId.value) {
      return "Create or select a storage bucket before uploading files.";
    }

    return "";
  });

  async function listBuckets() {
    loadingBuckets.value = true;
    error.value = "";

    try {
      const response = await $fetch<{ buckets: StorageBucketSummary[] }>("/api/storage/buckets");
      buckets.value = response.buckets;

      if (!activeBucketId.value && configuredBucketId.value) {
        activeBucketId.value = configuredBucketId.value;
      }
    } catch (err) {
      error.value = getStorageErrorMessage(err, "Unable to load storage buckets.");
    } finally {
      loadingBuckets.value = false;
    }
  }

  async function listFiles() {
    if (configurationError.value) {
      error.value = configurationError.value;
      return;
    }

    loadingFiles.value = true;
    error.value = "";

    try {
      const response = await storage.listFiles({
        bucketId: bucketId.value,
        queries: [Query.orderDesc("$createdAt"), Query.limit(50)],
      });

      files.value = response.files;
    } catch (err) {
      error.value = getStorageErrorMessage(err, "Unable to load files.");
    } finally {
      loadingFiles.value = false;
    }
  }

  async function createBucket(payload: CreateStorageBucketPayload, adminToken: string) {
    creatingBucket.value = true;
    error.value = "";
    success.value = "";

    try {
      await $fetch("/api/admin/storage/buckets", {
        method: "POST",
        headers: {
          "x-admin-token": adminToken,
        },
        body: payload,
      });

      const bucketId = getCreatedBucketId(response);

      if (bucketId) {
        activeBucketId.value = bucketId;
      }

      success.value = `Storage bucket ${bucketId || payload.name} created.`;
      await listBuckets();
      await listFiles();
    } catch (err) {
      error.value = getStorageErrorMessage(err, "Unable to create storage bucket.");
    } finally {
      creatingBucket.value = false;
    }
  }

  async function uploadFile(file: File) {
    if (configurationError.value) {
      error.value = configurationError.value;
      return;
    }

    uploading.value = true;
    uploadProgress.value = 0;
    error.value = "";
    success.value = "";

    try {
      await storage.createFile({
        bucketId: bucketId.value,
        fileId: ID.unique(),
        file,
        onProgress: (progress) => {
          uploadProgress.value = progress.progress;
        },
      });

      success.value = "File uploaded.";
      await listFiles();
    } catch (err) {
      error.value = getStorageErrorMessage(err, "Unable to upload file.");
    } finally {
      uploading.value = false;
    }
  }

  async function deleteFile(fileId: string) {
    if (configurationError.value) {
      error.value = configurationError.value;
      return;
    }

    deletingId.value = fileId;
    error.value = "";
    success.value = "";

    try {
      await storage.deleteFile({
        bucketId: bucketId.value,
        fileId,
      });

      files.value = files.value.filter((file) => file.$id !== fileId);
      success.value = "File deleted.";
    } catch (err) {
      error.value = getStorageErrorMessage(err, "Unable to delete file.");
    } finally {
      deletingId.value = null;
    }
  }

  function getFilePreviewUrl(fileId: string) {
    return storage.getFilePreview({
      bucketId: bucketId.value,
      fileId,
      width: 640,
      height: 420,
      quality: 80,
    });
  }

  function getFileDownloadUrl(fileId: string) {
    return storage.getFileDownload({
      bucketId: bucketId.value,
      fileId,
    });
  }

  function getFileViewUrl(fileId: string) {
    return storage.getFileView({
      bucketId: bucketId.value,
      fileId,
    });
  }

  return {
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
  };
}

function getCreatedBucketId(response: unknown) {
  if (
    response &&
    typeof response === "object" &&
    "bucket" in response &&
    response.bucket &&
    typeof response.bucket === "object" &&
    "$id" in response.bucket
  ) {
    return String(response.bucket.$id || "");
  }

  return "";
}

function getStorageErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}
