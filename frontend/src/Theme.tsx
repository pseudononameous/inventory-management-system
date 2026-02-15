import { createTheme, Button, Modal } from "@mantine/core";
import type { MantineColorsTuple } from "@mantine/core";

const primary: MantineColorsTuple = [
  "#eef5fc",
  "#dbe6f2",
  "#b3cce7",
  "#88b0dd",
  "#6598d4",
  "#5089cf",
  "#4483ce",
  "#3570b7",
  "#2c64a3",
  "#1d5691",
];

const theme = createTheme({
  fontFamily: '"Onest", -apple-system, BlinkMacSystemFont, sans-serif',
  primaryColor: "primary",
  primaryShade: 8,
  headings: {
    fontFamily: '"Onest", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  defaultRadius: "md",
  colors: {
    primary,
  },
  components: {
    Button: Button.extend({
      defaultProps: { radius: "md" },
    }),
    Modal: Modal.extend({
      defaultProps: { centered: true },
    }),
  },
});

export default theme;
