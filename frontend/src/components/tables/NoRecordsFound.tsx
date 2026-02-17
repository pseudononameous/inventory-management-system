import { Flex, Stack, Text } from "@mantine/core";
import { IconDatabaseOff } from "@tabler/icons-react";

export default function NoRecordsFound() {
  return (
    <Flex mih={140} gap="md" justify="center" align="center" direction="column">
      <Stack align="center" py="xl">
        <IconDatabaseOff size={48} style={{ opacity: 0.4, color: "var(--mantine-color-gray-5)" }} />
        <Text size="md" c="dimmed" fw={600}>No records found</Text>
        <Text size="xs" c="dimmed">Try adjusting your filters or add a new record</Text>
      </Stack>
    </Flex>
  );
}
