import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "TUFExtension",
  description: "Chrome Extension for TUF",
  version: "0.1.0",
  permissions: ["storage"],
  host_permissions: [
    "https://www.youtube.com/*",
    "https://i.ytimg.com/*",
    "https://www.bilibili.com/*",
    "https://tuforums.com/*",
    "https://*.tuforums.com/*"
  ],
  background: {
    service_worker: "src/entrypoints/background/index.ts",
    type: "module"
  },
  content_scripts: [
    {
      matches: ["https://www.youtube.com/*", "https://www.bilibili.com/*"],
      js: ["src/entrypoints/content/index.ts"],
      run_at: "document_idle"
    }
  ]
});
