import { defineManifest } from "@crxjs/vite-plugin";
import packageJson from "./package.json";

const manifestVersion = packageJson.version.split(/[+-]/)[0];

export default defineManifest({
  manifest_version: 3,
  name: "TUFExtension",
  description: "Chrome Extension for TUF",
  version: manifestVersion,
  version_name: packageJson.version,
  icons: {
    16: "icons/icon16.png",
    32: "icons/icon32.png",
    48: "icons/icon48.png",
    128: "icons/icon128.png"
  },
  action: {
    default_icon: {
      16: "icons/icon16.png",
      32: "icons/icon32.png",
      48: "icons/icon48.png",
      128: "icons/icon128.png"
    }
  },
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
  ],
  web_accessible_resources: [
    {
      matches: ["https://www.youtube.com/*", "https://www.bilibili.com/*"],
      resources: ["fonts/pretendard-variable.woff2"]
    }
  ]
});
