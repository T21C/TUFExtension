import { Fragment } from "react";
import type {
  LeaderboardSortKey,
  LevelPass,
  SortDirection,
} from "~/domain/tuf/types";
import { formatInteger } from "~/drawer/shared/formatters";
import { LeaderboardRow } from "./leaderboard-row";
import { SORT_OPTIONS } from "./leaderboard-sort";
import {
  activeSurfaceClassName,
  glowDividerStyle,
  interactiveSurfaceClassName,
  panelSurfaceClassName,
} from "~/drawer/shared/level-surface";
import { t } from "~/platform/chrome/i18n";

export function LeaderboardPanel({
  isOpen,
  onSort,
  onToggle,
  passes,
  sortDirection,
  sortKey,
}: {
  isOpen: boolean;
  onSort: (key: LeaderboardSortKey) => void;
  onToggle: () => void;
  passes: LevelPass[];
  sortDirection: SortDirection;
  sortKey: LeaderboardSortKey;
}) {
  const contentId = "tuf-level-helper-leaderboard";

  return (
    <section className={panelSurfaceClassName}>
      <button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition hover:bg-black/20"
        onClick={onToggle}
        type="button"
      >
        <div className="min-w-0">
          <h2 className="text-lg font-bold leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)]">
            {t("leaderboard")}
          </h2>
          <p className="mt-1 truncate text-xs font-medium uppercase tracking-[0.08em] text-white/45">
            {t("clearsCount", formatInteger(passes.length))}
          </p>
        </div>
        <ChevronIcon
          className={[
            "h-4 w-4 shrink-0 text-white/70 transition-transform",
            isOpen ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {isOpen ? (
        <div className="px-3 pb-3 pt-3" id={contentId}>
          <div
            aria-hidden="true"
            className="mb-3 h-px"
            style={glowDividerStyle}
          />
          {passes.length > 0 ? (
            <>
              <div className="flex justify-start gap-2.5">
                {SORT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = option.key === sortKey;

                  return (
                    <button
                      aria-label={t("sortByLabel", option.label)}
                      aria-pressed={isActive}
                      className={[
                        "relative grid h-8 w-8 place-items-center rounded border text-white shadow-[0_0_12px_rgba(139,0,255,0.16)] backdrop-blur-md transition",
                        isActive
                          ? activeSurfaceClassName
                          : `${interactiveSurfaceClassName} text-white/65 hover:text-white`,
                      ].join(" ")}
                      key={option.key}
                      onClick={() => onSort(option.key)}
                      title={t("sortTitle", [
                        option.label,
                        sortDirection === "desc"
                          ? t("sortDescending")
                          : t("sortAscending"),
                      ])}
                      type="button"
                    >
                      <Icon size={15} />
                      {isActive ? (
                        <span className="absolute -right-1 -top-1.5 text-[10px] leading-none text-white/70">
                          {sortDirection === "desc" ? "↓" : "↑"}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex flex-col">
                {passes.map((pass, index) => (
                  <Fragment key={pass.id}>
                    {index > 0 ? (
                      <div
                        aria-hidden="true"
                        className="shrink-0 overflow-visible"
                        style={{ height: "2px", marginBottom: "24px" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            ...glowDividerStyle,
                          }}
                        />
                      </div>
                    ) : null}
                    <LeaderboardRow
                      index={index}
                      pass={pass}
                      sortKey={sortKey}
                    />
                  </Fragment>
                ))}
              </div>
            </>
          ) : (
            <p
              className={[
                "p-3 text-center text-sm font-medium text-white/65",
                interactiveSurfaceClassName,
              ].join(" ")}
            >
              {t("noClearsYet")}
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      />
    </svg>
  );
}
