import type { VideoReference } from "./types";

const YOUTUBE_HOSTS = new Set(["www.youtube.com", "youtube.com", "m.youtube.com"]);

export function getVideoReference(urlText = window.location.href): VideoReference | null {
  const url = new URL(urlText);

  if (YOUTUBE_HOSTS.has(url.hostname)) {
    return getYouTubeVideoReference(url);
  }

  if (url.hostname === "www.bilibili.com") {
    return getBilibiliVideoReference(url);
  }

  return null;
}

function getYouTubeVideoReference(url: URL): VideoReference | null {
  const videoId = url.searchParams.get("v");

  if (!videoId) {
    return null;
  }

  return {
    platform: "youtube",
    externalId: videoId,
    canonicalUrl: `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`
  };
}

function getBilibiliVideoReference(url: URL): VideoReference | null {
  const match = url.pathname.match(/\/video\/(BV[a-zA-Z0-9]+)/);

  if (!match) {
    return null;
  }

  const externalId = match[1];

  return {
    platform: "bilibili",
    externalId,
    canonicalUrl: `https://www.bilibili.com/video/${externalId}`
  };
}
