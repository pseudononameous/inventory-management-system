import { createTheme, Button, Modal, Paper, Table, TextInput, Select, ActionIcon, Badge, Loader, Pagination } from "@mantine/core";
import type { MantineColorsTuple } from "@mantine/core";

const primary: MantineColorsTuple = [
  "#f0f4ff",
  "#e0e7ff",
  "#c7d2fe",
  "#a5b4fc",
  "#818cf8",
  "#6366f1",
  "#4f46e5",
  "#4338ca",
  "#3730a3",
  "#312e81",
];

const theme = createTheme({
  fontFamily: '"Onest", -apple-system, BlinkMacSystemFont, sans-serif',
  primaryColor: "primary",
  primaryShade: 6,
  defaultRadius: "lg",
  radius: { xs: "6px", sm: "8px", md: "12px", lg: "14px", xl: "18px" },
  shadows: {
    xs: "0 1px 2px rgba(0,0,0,.04)",
    sm: "0 2px 8px rgba(0,0,0,.06)",
    md: "0 4px 16px rgba(0,0,0,.08)",
    lg: "0 8px 32px rgba(0,0,0,.1)",
    xl: "0 16px 48px rgba(0,0,0,.12)",
  },
  colors: { primary },
  headings: { fontFamily: '"Onest", -apple-system, BlinkMacSystemFont, sans-serif' },
  components: {
    Button: Button.extend({
      defaultProps: { radius: "md", fw: 500 },
      styles: {
        root: { transition: "all 0.2s ease" },
      },
    }),
    Modal: Modal.extend({
      defaultProps: { centered: true, radius: "lg", padding: "xl" },
      styles: {
        overlay: {
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(0,0,0,.4)",
        },
        content: {
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 16px 48px rgba(0,0,0,.2)",
          border: "1px solid var(--mantine-color-gray-2)",
        },
        header: {
          padding: "var(--mantine-spacing-lg) var(--mantine-spacing-xl)",
          backgroundColor: "#FFF8EB",
          borderBottom: "1px solid rgba(0,0,0,.08)",
          margin: 0,
          width: "100%",
          boxSizing: "border-box",
        },
        title: { fontWeight: 700, fontSize: "var(--mantine-font-size-lg)", color: "#1e293b" },
        close: { color: "var(--mantine-color-gray-6)" },
        body: { padding: "var(--mantine-spacing-xl)", backgroundColor: "#fff" },
      },
    }),
    Paper: Paper.extend({
      defaultProps: { radius: "lg", shadow: "sm", p: "lg" },
      styles: {
        root: {
          transition: "box-shadow 0.2s ease",
          border: "1px solid var(--mantine-color-gray-2)",
        },
      },
    }),
    Table: Table.extend({
      defaultProps: { striped: true, highlightOnHover: true, withTableBorder: true },
    }),
    TextInput: TextInput.extend({
      defaultProps: { radius: "md" },
    }),
    Select: Select.extend({
      defaultProps: { radius: "md" },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: { radius: "md" },
      styles: { root: { transition: "all 0.15s ease" } },
    }),
    Badge: Badge.extend({
      defaultProps: { radius: "sm", fw: 500 },
    }),
    Loader: Loader.extend({
      defaultProps: { type: "dots" },
    }),
    Pagination: Pagination.extend({
      defaultProps: { radius: "md", size: "sm" },
    }),
  },
});

export default theme;
