import { defineConfig } from "wxt";
import packageJson from "./package.json";
import tailwindcss from "@tailwindcss/vite";

const manifestVersion = packageJson.version.split(/[+-]/)[0];

// See https://wxt.dev/api/config.html
export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  vite: () => ({
    plugins: [tailwindcss()],
  }),
  manifest: {
    name: "TUFExtension",
    description: "A browser extension for The Universal Forums.",
    version: manifestVersion,
    version_name: packageJson.version,
    icons: {
      16: "icons/icon16.png",
      32: "icons/icon32.png",
      48: "icons/icon48.png",
      128: "icons/icon128.png",
    },
    action: {
      default_icon: {
        16: "icons/icon16.png",
        32: "icons/icon32.png",
        48: "icons/icon48.png",
        128: "icons/icon128.png",
      },
    },
    permissions: ["storage"],
    host_permissions: [
      "https://www.youtube.com/*",
      "https://i.ytimg.com/*",
      "https://www.bilibili.com/*",
      "https://tuforums.com/*",
      "https://*.tuforums.com/*",
    ],
  },
});
