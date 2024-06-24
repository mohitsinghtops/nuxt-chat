// https://nuxt.com/docs/api/configuration/nuxt-config
import path from "path";

export default defineNuxtConfig({
    devtools: { enabled: true },
    alias: {
        "@": path.resolve(__dirname),
    },

    ssr: false,

    app: {
        head: {
            link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.png" }],
        },
    },

    css: ["~/assets/css/main.scss"],

    runtimeConfig: {
        public: {
            FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
            FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
            FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
            FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
            FIREBASE_SENDER_ID: process.env.FIREBASE_SENDER_ID,
            FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
            FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID
        },
    },

    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },

    modules: [
        '@pinia/nuxt',
    ],

})
