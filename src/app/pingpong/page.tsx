import { BgMusicButton } from "@/components/bgMusic/BgMusicButton";
import { BgMusicGlobal } from "@/components/bgMusic/BgMusicGlobal";
import { OutButton } from "@/components/outButton/OutButton";
import Game from "@/components/pingpong/Game";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <BgMusicGlobal src="" />
      <BgMusicButton />
      <OutButton />
      <div className="text-center">
        <h1 className="mb-4 text-4xl">Ping Pong Game</h1>
        <Game />
      </div>
    </main>
  );
}
