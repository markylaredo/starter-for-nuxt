<template>
  <main class="min-h-dvh bg-[#F7F8FA] px-4 py-6 text-[#2D2D31] sm:px-6 lg:px-8">
    <div class="mx-auto flex max-w-7xl flex-col gap-6">
      <header class="flex flex-col gap-4 border-b border-[#E1E4EA] pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <NuxtLink
            to="/"
            class="mb-4 inline-flex min-h-11 items-center text-sm font-medium text-[#56565C] underline-offset-4 hover:text-[#2D2D31] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
          >
            Back to Appwrite check
          </NuxtLink>
          <h1 class="font-[Poppins] text-3xl font-light text-[#2D2D31]">Person management</h1>
          <p class="mt-2 max-w-2xl text-base leading-7 text-[#56565C]">
            Create, review, update, and remove person records stored in Appwrite.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center rounded-md bg-[#FD366E] px-4 py-2 font-medium text-white transition hover:bg-[#E52E62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loading"
          @click="resetForm"
        >
          New person
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
        <form
          class="rounded-md border border-[#E1E4EA] bg-white p-5 shadow-sm"
          @submit.prevent="submitPerson"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-xl font-semibold text-[#2D2D31]">
                {{ editingId ? 'Edit person' : 'Add person' }}
              </h2>
              <p class="mt-1 text-sm leading-6 text-[#6F6F76]">
                All required fields are marked.
              </p>
            </div>
            <span
              v-if="editingId"
              class="rounded-sm bg-[#EDEDF0] px-2 py-1 text-xs font-medium text-[#56565C]"
            >
              Editing
            </span>
          </div>

          <div class="mt-5 grid gap-4">
            <label class="grid gap-1.5">
              <span class="font-medium text-[#2D2D31]">First name *</span>
              <input
                v-model.trim="form.firstName"
                type="text"
                autocomplete="given-name"
                class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
                required
              />
            </label>

            <label class="grid gap-1.5">
              <span class="font-medium text-[#2D2D31]">Last name *</span>
              <input
                v-model.trim="form.lastName"
                type="text"
                autocomplete="family-name"
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
              <span class="font-medium text-[#2D2D31]">Phone</span>
              <input
                v-model.trim="form.phone"
                type="tel"
                autocomplete="tel"
                class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
              />
            </label>

            <label class="grid gap-1.5">
              <span class="font-medium text-[#2D2D31]">Role</span>
              <input
                v-model.trim="form.role"
                type="text"
                autocomplete="organization-title"
                class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
              />
            </label>

            <label class="grid gap-1.5">
              <span class="font-medium text-[#2D2D31]">Status</span>
              <select
                v-model="form.status"
                class="min-h-11 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <label class="grid gap-1.5">
              <span class="font-medium text-[#2D2D31]">Notes</span>
              <textarea
                v-model.trim="form.notes"
                rows="4"
                class="min-h-28 rounded-md border border-[#C9CDD6] bg-white px-3 py-2 text-base text-[#2D2D31] outline-none transition focus:border-[#FD366E] focus:ring-2 focus:ring-[#FD366E33]"
              />
            </label>
          </div>

          <div class="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              class="inline-flex min-h-11 flex-1 items-center justify-center rounded-md bg-[#FD366E] px-4 py-2 font-medium text-white transition hover:bg-[#E52E62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="saving || Boolean(configurationError)"
            >
              {{ saving ? 'Saving...' : editingId ? 'Save changes' : 'Create person' }}
            </button>
            <button
              type="button"
              class="inline-flex min-h-11 items-center justify-center rounded-md border border-[#C9CDD6] bg-white px-4 py-2 font-medium text-[#2D2D31] transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
              @click="resetForm"
            >
              Clear
            </button>
          </div>
        </form>

        <section class="overflow-hidden rounded-md border border-[#E1E4EA] bg-white shadow-sm">
          <div class="flex flex-col gap-3 border-b border-[#E1E4EA] p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 class="text-xl font-semibold text-[#2D2D31]">People</h2>
              <p class="mt-1 text-sm text-[#6F6F76]">
                {{ persons.length }} {{ persons.length === 1 ? 'record' : 'records' }}
              </p>
            </div>
            <button
              type="button"
              class="inline-flex min-h-11 items-center justify-center rounded-md border border-[#C9CDD6] bg-white px-4 py-2 font-medium text-[#2D2D31] transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="loading || Boolean(configurationError)"
              @click="listPersons"
            >
              {{ loading ? 'Refreshing...' : 'Refresh' }}
            </button>
          </div>

          <div v-if="loading" class="grid gap-3 p-5">
            <div v-for="index in 4" :key="index" class="h-16 animate-pulse rounded-md bg-[#EDEDF0]" />
          </div>

          <div v-else-if="persons.length === 0" class="p-8 text-center">
            <h3 class="text-lg font-semibold text-[#2D2D31]">No people yet</h3>
            <p class="mx-auto mt-2 max-w-md leading-7 text-[#6F6F76]">
              Add the first person with the form, then records will appear here.
            </p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="min-w-[54rem] w-full text-left">
              <thead class="border-b border-[#E1E4EA] bg-[#FAFAFB] text-xs uppercase text-[#6F6F76]">
                <tr>
                  <th class="px-5 py-3 font-semibold">Name</th>
                  <th class="px-5 py-3 font-semibold">Email</th>
                  <th class="px-5 py-3 font-semibold">Phone</th>
                  <th class="px-5 py-3 font-semibold">Role</th>
                  <th class="px-5 py-3 font-semibold">Status</th>
                  <th class="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#EDEDF0]">
                <tr v-for="person in persons" :key="person.$id" class="align-top">
                  <td class="px-5 py-4">
                    <div class="font-medium text-[#2D2D31]">
                      {{ person.firstName }} {{ person.lastName }}
                    </div>
                    <div v-if="person.notes" class="mt-1 max-w-xs truncate text-sm text-[#6F6F76]">
                      {{ person.notes }}
                    </div>
                  </td>
                  <td class="px-5 py-4 text-[#56565C]">{{ person.email }}</td>
                  <td class="px-5 py-4 text-[#56565C]">{{ person.phone || 'Not set' }}</td>
                  <td class="px-5 py-4 text-[#56565C]">{{ person.role || 'Not set' }}</td>
                  <td class="px-5 py-4">
                    <span
                      :class="person.status === 'active'
                        ? 'bg-[#ECFDF4] text-[#0A714F]'
                        : 'bg-[#F2F3F5] text-[#56565C]'"
                      class="rounded-sm px-2 py-1 text-xs font-semibold capitalize"
                    >
                      {{ person.status }}
                    </span>
                  </td>
                  <td class="px-5 py-4">
                    <div class="flex justify-end gap-2">
                      <button
                        type="button"
                        class="inline-flex min-h-11 items-center justify-center rounded-md border border-[#C9CDD6] bg-white px-3 py-2 font-medium text-[#2D2D31] transition hover:bg-[#F7F8FA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E]"
                        @click="editPerson(person)"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        class="inline-flex min-h-11 items-center justify-center rounded-md border border-[#F2A8A8] bg-white px-3 py-2 font-medium text-[#9F1D1D] transition hover:bg-[#FFF1F1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FD366E] disabled:cursor-not-allowed disabled:opacity-50"
                        :disabled="deletingId === person.$id"
                        @click="confirmDelete(person)"
                      >
                        {{ deletingId === person.$id ? 'Deleting...' : 'Delete' }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { PersonDocument, PersonPayload } from "~/composables/usePersons";

const {
  configurationError,
  createPerson,
  deletePerson,
  deletingId,
  error,
  listPersons,
  loading,
  persons,
  saving,
  success,
  updatePerson,
} = usePersons();

const emptyForm = (): PersonPayload => ({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  role: "",
  status: "active",
  notes: "",
});

const editingId = ref<string | null>(null);
const form = reactive<PersonPayload>(emptyForm());

onMounted(() => {
  listPersons();
});

async function submitPerson() {
  const payload = normalizePerson(form);

  if (editingId.value) {
    await updatePerson(editingId.value, payload);
  } else {
    await createPerson(payload);
  }

  if (!error.value) {
    resetForm();
  }
}

function editPerson(person: PersonDocument) {
  editingId.value = person.$id;
  Object.assign(form, {
    firstName: person.firstName,
    lastName: person.lastName,
    email: person.email,
    phone: person.phone,
    role: person.role,
    status: person.status,
    notes: person.notes,
  });
}

function resetForm() {
  editingId.value = null;
  Object.assign(form, emptyForm());
}

function confirmDelete(person: PersonDocument) {
  const fullName = `${person.firstName} ${person.lastName}`.trim();

  if (window.confirm(`Delete ${fullName || "this person"}? This cannot be undone.`)) {
    deletePerson(person.$id);
  }
}

function normalizePerson(person: PersonPayload): PersonPayload {
  return {
    firstName: person.firstName.trim(),
    lastName: person.lastName.trim(),
    email: person.email.trim(),
    phone: person.phone.trim(),
    role: person.role.trim(),
    status: person.status,
    notes: person.notes.trim(),
  };
}
</script>
