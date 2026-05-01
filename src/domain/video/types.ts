export type VideoPlatform = "youtube" | "bilibili";

export interface VideoReference {
  platform: VideoPlatform;
  externalId: string;
  canonicalUrl: string;
}
