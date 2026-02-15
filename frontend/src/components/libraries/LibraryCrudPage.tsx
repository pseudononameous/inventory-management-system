import { useState } from "react";
import {
  Title,
  Text,
  Button,
  Table,
  ActionIcon,
  Modal,
  TextInput,
  Stack,
  Group,
  Paper,
} from "@mantine/core";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useLibraryListQuery } from "@hooks/queries/libraries/useLibraryListQuery";
import { useLibraryMutation } from "@hooks/mutations/libraries/useLibraryMutation";
import type { LibraryRecord } from "@api/libraries";
import { libraryNameSchema } from "@schemas/library";

export type LibraryApi = {
  list: (params?: { name?: string; pageSize?: number }) => Promise<{ data: { data: LibraryRecord[] } }>;
  create: (payload: { name: string }) => Promise<unknown>;
  update: (id: number, payload: { name: string }) => Promise<unknown>;
  delete: (id: number) => Promise<unknown>;
};

interface LibraryCrudPageProps {
  title: string;
  api: LibraryApi;
  queryKey: string;
}

export default function LibraryCrudPage({ title, api, queryKey }: LibraryCrudPageProps) {
  const [opened, setOpened] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");

  const { data = [], isLoading } = useLibraryListQuery(queryKey, api, { pageSize: 100 });
  const { create, update, remove } = useLibraryMutation(queryKey, api, title);

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setOpened(true);
  };

  const openEdit = (row: LibraryRecord) => {
    setEditingId(row.id);
    setName(row.name);
    setOpened(true);
  };

  const handleSave = () => {
    const parsed = libraryNameSchema.safeParse({ name: name.trim() });
    if (!parsed.success) {
      notifications.show({ title: "Validation", message: parsed.error.issues[0]?.message ?? "Name is required", color: "red" });
      return;
    }
    if (editingId !== null) {
      update.mutate(
        { id: editingId, name: parsed.data.name },
        { onSettled: () => { setOpened(false); setEditingId(null); setName(""); } }
      );
    } else {
      create.mutate(
        { name: parsed.data.name },
        { onSettled: () => { setOpened(false); setName(""); } }
      );
    }
  };

  const rows = data as LibraryRecord[];

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={3} mb={4}>{title}</Title>
          <Text size="sm" c="dimmed">Manage {title.toLowerCase()} records</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate} size="md">
          Add {title.slice(0, -1)}
        </Button>
      </Group>

      <Paper p="lg" withBorder radius="lg" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading
              ? null
              : rows.map((row) => (
                <Table.Tr key={row.id}>
                  <Table.Td>{row.id}</Table.Td>
                  <Table.Td>{row.name}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="subtle" onClick={() => openEdit(row)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon color="red" variant="subtle" onClick={() => remove.mutate(row.id)}>
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={opened}
        onClose={() => { setOpened(false); setEditingId(null); setName(""); }}
        title={editingId ? `Edit ${title.slice(0, -1)}` : `New ${title.slice(0, -1)}`}
        radius="lg"
      >
        <Stack>
          <TextInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`e.g. ${title.slice(0, -1)} name`}
          />
          <Button onClick={handleSave} loading={create.isPending || update.isPending}>
            {editingId ? "Update" : "Create"}
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
