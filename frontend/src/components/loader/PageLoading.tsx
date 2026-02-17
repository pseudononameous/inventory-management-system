import { Loader, Center, Stack, Text } from "@mantine/core";

export default function PageLoading() {
  return (
    <Center h="100vh">
      <Stack align="center" gap="md">
        <Loader size="lg" type="dots" color="primary" />
        <Text size="sm" c="dimmed" fw={500}>Loading...</Text>
      </Stack>
    </Center>
  );
}
