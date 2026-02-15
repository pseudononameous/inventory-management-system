import { Flex, Stack, Text } from "@mantine/core";
import { IconDatabaseOff } from "@tabler/icons-react";

export default function NoRecordsFound() {
  return (
    <Flex mih={100} gap="md" justify="center" align="center" direction="column" wrap="wrap">
      <Stack align="center" py="xl">
        <IconDatabaseOff size={50} style={{ opacity: 0.5 }} />
        <Text size="lg" c="dimmed" fw={700}>
          No records found
        </Text>
      </Stack>
    </Flex>
  );
}
