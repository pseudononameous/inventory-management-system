import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import {
  Title,
  Text,
  Paper,
  Table,
  Button,
  Modal,
  TextInput,
  PasswordInput,
  Stack,
  Group,
  Select,
  ActionIcon,
  Box,
  Loader,
  Pagination,
} from "@mantine/core";
import { IconUserPlus, IconUserEdit, IconTrash } from "@tabler/icons-react";
import { FilterInput, FilterSelect } from "@components/filters";
import type { SelectOptionType } from "@components/filters";
import NoRecordsFound from "@components/tables/NoRecordsFound";
import { usersApi, rolesApi, type User } from "@services/api";
import { notifications } from "@mantine/notifications";

const PAGE_SIZE = 10;

export default function UsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState<string | null>(null);
  const [debouncedName] = useDebouncedValue(name, 300);
  const [debouncedEmail] = useDebouncedValue(email, 300);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role_id: null as number | null,
  });

  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await rolesApi.list({ pageSize: 200 });
      return (res.data.data ?? []) as { id: number; name: string }[];
    },
  });

  const roles: SelectOptionType[] = (rolesData ?? []).map((r) => ({
    value: String(r.id),
    label: r.name,
  }));

  const { data: listResponse, isLoading } = useQuery({
    queryKey: ["users", page, debouncedName, debouncedEmail, roleId],
    queryFn: async () => {
      const res = await usersApi.list({
        page,
        pageSize: PAGE_SIZE,
        name: debouncedName || undefined,
        email: debouncedEmail || undefined,
        role_id: roleId ? Number(roleId) : undefined,
        sort: "name",
        order: "asc",
      });
      return {
        data: (res.data.data ?? []) as User[],
        meta: res.data.meta as { current_page: number; last_page: number; per_page: number; total: number } | undefined,
      };
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof form) =>
      usersApi.create({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        password_confirmation: payload.password_confirmation,
        role_id: payload.role_id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setAddModalOpen(false);
      resetForm();
      notifications.show({ title: "Created", message: "User created.", color: "green" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<typeof form> }) =>
      usersApi.update(id, {
        name: payload.name,
        email: payload.email,
        password: payload.password || undefined,
        password_confirmation: payload.password_confirmation || undefined,
        role_id: payload.role_id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditUser(null);
      resetForm();
      notifications.show({ title: "Updated", message: "User updated.", color: "green" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      notifications.show({ title: "Deleted", message: "User deleted.", color: "green" });
    },
  });

  function resetForm() {
    setForm({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role_id: null,
    });
  }

  const users = listResponse?.data ?? [];
  const meta = listResponse?.meta;
  const totalPages = meta?.last_page ?? 1;

  const openAdd = () => {
    resetForm();
    setEditUser(null);
    setAddModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      password_confirmation: "",
      role_id: u.role_id ?? null,
    });
    setAddModalOpen(false);
  };

  const handleCreate = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      notifications.show({ title: "Validation", message: "Name, email and password are required.", color: "red" });
      return;
    }
    if (form.password !== form.password_confirmation) {
      notifications.show({ title: "Validation", message: "Passwords do not match.", color: "red" });
      return;
    }
    createMutation.mutate(form);
  };

  const handleUpdate = () => {
    if (!editUser || !form.name.trim() || !form.email.trim()) {
      notifications.show({ title: "Validation", message: "Name and email are required.", color: "red" });
      return;
    }
    if (form.password && form.password !== form.password_confirmation) {
      notifications.show({ title: "Validation", message: "Passwords do not match.", color: "red" });
      return;
    }
    updateMutation.mutate({
      id: editUser.id,
      payload: {
        name: form.name,
        email: form.email,
        password: form.password || undefined,
        password_confirmation: form.password_confirmation || undefined,
        role_id: form.role_id,
      },
    });
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={3} mb={4}>
            Users
          </Title>
          <Text size="sm" c="dimmed">
            Manage system users and roles
          </Text>
        </div>
        <Button leftSection={<IconUserPlus size={20} />} onClick={openAdd}>
          New User
        </Button>
      </Group>

      <Paper p="md" withBorder radius="lg" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        <Table.ScrollContainer minWidth={700}>
          <Table striped highlightOnHover withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Role</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
              <Table.Tr style={{ backgroundColor: "var(--mantine-color-default-hover)" }}>
                <Table.Th>
                  <FilterInput
                    name="name"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Table.Th>
                <Table.Th>
                  <FilterInput
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Table.Th>
                <Table.Th>
                  <FilterSelect
                    name="role"
                    placeholder="Role"
                    data={roles}
                    value={roleId}
                    onChange={setRoleId}
                  />
                </Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Box py="xl" style={{ display: "flex", justifyContent: "center" }}>
                      <Loader size="sm" />
                    </Box>
                  </Table.Td>
                </Table.Tr>
              ) : users.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <NoRecordsFound />
                  </Table.Td>
                </Table.Tr>
              ) : (
                users.map((u) => (
                  <Table.Tr key={u.id}>
                    <Table.Td>{u.name}</Table.Td>
                    <Table.Td>{u.email}</Table.Td>
                    <Table.Td>{u.role_name ?? "—"}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon variant="subtle" size="sm" onClick={() => openEdit(u)} title="Edit">
                          <IconUserEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          size="sm"
                          onClick={() => deleteMutation.mutate(u.id)}
                          title="Delete"
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        {meta && meta.total > PAGE_SIZE && (
          <Group justify="flex-end" mt="md">
            <Pagination
              total={totalPages}
              value={page}
              onChange={setPage}
              size="sm"
              withEdges
            />
          </Group>
        )}
      </Paper>

      {/* Add User modal */}
      <Modal
        opened={addModalOpen && !editUser}
        onClose={() => { setAddModalOpen(false); resetForm(); }}
        title="Add User"
        size="md"
        radius="lg"
      >
        <Stack>
          <TextInput
            label="Name"
            required
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <TextInput
            label="Email"
            type="email"
            required
            placeholder="email@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <PasswordInput
            label="Password"
            required
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <PasswordInput
            label="Confirm Password"
            required
            value={form.password_confirmation}
            onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))}
          />
          <Select
            label="Role"
            placeholder="Select role"
            clearable
            data={roles}
            value={form.role_id != null ? String(form.role_id) : null}
            onChange={(v) => setForm((f) => ({ ...f, role_id: v ? Number(v) : null }))}
          />
          <Button onClick={handleCreate} loading={createMutation.isPending}>
            Create
          </Button>
        </Stack>
      </Modal>

      {/* Edit User modal */}
      <Modal
        opened={!!editUser}
        onClose={() => { setEditUser(null); resetForm(); }}
        title="Edit User"
        size="md"
        radius="lg"
      >
        <Stack>
          <TextInput
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <TextInput
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
          <PasswordInput
            label="New Password (leave blank to keep current)"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <PasswordInput
            label="Confirm New Password"
            value={form.password_confirmation}
            onChange={(e) => setForm((f) => ({ ...f, password_confirmation: e.target.value }))}
          />
          <Select
            label="Role"
            placeholder="Select role"
            clearable
            data={roles}
            value={form.role_id != null ? String(form.role_id) : null}
            onChange={(v) => setForm((f) => ({ ...f, role_id: v ? Number(v) : null }))}
          />
          <Button onClick={handleUpdate} loading={updateMutation.isPending}>
            Update
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
