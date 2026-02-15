import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

type LibraryApi = {
  list: (params?: { name?: string; pageSize?: number }) => Promise<{
    data: { data: { id: number; name: string }[] };
  }>;
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
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [queryKey],
    queryFn: async () => {
      const res = await api.list({ pageSize: 100 });
      return (res.data.data ?? []) as { id: number; name: string }[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string }) => api.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setOpened(false);
      setName("");
      notifications.show({ title: "Created", message: `${title.slice(0, -1)} created.`, color: "green" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name: n }: { id: number; name: string }) => api.update(id, { name: n }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      setEditingId(null);
      setName("");
      setOpened(false);
      notifications.show({ title: "Updated", message: `${title.slice(0, -1)} updated.`, color: "green" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      notifications.show({ title: "Deleted", message: `${title.slice(0, -1)} deleted.`, color: "green" });
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setOpened(true);
  };

  const openEdit = (row: { id: number; name: string }) => {
    setEditingId(row.id);
    setName(row.name);
    setOpened(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, name: name.trim() });
    } else {
      createMutation.mutate({ name: name.trim() });
    }
  };

  const rows = (data ?? []) as { id: number; name: string }[];

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
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => deleteMutation.mutate(row.id)}
                      >
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
        onClose={() => {
          setOpened(false);
          setEditingId(null);
          setName("");
        }}
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
          <Button
            onClick={handleSave}
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {editingId ? "Update" : "Create"}
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
