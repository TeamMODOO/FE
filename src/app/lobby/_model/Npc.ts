export interface NpcInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  image: string;
  modalTitle: string;
}
export interface NpcListProps {
  npcs: NpcInfo[];
}
