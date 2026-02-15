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
import { unitsApi } from "@services/api";
import { notifications } from "@mantine/notifications";

interface Unit {
  id: number;
  name: string;
}

export default function UnitsPage() {
  const [opened, setOpened] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const res = await unitsApi.list({ pageSize: 100 });
      return (res.data.data ?? []) as Unit[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string }) => unitsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      setOpened(false);
      setName("");
      notifications.show({ title: "Created", message: "Unit created.", color: "green" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => unitsApi.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      setEditingId(null);
      setName("");
      notifications.show({ title: "Updated", message: "Unit updated.", color: "green" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => unitsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      notifications.show({ title: "Deleted", message: "Unit deleted.", color: "green" });
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setName("");
    setOpened(true);
  };

  const openEdit = (u: Unit) => {
    setEditingId(u.id);
    setName(u.name);
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

  const units = (data ?? []) as Unit[];

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={3} mb={4}>Units</Title>
          <Text size="sm" c="dimmed">Manage unit of measure records</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate} size="md">
          Add Unit
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
              : units.map((u) => (
                <Table.Tr key={u.id}>
                  <Table.Td>{u.id}</Table.Td>
                  <Table.Td>{u.name}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="subtle" onClick={() => openEdit(u)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => deleteMutation.mutate(u.id)}
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

      <Modal opened={opened} onClose={() => setOpened(false)} title={editingId ? "Edit Unit" : "New Unit"} radius="lg">
        <Stack>
          <TextInput
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Box"
          />
          <Button onClick={handleSave} loading={createMutation.isPending || updateMutation.isPending}>
            {editingId ? "Update" : "Create"}
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
