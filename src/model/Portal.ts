export interface PortalInfo {
  x: number;
  y: number;
  width: number;
  height: number;
  route: string;
  name: string;
  image: string;
}

export interface PortalProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
}

export interface PortalListProps {
  portals: PortalInfo[];
}
