"use client";

import { useEffect, useRef, useState } from "react";

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState({ player: 0, ai: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const paddleWidth = 10;
    const paddleHeight = 100;
    const ballSize = 15;
    const difficulty = "easy"; // 'easy', 'medium', 'hard'

    const aiSpeed = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 4;
    const reactionRange =
      difficulty === "easy" ? 100 : difficulty === "medium" ? 75 : 50;

    let playerY = canvas.height / 2 - paddleHeight / 2;
    let aiY = canvas.height / 2 - paddleHeight / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 10;
    let ballSpeedY = 10;

    const resetBall = () => {
      ballX = canvas.width / 2;
      ballY = canvas.height / 2;
      ballSpeedX *= -1;
      ballSpeedY = Math.random() > 0.5 ? 4 : -4;
    };

    const render = () => {
      context.fillStyle = "black";
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = "white";
      context.fillRect(10, playerY, paddleWidth, paddleHeight);
      context.fillRect(canvas.width - 20, aiY, paddleWidth, paddleHeight);
      context.fillRect(ballX, ballY, ballSize, ballSize);

      ballX += ballSpeedX;
      ballY += ballSpeedY;

      if (ballY <= 0 || ballY + ballSize >= canvas.height) {
        ballSpeedY *= -1;
      }

      if (
        ballX <= 20 &&
        ballY + ballSize >= playerY &&
        ballY <= playerY + paddleHeight
      ) {
        ballSpeedX *= -1;
      }
      if (
        ballX + ballSize >= canvas.width - 20 &&
        ballY + ballSize >= aiY &&
        ballY <= aiY + paddleHeight
      ) {
        ballSpeedX *= -1;
      }

      if (ballX <= 0) {
        setScore((prev) => ({ player: prev.player, ai: prev.ai + 1 }));
        resetBall();
      }
      if (ballX + ballSize >= canvas.width) {
        setScore((prev) => ({ player: prev.player + 1, ai: prev.ai }));
        resetBall();
      }

      if (Math.abs(ballY - (aiY + paddleHeight / 2)) > reactionRange) {
        aiY += ballY > aiY + paddleHeight / 2 ? aiSpeed : -aiSpeed;
      }

      requestAnimationFrame(render);
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      playerY = event.clientY - rect.top - paddleHeight / 2;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    render();

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="border-2 border-white bg-black"
      />
      <p className="mt-4">
        Player: {score.player} - AI: {score.ai}
      </p>
    </div>
  );
}
