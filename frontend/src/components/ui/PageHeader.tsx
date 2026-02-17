import { Group, Title, Text, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function PageHeader({ title, subtitle, actionLabel, onAction }: PageHeaderProps) {
  return (
    <Group justify="space-between">
      <div>
        <Title order={3} mb={4} fw={700}>{title}</Title>
        {subtitle && <Text size="sm" c="dimmed" fw={500}>{subtitle}</Text>}
      </div>
      {actionLabel && onAction && (
        <Button leftSection={<IconPlus size={18} />} onClick={onAction} size="md" radius="md">
          {actionLabel}
        </Button>
      )}
    </Group>
  );
}
