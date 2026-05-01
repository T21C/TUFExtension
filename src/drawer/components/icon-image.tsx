interface IconImageProps {
  alt?: string;
  isActive: boolean;
  src: string;
}

export function IconImage({ alt = "", isActive, src }: IconImageProps) {
  return (
    <img
      alt={alt}
      className={[
        "h-8 w-8 min-h-8 min-w-8 shrink-0 object-contain transition-opacity",
        isActive ? "opacity-100" : "opacity-35 group-hover:opacity-75",
      ].join(" ")}
      decoding="async"
      src={src}
    />
  );
}
