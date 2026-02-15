import { Box, Loader, Text, Stack } from "@mantine/core";

export default function PageLoader() {
  return (
    <Stack align="center" justify="center" py="xl" gap="md">
      <Loader size="md" />
      <Text size="sm" c="dimmed">
        Loading...
      </Text>
    </Stack>
  );
}

export function InlineLoader() {
  return (
    <Box py="xl" style={{ display: "flex", justifyContent: "center" }}>
      <Loader size="sm" />
    </Box>
  );
}
