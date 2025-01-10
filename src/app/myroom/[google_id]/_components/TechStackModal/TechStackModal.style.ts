const Style = {
  dialogContent: `
    [font-family:var(--font-noto-serif-kr),serif]
    bg-color-none
    bg-gradient-to-b 
    from-black/10
    to-black/70
    [backdrop-filter:blur(2px)]
    max-w-[40dvw]
    min-h-[30dvh]
    rounded-xl
    border-2
    border-[rgba(111,99,98,1)]
    !text-white
  `,

  modalTitle: `
    text-2xl
    text-fuchsia-600
    font-bold
  `,

  searchInput: `
    pl-[2.2dvw]
    bg-[rgba(55,55,55,0.6)]
    file:cursor-pointer
    file:bg-transparent
    file:text-[rgba(171,159,158,1)]
    file:hover:bg-[rgba(155,155,155,0.2)]
  `,

  chosenFile: `
    !text-[rgba(65,240,185,1)]
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

  warningMent: `
    text-lg
    text-white
  `,

  stackButton: `
    text-xl
    h-8 text-muted-foreground
    bg-[rgba(200,200,200,0.4)]
    active:bg-[rgba(65,240,185,0.6)]
    rounded-lg
    hover:bg-[rgba(255,255,255,0.8)]
    text-white
  `,

  buttonSection: `
    flex
    flex-wrap
    gap-2
  `,

  saveButton: `
    text-xl
    p-[1dvw]
    bg-[rgba(55,55,55,0.6)]
    hover:bg-[rgba(155,155,155,0.6)]
    rounded-xl
    border-2
    border-[rgba(111,99,98,1)]
  `,
};

export default Style;
