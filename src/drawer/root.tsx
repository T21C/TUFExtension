import { useDrawerController } from "@features/drawer/use-drawer-controller";
import { LevelPage } from "./features/level-page/level-page";
import type { ResolvedTufContext } from "@domain/tuf/types";

interface DrawerRootProps {
  activeItemKey: string | null;
  emptyReason: string | null;
  isOpen: boolean;
  isPinned: boolean;
  isResolving: boolean;
  items: ResolvedTufContext[];
  onClose: () => void;
  onSelectItem: (itemKey: string) => void;
  onTogglePinned: () => void;
}

export function DrawerRoot(props: DrawerRootProps) {
  const drawer = useDrawerController(props);

  if (drawer.items.length === 0 && !drawer.isResolving && !drawer.emptyReason) {
    return null;
  }

  return <LevelPage {...drawer} />;
}
