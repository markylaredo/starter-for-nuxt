import tailwindcss from "@tailwindcss/vite";
import type { PluginOption } from "vite";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      appwriteEndpoint: process.env.NUXT_PUBLIC_APPWRITE_ENDPOINT,
      appwriteProjectId: process.env.NUXT_PUBLIC_APPWRITE_PROJECT_ID,
      appwriteProjectName: process.env.NUXT_PUBLIC_APPWRITE_PROJECT_NAME,
      appwriteDatabaseId: process.env.NUXT_PUBLIC_APPWRITE_DATABASE_ID,
      appwritePersonCollectionId: process.env.NUXT_PUBLIC_APPWRITE_PERSON_COLLECTION_ID,
      appwriteChatCollectionId: process.env.NUXT_PUBLIC_APPWRITE_CHAT_COLLECTION_ID || "chats",
      appwritePushProviderId:
        process.env.NUXT_PUBLIC_APPWRITE_PUSH_PROVIDER_ID || "6a4e0c49003d44484602",
    },
  },
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  experimental: {
    appManifest: false,
  },
  css: [
    '@/assets/app.css',
    '@appwrite.io/pink-icons',
  ],
  app: {
    head: {
      meta: [
        { charset: "UTF-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" }
      ],
      bodyAttrs: {
        class: 'bg-[#FAFAFB] font-[Inter] text-sm text-[#56565C]',
      },
      title: 'Appwrite + Nuxt',
      htmlAttrs: {
        lang: 'en',
      },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/appwrite.svg' },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Fira+Code&family=Inter:opsz,wght@14..32,100..900&family=Poppins:wght@300;400&display=swap"
        },
      ]
    },
  },
  vite: {
    plugins: [
      tailwindcss() as unknown as PluginOption,
    ],
  },
})
