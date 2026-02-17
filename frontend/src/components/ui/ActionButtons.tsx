import { Group, ActionIcon } from "@mantine/core";
import { IconEdit, IconTrash, IconEye } from "@tabler/icons-react";
import { Link } from "react-router-dom";

interface ActionButtonsProps {
  viewTo?: string;
  viewTitle?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ActionButtons({ viewTo, viewTitle, onEdit, onDelete }: ActionButtonsProps) {
  return (
    <Group gap="xs">
      {viewTo && (
        <ActionIcon variant="subtle" component={Link} to={viewTo} title={viewTitle ?? "View"} radius="md">
          <IconEye size={16} />
        </ActionIcon>
      )}
      {onEdit && (
        <ActionIcon variant="subtle" onClick={onEdit} title="Edit" radius="md">
          <IconEdit size={16} />
        </ActionIcon>
      )}
      {onDelete && (
        <ActionIcon color="red" variant="subtle" onClick={onDelete} title="Delete" radius="md">
          <IconTrash size={16} />
        </ActionIcon>
      )}
    </Group>
  );
}
