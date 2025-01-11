const Style = {
  canvasContainerClass: `
    relative
    h-screen
    w-screen
    bg-overlay
    bg-blend-overlay
  `,
  absoluteCanvasClass: `
    absolute
    top-0
    left-0
    z-[1]
  `,

  furnitureContainerClass: `
    absolute
    w-[80px]
    h-[80px]
    text-center
    z-[3]
  `,

  furnitureTextClass: `
    text-white
    font-bold
    text-[14px]
    mt-[-10px]
  `,

  boardContainerClass: `
    absolute
    w-[300px]
    h-[200px]
    text-center
    z-[3]
    cursor-pointer
  `,

  bottomButtonsClass: `
    [font-family:var(--font-noto-serif-kr),serif]
    absolute
    bottom-[20px]
    right-[20px]
    flex
    flex-col
    rounded-xl
    border-2
    border-[rgba(111,99,98,1)]
    bg-gradient-to-b 
    from-black/50
    to-black/80 
    gap-[10px]
    z-[990]
    p-[2dvw]
    pt-[0.7dvw]
  `,

  bottomTitle: `
    text-fuchsia-600
    font-bold
    text-center
    text-2xl

  `,

  bottomButton: `
    text-xl
    p-[2dvw]
    bg-[rgba(55,55,55,0.6)]
    hover:bg-[rgba(155,155,155,0.6)]
    rounded-xl
    border-2
    border-[rgba(111,99,98,1)]
  `,
};

export default Style;
