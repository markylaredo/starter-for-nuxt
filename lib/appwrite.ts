import { Account, Client, Databases, Messaging } from "appwrite";

const client = new Client();
let configuredEndpoint = "";
let configuredProjectId = "";

export function configureAppwrite(endpoint?: string, projectId?: string) {
  const normalizedEndpoint = endpoint?.trim() || "";
  const normalizedProjectId = projectId?.trim() || "";

  if (!normalizedEndpoint || !normalizedProjectId || !isValidUrl(normalizedEndpoint)) {
    return false;
  }

  if (
    configuredEndpoint === normalizedEndpoint &&
    configuredProjectId === normalizedProjectId
  ) {
    return true;
  }

  client.setEndpoint(normalizedEndpoint).setProject(normalizedProjectId);
  configuredEndpoint = normalizedEndpoint;
  configuredProjectId = normalizedProjectId;

  return true;
}

export function isAppwriteConfigured() {
  return Boolean(configuredEndpoint && configuredProjectId);
}

const account = new Account(client);
const databases = new Databases(client);
const messaging = new Messaging(client);

export { account, client, databases, messaging };

function isValidUrl(value: string) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
