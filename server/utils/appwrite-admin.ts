type AppwriteRequestOptions = {
  body?: Record<string, unknown>;
  expectedStatuses?: number[];
  method?: "GET" | "POST" | "PATCH" | "DELETE";
};

export type CreateTopicRequest = {
  name?: string;
  subscribe?: string[];
  topicId: string;
};

export type SendPushRequest = {
  body: string;
  data?: Record<string, string>;
  topicName?: string;
  topicId: string;
  title: string;
};

export type TopicSummary = {
  $id: string;
  name: string;
  subscribe: string[];
};

const idPattern = /^[A-Za-z0-9][A-Za-z0-9._-]{0,35}$/;

export function assertAdminRequest(event: Parameters<typeof getHeader>[0]) {
  const config = useRuntimeConfig();

  if (!config.adminApiToken) {
    throw createError({
      statusCode: 500,
      statusMessage: "Set ADMIN_API_TOKEN before enabling admin messaging endpoints.",
    });
  }

  const token = getHeader(event, "x-admin-token");

  if (token !== config.adminApiToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid admin token.",
    });
  }
}

export function normalizeTopicPayload(body: Partial<CreateTopicRequest>): CreateTopicRequest {
  const topicId = sanitizeId(body.topicId || "announcements", "topicId");
  const name = typeof body.name === "string" && body.name.trim() ? body.name.trim() : topicId;
  const subscribe = Array.isArray(body.subscribe) && body.subscribe.length
    ? body.subscribe.filter((role): role is string => typeof role === "string" && Boolean(role))
    : ["users"];

  return {
    name,
    subscribe,
    topicId,
  };
}

export function normalizePushPayload(body: Partial<SendPushRequest>): SendPushRequest {
  const topicId = sanitizeId(body.topicId || "announcements", "topicId");
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const messageBody = typeof body.body === "string" ? body.body.trim() : "";

  if (!title) {
    throw createError({
      statusCode: 400,
      statusMessage: "title is required.",
    });
  }

  if (!messageBody) {
    throw createError({
      statusCode: 400,
      statusMessage: "body is required.",
    });
  }

  return {
    body: messageBody,
    data: normalizeStringMap(body.data),
    topicName: typeof body.topicName === "string" ? body.topicName.trim() : undefined,
    topicId,
    title,
  };
}

export async function ensureTopic(payload: CreateTopicRequest) {
  const existing = await appwriteAdminRequest(`/messaging/topics/${payload.topicId}`, {
    expectedStatuses: [200, 404],
  });

  if (existing.status === 200) {
    return existing.data;
  }

  const created = await appwriteAdminRequest("/messaging/topics", {
    method: "POST",
    body: payload,
    expectedStatuses: [201],
  });

  return created.data;
}

export async function listTopics() {
  const response = await appwriteAdminRequest("/messaging/topics", {
    expectedStatuses: [200],
  });
  const topics = Array.isArray(response.data?.topics) ? response.data.topics : [];

  return topics.map((topic: Record<string, unknown>): TopicSummary => ({
    $id: String(topic.$id || ""),
    name: String(topic.name || topic.$id || ""),
    subscribe: Array.isArray(topic.subscribe)
      ? topic.subscribe.filter((role): role is string => typeof role === "string")
      : [],
  }));
}

export async function sendPushToTopic(payload: SendPushRequest) {
  await ensureTopic({
    name: payload.topicName || payload.topicId,
    subscribe: ["users"],
    topicId: payload.topicId,
  });

  const response = await appwriteAdminRequest("/messaging/messages/push", {
    method: "POST",
    body: {
      messageId: crypto.randomUUID(),
      title: payload.title,
      body: payload.body,
      topics: [payload.topicId],
      users: [],
      targets: [],
      data: payload.data || {},
      draft: false,
      priority: "high",
    },
    expectedStatuses: [201],
  });

  return response.data;
}

async function appwriteAdminRequest(path: string, options: AppwriteRequestOptions = {}) {
  const config = useRuntimeConfig();
  const endpoint = (config.public.appwriteEndpoint || "").replace(/\/$/, "");
  const projectId = config.public.appwriteProjectId;
  const apiKey = config.appwriteApiKey;

  if (!endpoint || !projectId || !apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: "Missing Appwrite endpoint, project ID, or API key.",
    });
  }

  const response = await fetch(`${endpoint}${path}`, {
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
    throw createError({
      statusCode: response.status,
      statusMessage: data?.message || response.statusText,
      data,
    });
  }

  return {
    data,
    status: response.status,
  };
}

function sanitizeId(value: string, label: string) {
  const trimmed = value.trim();

  if (!idPattern.test(trimmed)) {
    throw createError({
      statusCode: 400,
      statusMessage: `${label} must be 1-36 chars and use letters, numbers, period, hyphen, or underscore.`,
    });
  }

  return trimmed;
}

function normalizeStringMap(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
      .slice(0, 20),
  );
}
