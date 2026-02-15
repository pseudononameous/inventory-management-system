import { Title, Text, Paper, Stack } from "@mantine/core";

export default function ChangePasswordPage() {
  return (
    <Stack gap="xl">
      <div>
        <Title order={3} mb={4}>Change Password</Title>
        <Text size="sm" c="dimmed">Update your password</Text>
      </div>
      <Paper p="xl" withBorder radius="lg" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        <Text c="dimmed">Change password — coming soon.</Text>
      </Paper>
    </Stack>
  );
}
