import { Box, Title, Text, Button, Stack } from "@mantine/core";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <Box py="xl" style={{ textAlign: "center" }}>
      <Stack align="center" gap="md">
        <Title order={1} c="dimmed">404</Title>
        <Text size="lg" c="dimmed">Page not found</Text>
        <Button component={Link} to="/dashboard" variant="light">
          Back to Dashboard
        </Button>
      </Stack>
    </Box>
  );
}
