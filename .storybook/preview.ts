import type { Preview } from "@storybook/react";
import "../src/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      values: [
        {
          name: "gray",
          value: "#ccc",
        },
      ],
      default: "gray",
    },
  },
};

export default preview;
