import Game from "@/components/pingpong/Game";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="mb-4 text-4xl">Ping Pong Game</h1>
        <Game />
      </div>
    </main>
  );
}
