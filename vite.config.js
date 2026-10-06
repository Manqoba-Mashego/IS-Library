import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, "index.html"),
                dashboard: resolve(__dirname, "dashboard.html"),
                checkout: resolve(__dirname, "check-out.html"),
                checkin: resolve(__dirname, "check-in.html")
            }
        }
    }
});