import { Account, Client, Databases, Messaging } from "appwrite";

const client = new Client()
  .setEndpoint("https://appwrite.solodevmark.com/v1")
  .setProject("6a4dec3400238e56bc5d");

const account = new Account(client);
const databases = new Databases(client);
const messaging = new Messaging(client);

export { account, client, databases, messaging };
