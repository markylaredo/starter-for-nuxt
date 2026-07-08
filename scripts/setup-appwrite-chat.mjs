import { readFileSync } from "node:fs";

const env = loadEnv();

const endpoint = requiredEnv("NUXT_PUBLIC_APPWRITE_ENDPOINT");
const projectId = requiredEnv("NUXT_PUBLIC_APPWRITE_PROJECT_ID");
const apiKey = requiredEnv("APPWRITE_API_KEY");
const databaseId = requiredEnv("NUXT_PUBLIC_APPWRITE_DATABASE_ID");
const collectionId = env.NUXT_PUBLIC_APPWRITE_CHAT_COLLECTION_ID || "chats";

const apiVersion = endpoint.replace(/\/$/, "");

const permissions = [
  'read("any")',
  'create("any")',
  'update("any")',
  'delete("any")',
];

await ensureDatabase();
await ensureCollection();
await ensureAttribute("string", {
  key: "senderName",
  size: 128,
  required: true,
});
await ensureAttribute("string", {
  key: "message",
  size: 4096,
  required: true,
});
await ensureAttribute("string", {
  key: "roomId",
  size: 128,
  required: true,
});

console.log("Appwrite realtime chat setup complete.");
console.log(`Database: ${databaseId}`);
console.log(`Collection: ${collectionId}`);

async function ensureDatabase() {
  const existing = await appwriteRequest(`/databases/${databaseId}`, {
    expectedStatuses: [200, 404],
  });

  if (existing.status === 200) {
    console.log(`Database exists: ${databaseId}`);
    return;
  }

  await appwriteRequest("/databases", {
    method: "POST",
    body: {
      databaseId,
      name: databaseId,
      enabled: true,
    },
    expectedStatuses: [201],
  });

  console.log(`Database created: ${databaseId}`);
}

async function ensureCollection() {
  const existing = await appwriteRequest(
    `/databases/${databaseId}/collections/${collectionId}`,
    {
      expectedStatuses: [200, 404],
    },
  );

  if (existing.status === 200) {
    await appwriteRequest(`/databases/${databaseId}/collections/${collectionId}`, {
      method: "PUT",
      body: {
        name: existing.data.name || "Chats",
        permissions,
        documentSecurity: false,
        enabled: true,
      },
      expectedStatuses: [200],
    });

    console.log(`Collection exists: ${collectionId}`);
    console.log(`Collection permissions updated: ${collectionId}`);
    return;
  }

  await appwriteRequest(`/databases/${databaseId}/collections`, {
    method: "POST",
    body: {
      collectionId,
      name: "Chats",
      permissions,
      documentSecurity: false,
      enabled: true,
    },
    expectedStatuses: [201],
  });

  console.log(`Collection created: ${collectionId}`);
}

async function ensureAttribute(type, payload) {
  const existing = await appwriteRequest(
    `/databases/${databaseId}/collections/${collectionId}/attributes/${payload.key}`,
    {
      expectedStatuses: [200, 404],
    },
  );

  if (existing.status === 200) {
    console.log(`Attribute exists: ${payload.key}`);
    return;
  }

  await appwriteRequest(
    `/databases/${databaseId}/collections/${collectionId}/attributes/${type}`,
    {
      method: "POST",
      body: {
        array: false,
        ...payload,
      },
      expectedStatuses: [201, 202],
    },
  );

  console.log(`Attribute created: ${payload.key}`);
}

async function appwriteRequest(path, options = {}) {
  const response = await fetch(`${apiVersion}${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      "X-Appwrite-Project": projectId,
      "X-Appwrite-Key": apiKey,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  const expectedStatuses = options.expectedStatuses || [200];

  if (!expectedStatuses.includes(response.status)) {
    const message = data?.message || response.statusText;
    throw new Error(`${options.method || "GET"} ${path} failed: ${response.status} ${message}`);
  }

  return {
    data,
    status: response.status,
  };
}

function requiredEnv(key) {
  const value = env[key];

  if (!value) {
    throw new Error(`Missing ${key} in .env`);
  }

  return value;
}

function loadEnv() {
  const contents = readFileSync(".env", "utf8");
  const values = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");
    values[key] = value;
  }

  return values;
}
