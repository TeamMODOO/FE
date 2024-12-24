export interface NpcInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  image: string;
  modalTitle: string;
  name: string;
}
export interface NpcListProps {
  npcs: NpcInfo[];
}
