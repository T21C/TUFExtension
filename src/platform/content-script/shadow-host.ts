import tailwindCss from "../../styles/tailwind.css?inline";

const PRETENDARD_FONT_URL_TOKEN = "__TUF_PRETENDARD_FONT_URL__";

interface ShadowHostOptions {
  hostId: string;
  onHostCreate?: (host: HTMLElement) => void;
  onMountNodeCreate?: (mountNode: HTMLElement) => void;
}

export interface ShadowHostMount {
  host: HTMLElement;
  mountNode: HTMLElement;
}

export function ensureShadowHost({
  hostId,
  onHostCreate,
  onMountNodeCreate,
}: ShadowHostOptions): ShadowHostMount {
  const existingHost = document.getElementById(hostId);
  const existingMountNode =
    existingHost?.shadowRoot?.querySelector<HTMLElement>(
      "[data-tuf-shadow-mount]",
    );

  if (existingHost && existingMountNode) {
    return {
      host: existingHost,
      mountNode: existingMountNode,
    };
  }

  const host = document.createElement("div");
  host.id = hostId;
  onHostCreate?.(host);

  const shadowRoot = host.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = getShadowCss();

  const mountNode = document.createElement("div");
  mountNode.dataset.tufShadowMount = "true";
  onMountNodeCreate?.(mountNode);

  shadowRoot.append(style, mountNode);
  document.body.append(host);

  return { host, mountNode };
}

function getShadowCss(): string {
  return tailwindCss.replaceAll(
    PRETENDARD_FONT_URL_TOKEN,
    chrome.runtime.getURL("fonts/pretendard-variable.woff2"),
  );
}
