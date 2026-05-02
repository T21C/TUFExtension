import {
  createContext,
  useEffect,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

interface SpoilerContextValue {
  isRevealed: boolean;
  reveal: () => void;
}

const SpoilerContext = createContext<SpoilerContextValue | null>(null);
const SpoilerControlsContext = createContext<{
  hideAllVersion: number;
  isProtectionDisabled: boolean;
  revealAllVersion: number;
} | null>(null);

export function SpoilerSection({ children }: { children: ReactNode }) {
  const spoilerControls = useContext(SpoilerControlsContext);
  const [isRevealed, setIsRevealed] = useState(false);
  const isProtectionDisabled = spoilerControls?.isProtectionDisabled ?? false;

  useEffect(() => {
    if ((spoilerControls?.revealAllVersion ?? 0) > 0) {
      setIsRevealed(true);
    }
  }, [spoilerControls?.revealAllVersion]);

  useEffect(() => {
    if ((spoilerControls?.hideAllVersion ?? 0) > 0) {
      setIsRevealed(false);
    }
  }, [spoilerControls?.hideAllVersion]);

  const value = useMemo(
    () => ({
      isRevealed: isProtectionDisabled || isRevealed,
      reveal: () => setIsRevealed(true),
    }),
    [isProtectionDisabled, isRevealed],
  );

  return (
    <SpoilerContext.Provider value={value}>{children}</SpoilerContext.Provider>
  );
}

export function SpoilerControlsProvider({
  children,
  hideAllVersion,
  isProtectionDisabled = false,
  revealAllVersion,
}: {
  children: ReactNode;
  hideAllVersion: number;
  isProtectionDisabled?: boolean;
  revealAllVersion: number;
}) {
  const value = useMemo(
    () => ({
      hideAllVersion,
      isProtectionDisabled,
      revealAllVersion,
    }),
    [hideAllVersion, isProtectionDisabled, revealAllVersion],
  );

  return (
    <SpoilerControlsContext.Provider value={value}>
      {children}
    </SpoilerControlsContext.Provider>
  );
}

interface SpoilerTextProps {
  as?: "div" | "h1" | "h2" | "p" | "span";
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  title?: string;
}

export function SpoilerText({
  as: Component = "span",
  children,
  className,
  style,
  title,
}: SpoilerTextProps) {
  const spoilerGroup = useContext(SpoilerContext);
  const spoilerControls = useContext(SpoilerControlsContext);
  const [isLocallyRevealed, setIsLocallyRevealed] = useState(false);
  const isProtectionDisabled = spoilerControls?.isProtectionDisabled ?? false;
  const isRevealed =
    isProtectionDisabled || (spoilerGroup?.isRevealed ?? isLocallyRevealed);
  const shouldTruncate = className?.split(/\s+/).includes("truncate") ?? false;
  const truncateStyle: CSSProperties | undefined = shouldTruncate
    ? {
        display: "block",
        maxWidth: "100%",
        minWidth: 0,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }
    : undefined;

  useEffect(() => {
    if (!spoilerGroup && (spoilerControls?.revealAllVersion ?? 0) > 0) {
      setIsLocallyRevealed(true);
    }
  }, [spoilerGroup, spoilerControls?.revealAllVersion]);

  useEffect(() => {
    if (!spoilerGroup && (spoilerControls?.hideAllVersion ?? 0) > 0) {
      setIsLocallyRevealed(false);
    }
  }, [spoilerGroup, spoilerControls?.hideAllVersion]);

  function reveal() {
    if (isProtectionDisabled) {
      return;
    }

    if (spoilerGroup) {
      spoilerGroup.reveal();
      return;
    }

    setIsLocallyRevealed(true);
  }

  if (isProtectionDisabled) {
    return (
      <Component
        className={className}
        style={{ ...truncateStyle, ...style }}
        title={title}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      className={[
        shouldTruncate
          ? "cursor-pointer rounded px-1.5 py-0.5 transition duration-200"
          : "inline-block cursor-pointer rounded px-1.5 py-0.5 transition duration-200",
        isRevealed
          ? "blur-0"
          : "select-none border border-white/15 bg-white/30 text-white/75 shadow-[0_0_16px_rgba(255,255,255,0.12)] backdrop-blur-md",
        className ?? "",
      ].join(" ")}
      onClick={(event) => {
        event.stopPropagation();
        reveal();
      }}
      role="button"
      style={{ ...truncateStyle, ...style }}
      tabIndex={0}
      title={title ?? "Click to reveal"}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          reveal();
        }
      }}
    >
      <span
        className={[
          shouldTruncate ? "block min-w-0 truncate" : "inline-block",
          isRevealed ? "" : "blur-sm",
        ].join(" ")}
        style={truncateStyle}
      >
        {children}
      </span>
    </Component>
  );
}
