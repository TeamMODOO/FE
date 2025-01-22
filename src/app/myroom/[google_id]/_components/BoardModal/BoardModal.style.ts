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
  commentListContainer: `
      bg-[rgba(55,55,55,0.6)]
      mt-4
      max-h-[300px]
      overflow-y-auto
      border
      p-2
      rounded-xl
    `,
  singleCommentContainer: `
      mb-4
    `,
  commentName: `
      font-bold
      text-[rgba(161,149,148,1)]
    `,
  commentMessage: `
      text-white
    `,
  formContainer: `
      rounded-xl
      mt-4
      flex
      flex-col
      gap-2
      border
      p-5
      bg-[rgba(55,55,55,0.6)]
    `,
  isSecret: `
    flex
    flex-row
    gap-2
  `,
  submitButton: `
      mt-2
      text-xl
    `,
};

export default Style;
