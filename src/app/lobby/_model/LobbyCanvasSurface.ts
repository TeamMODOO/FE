import { User } from "./User";

export interface LobbyCanvasSurfaceProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  renderCanvas: (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ) => void;
  users: User[]; // 혹은 필요 없다면 제거
}
