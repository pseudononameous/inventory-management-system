import { Title, Text, Paper, Stack } from "@mantine/core";

export default function ReportsPage() {
  return (
    <Stack gap="xl">
      <div>
        <Title order={3} mb={4}>Reports</Title>
        <Text size="sm" c="dimmed">Physical inventories, RSMI and other reports</Text>
      </div>
      <Paper p="xl" withBorder radius="lg" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        <Text c="dimmed">Reports module — coming soon.</Text>
      </Paper>
    </Stack>
  );
}
