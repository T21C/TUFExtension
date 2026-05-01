import { useDrawerController } from "@features/drawer/use-drawer-controller";
import { LevelPage } from "./features/level-page/level-page";
import type { ResolvedTufContext } from "@domain/tuf/types";

interface DrawerRootProps {
  activeItemKey: string;
  isOpen: boolean;
  items: ResolvedTufContext[];
  onClose: () => void;
  onSelectItem: (itemKey: string) => void;
}

export function DrawerRoot(props: DrawerRootProps) {
  const drawer = useDrawerController(props);

  if (drawer.items.length === 0) {
    return null;
  }

  return <LevelPage {...drawer} />;
}
