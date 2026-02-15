import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Title,
  Text,
  Paper,
  Table,
  Button,
  Modal,
  TextInput,
  Stack,
  Group,
  ActionIcon,
  Box,
  Loader,
  MultiSelect,
} from "@mantine/core";
import { IconPlus, IconEdit, IconTrash } from "@tabler/icons-react";
import { rolesApi } from "@services/api";
import { notifications } from "@mantine/notifications";
import { useHasPermission } from "@utils/hasPermission";
import { ROLE_CREATE, ROLE_UPDATE, ROLE_DELETE } from "@constants/permissions";

export default function RolesPage() {
  const queryClient = useQueryClient();
  const hasPermission = useHasPermission();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);

  const { data: rolesData, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await rolesApi.list({ pageSize: 200 });
      return (res.data.data ?? []) as { id: number; name: string }[];
    },
  });

  const { data: permissionsData } = useQuery({
    queryKey: ["roles-permissions"],
    queryFn: async () => {
      const res = await rolesApi.permissions();
      return (res.data.data ?? []) as string[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; permissions: string[] }) =>
      rolesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setModalOpen(false);
      resetForm();
      notifications.show({ title: "Created", message: "Role created.", color: "green" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { name: string; permissions: string[] } }) =>
      rolesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setModalOpen(false);
      setEditingId(null);
      resetForm();
      notifications.show({ title: "Updated", message: "Role updated.", color: "green" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      notifications.show({ title: "Deleted", message: "Role deleted.", color: "green" });
    },
  });

  const resetForm = () => {
    setName("");
    setPermissions([]);
  };

  const openCreate = () => {
    setEditingId(null);
    resetForm();
    setModalOpen(true);
  };

  const openEdit = async (id: number) => {
    const res = await rolesApi.get(id);
    const { role, permissions: perms } = res.data.data;
    setEditingId(id);
    setName(role.name);
    setPermissions(perms ?? []);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      notifications.show({ title: "Validation", message: "Name is required.", color: "red" });
      return;
    }
    const payload = { name: name.trim(), permissions };
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number, roleName: string) => {
    if (window.confirm(`Delete role "${roleName}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const roles = rolesData ?? [];
  const permOptions = (permissionsData ?? []).map((p) => ({ value: p, label: p }));

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={3} mb={4}>Roles</Title>
          <Text size="sm" c="dimmed">Manage roles and permissions</Text>
        </div>
        {hasPermission(ROLE_CREATE) && (
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
            New Role
          </Button>
        )}
      </Group>

      <Paper p="lg" withBorder radius="lg" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={2}>
                  <Box py="xl" style={{ display: "flex", justifyContent: "center" }}>
                    <Loader size="sm" />
                  </Box>
                </Table.Td>
              </Table.Tr>
            ) : roles.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={2}>
                  <Text py="md" c="dimmed" ta="center">No roles yet.</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              roles.map((r) => (
                <Table.Tr key={r.id}>
                  <Table.Td>{r.name}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {hasPermission(ROLE_UPDATE) && (
                        <ActionIcon variant="subtle" onClick={() => openEdit(r.id)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                      )}
                      {hasPermission(ROLE_DELETE) && (
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => handleDelete(r.id, r.name)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={modalOpen}
        onClose={() => { setModalOpen(false); setEditingId(null); resetForm(); }}
        title={editingId ? "Edit Role" : "New Role"}
        size="md"
      >
        <Stack>
          <TextInput
            label="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Role name"
          />
          <MultiSelect
            label="Permissions"
            placeholder="Select permissions"
            data={permOptions}
            value={permissions}
            onChange={setPermissions}
            searchable
            clearable
          />
          <Button onClick={handleSave} loading={createMutation.isPending || updateMutation.isPending}>
            {editingId ? "Update" : "Create"}
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
