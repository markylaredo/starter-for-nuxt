import { ID, Query, type Models, type RealtimeResponseEvent } from "appwrite";
import { client, databases } from "~/lib/appwrite";

export interface ChatMessagePayload {
  message: string;
  senderName: string;
  roomId: string;
}

export type ChatMessageDocument = Models.Document & ChatMessagePayload;

export function useChats(roomId = "general") {
  const config = useRuntimeConfig();

  const databaseId = computed(() => config.public.appwriteDatabaseId || "");
  const collectionId = computed(() => config.public.appwriteChatCollectionId || "chats");
  const messages = ref<ChatMessageDocument[]>([]);
  const loading = ref(false);
  const sending = ref(false);
  const error = ref("");
  const realtimeConnected = ref(false);

  const configurationError = computed(() => {
    if (!databaseId.value || !collectionId.value) {
      return "Set NUXT_PUBLIC_APPWRITE_DATABASE_ID and NUXT_PUBLIC_APPWRITE_CHAT_COLLECTION_ID to enable realtime chat.";
    }

    return "";
  });

  const channel = computed(
    () => `databases.${databaseId.value}.collections.${collectionId.value}.documents`,
  );

  async function listMessages() {
    if (configurationError.value) {
      error.value = configurationError.value;
      return;
    }

    loading.value = true;
    error.value = "";

    try {
      const response = await databases.listDocuments<ChatMessageDocument>(
        databaseId.value,
        collectionId.value,
        [Query.orderAsc("$createdAt"), Query.limit(100)],
      );

      messages.value = response.documents.filter((message) => message.roomId === roomId);
    } catch (err) {
      error.value = getChatErrorMessage(err, "Unable to load chat messages.");
    } finally {
      loading.value = false;
    }
  }

  async function sendMessage(payload: ChatMessagePayload) {
    if (configurationError.value) {
      error.value = configurationError.value;
      return;
    }

    sending.value = true;
    error.value = "";

    try {
      await databases.createDocument<ChatMessageDocument>(
        databaseId.value,
        collectionId.value,
        ID.unique(),
        payload,
      );
    } catch (err) {
      error.value = getChatErrorMessage(err, "Unable to send message.");
    } finally {
      sending.value = false;
    }
  }

  function subscribeToMessages() {
    if (configurationError.value) {
      error.value = configurationError.value;
      return () => {};
    }

    realtimeConnected.value = true;

    return client.subscribe<ChatMessageDocument>(
      channel.value,
      (event: RealtimeResponseEvent<ChatMessageDocument>) => {
        const message = event.payload;

        if (!message || message.roomId !== roomId) {
          return;
        }

        if (event.events.some((name) => name.endsWith(".create"))) {
          upsertMessage(message);
        }

        if (event.events.some((name) => name.endsWith(".update"))) {
          upsertMessage(message);
        }

        if (event.events.some((name) => name.endsWith(".delete"))) {
          messages.value = messages.value.filter((item) => item.$id !== message.$id);
        }
      },
    );
  }

  function upsertMessage(message: ChatMessageDocument) {
    const existingIndex = messages.value.findIndex((item) => item.$id === message.$id);

    if (existingIndex >= 0) {
      messages.value.splice(existingIndex, 1, message);
    } else {
      messages.value.push(message);
    }

    messages.value.sort(
      (first, second) =>
        new Date(first.$createdAt).getTime() - new Date(second.$createdAt).getTime(),
    );
  }

  return {
    configurationError,
    error,
    listMessages,
    loading,
    messages,
    realtimeConnected,
    sending,
    sendMessage,
    subscribeToMessages,
  };
}

function getChatErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}
