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
    absolute
    bottom-[20px]
    right-[20px]
    flex
    flex-col
    gap-[10px]
    z-[3]
  `,
};

export default Style;
