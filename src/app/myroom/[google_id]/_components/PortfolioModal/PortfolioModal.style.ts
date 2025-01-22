const Style = {
  dialogContent: `
      [font-family:var(--font-noto-serif-kr),serif]
      bg-color-none
      bg-gradient-to-b 
      from-black/10
      to-black/70
      [backdrop-filter:blur(2px)]
      max-w-[40dvw]
      min-h-[35dvh]
      rounded-xl
      border-2
      border-[rgba(111,99,98,1)]
      !text-white
      flex-col
    `,

  modalTitle: `
    !mt-2dvh
    text-2xl
    text-fuchsia-600
    font-bold
  `,

  formContainer: `
    mt-4
    flex
    flex-col
    gap-4
    bg-[rgba(200,200,200,0.4)]
    rounded-xl
    border-2
    border-[rgba(111,99,98,1)]
    p-[1dvw]
  `,

  linkInput: `
    bg-[rgba(55,55,55,0.6)]
    file:cursor-pointer
    file:bg-transparent
    file:text-[rgba(171,159,158,1)]
    file:hover:bg-[rgba(155,155,155,0.2)]
  `,

  saveButton: `
    text-xl
    hover:bg-[rgba(50,50,50,1)]
  `,
};

export default Style;
