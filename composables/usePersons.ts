import { ID, Query, type Models } from "appwrite";
import { databases } from "~/lib/appwrite";

export type PersonStatus = "active" | "inactive";

export interface PersonPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  status: PersonStatus;
  notes: string;
}

export type PersonDocument = Models.Document & PersonPayload;

export function usePersons() {
  const config = useRuntimeConfig();

  const databaseId = computed(() => config.public.appwriteDatabaseId || "");
  const collectionId = computed(() => config.public.appwritePersonCollectionId || "");
  const persons = ref<PersonDocument[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  const deletingId = ref<string | null>(null);
  const error = ref("");
  const success = ref("");

  const configurationError = computed(() => {
    if (!databaseId.value || !collectionId.value) {
      return "Set NUXT_PUBLIC_APPWRITE_DATABASE_ID and NUXT_PUBLIC_APPWRITE_PERSON_COLLECTION_ID to enable Person CRUD.";
    }

    return "";
  });

  async function listPersons() {
    if (configurationError.value) {
      error.value = configurationError.value;
      return;
    }

    loading.value = true;
    error.value = "";

    try {
      const response = await databases.listDocuments<PersonDocument>(
        databaseId.value,
        collectionId.value,
        [Query.orderDesc("$createdAt"), Query.limit(100)],
      );

      persons.value = response.documents;
    } catch (err) {
      error.value = getPersonErrorMessage(err, "Unable to load people.");
    } finally {
      loading.value = false;
    }
  }

  async function createPerson(payload: PersonPayload) {
    if (configurationError.value) {
      error.value = configurationError.value;
      return;
    }

    saving.value = true;
    error.value = "";
    success.value = "";

    try {
      await databases.createDocument<PersonDocument>(
        databaseId.value,
        collectionId.value,
        ID.unique(),
        payload,
      );

      success.value = "Person created.";
      await listPersons();
    } catch (err) {
      error.value = getPersonErrorMessage(err, "Unable to create person.");
    } finally {
      saving.value = false;
    }
  }

  async function updatePerson(documentId: string, payload: PersonPayload) {
    if (configurationError.value) {
      error.value = configurationError.value;
      return;
    }

    saving.value = true;
    error.value = "";
    success.value = "";

    try {
      await databases.updateDocument<PersonDocument>(
        databaseId.value,
        collectionId.value,
        documentId,
        payload,
      );

      success.value = "Person updated.";
      await listPersons();
    } catch (err) {
      error.value = getPersonErrorMessage(err, "Unable to update person.");
    } finally {
      saving.value = false;
    }
  }

  async function deletePerson(documentId: string) {
    if (configurationError.value) {
      error.value = configurationError.value;
      return;
    }

    deletingId.value = documentId;
    error.value = "";
    success.value = "";

    try {
      await databases.deleteDocument(databaseId.value, collectionId.value, documentId);
      success.value = "Person deleted.";
      persons.value = persons.value.filter((person) => person.$id !== documentId);
    } catch (err) {
      error.value = getPersonErrorMessage(err, "Unable to delete person.");
    } finally {
      deletingId.value = null;
    }
  }

  return {
    configurationError,
    deletingId,
    error,
    listPersons,
    loading,
    persons,
    saving,
    success,
    createPerson,
    updatePerson,
    deletePerson,
  };
}

function getPersonErrorMessage(err: unknown, fallback: string) {
  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallback;
}
