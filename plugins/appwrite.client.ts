import { configureAppwrite } from "~/lib/appwrite";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  configureAppwrite(
    config.public.appwriteEndpoint,
    config.public.appwriteProjectId,
  );
});
