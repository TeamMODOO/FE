import characterImages from "../_component/CharacterArray";

export interface User {
  id: string;
  x: number;
  y: number;
  characterType: "character1" | "character2";
  nickname: string;
}
