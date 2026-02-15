import { Title, Text, Paper, Stack } from "@mantine/core";

export default function MyProfilePage() {
  return (
    <Stack gap="xl">
      <div>
        <Title order={3} mb={4}>My Profile</Title>
        <Text size="sm" c="dimmed">View and edit your profile</Text>
      </div>
      <Paper p="xl" withBorder radius="lg" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        <Text c="dimmed">Profile — coming soon.</Text>
      </Paper>
    </Stack>
  );
}
