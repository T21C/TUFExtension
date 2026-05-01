import { useDrawerController } from "@features/drawer/use-drawer-controller";
import { LevelPage } from "./features/level-page/level-page";
import type { ResolvedLevelContext } from "@domain/tuf/types";

interface DrawerRootProps {
  activeLevelId: string;
  isOpen: boolean;
  levels: ResolvedLevelContext[];
  onClose: () => void;
  onSelectLevel: (levelId: string) => void;
}

export function DrawerRoot(props: DrawerRootProps) {
  const drawer = useDrawerController(props);

  if (drawer.levels.length === 0) {
    return null;
  }

  return <LevelPage {...drawer} />;
}
