import { Title, Text, Paper, Stack } from "@mantine/core";

export default function SettingsPage() {
  return (
    <Stack gap="xl">
      <div>
        <Title order={3} mb={4}>Settings</Title>
        <Text size="sm" c="dimmed">System and user settings</Text>
      </div>
      <Paper p="xl" withBorder radius="lg" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        <Text c="dimmed">Settings overview — use the sidebar to open Users, Roles or Logs.</Text>
      </Paper>
    </Stack>
  );
}
