import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import {
  Title,
  Button,
  Table,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  Stack,
  Group,
  Select,
  Switch,
  Paper,
  Text,
  Box,
  Loader,
} from "@mantine/core";
import { IconPlus, IconEdit, IconTrash, IconEye } from "@tabler/icons-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FilterInput, FilterSelect } from "@components/filters";
import type { SelectOptionType } from "@components/filters";
import {
  requisitionsApi,
  departmentsApi,
  type Requisition,
} from "@services/api";
import { notifications } from "@mantine/notifications";

const initialForm = {
  ris_no: "",
  department_id: 0,
  requested_by: "",
  designation: "",
  purpose: "",
  with_inspection: false,
};

type TabValue = "pending" | "for-dispensing" | "dispensed";

export default function RequisitionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegment = location.pathname.split("/").filter(Boolean);
  const tab = (pathSegment[2] as TabValue) || "pending";

  const [opened, setOpened] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [risNo, setRisNo] = useState("");
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [requestedBy, setRequestedBy] = useState("");
  const [designation, setDesignation] = useState("");
  const [debouncedRisNo] = useDebouncedValue(risNo, 300);
  const [debouncedRequestedBy] = useDebouncedValue(requestedBy, 300);
  const [debouncedDesignation] = useDebouncedValue(designation, 300);
  const queryClient = useQueryClient();

  const isForDispenseParam = tab === "pending" ? 0 : tab === "for-dispensing" ? 1 : undefined;
  const isDispenseParam = tab === "dispensed" ? 1 : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ["requisitions", tab, isForDispenseParam, isDispenseParam, debouncedRisNo, departmentId, debouncedRequestedBy, debouncedDesignation],
    queryFn: async () => {
      const res = await requisitionsApi.list({
        pageSize: 100,
        ...(isForDispenseParam !== undefined && { is_for_dispense: isForDispenseParam }),
        ...(isDispenseParam !== undefined && { is_dispense: isDispenseParam }),
        ris_no: debouncedRisNo || undefined,
        department_id: departmentId ? Number(departmentId) : undefined,
        requested_by: debouncedRequestedBy || undefined,
        designation: debouncedDesignation || undefined,
      });
      return (res.data.data ?? []) as Requisition[];
    },
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await departmentsApi.list({ pageSize: 200 });
      return (res.data.data ?? []) as { id: number; name: string }[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof initialForm) =>
      requisitionsApi.create({
        ris_no: payload.ris_no,
        department_id: payload.department_id,
        requested_by: payload.requested_by,
        designation: payload.designation,
        purpose: (payload.purpose ?? "").toString(),
        with_inspection: payload.with_inspection,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      setOpened(false);
      setForm(initialForm);
      notifications.show({ title: "Created", message: "Requisition created.", color: "green" });
      const created = res?.data?.data as Requisition | undefined;
      if (created?.id) navigate(`/requisitions/${created.id}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: {
        ris_no: string;
        department_id: number;
        requested_by: string;
        designation: string;
        purpose?: string;
        with_inspection: boolean;
      };
    }) => requisitionsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      setEditingId(null);
      setOpened(false);
      setForm(initialForm);
      notifications.show({ title: "Updated", message: "Requisition updated.", color: "green" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => requisitionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      notifications.show({ title: "Deleted", message: "Requisition deleted.", color: "green" });
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setOpened(true);
  };

  const openEdit = (r: Requisition) => {
    setEditingId(r.id);
    setForm({
      ris_no: r.ris_no,
      department_id: r.department_id,
      requested_by: r.requested_by,
      designation: r.designation,
      purpose: r.purpose ?? "",
      with_inspection: r.with_inspection,
    });
    setOpened(true);
  };

  const handleSave = () => {
    if (
      !form.ris_no.trim() ||
      !form.department_id ||
      !form.requested_by.trim() ||
      !form.designation.trim()
    ) {
      notifications.show({
        title: "Validation",
        message: "RIS No, Department, Requested by and Designation are required.",
        color: "red",
      });
      return;
    }
    const payload = {
      ris_no: form.ris_no.trim(),
      department_id: form.department_id,
      requested_by: form.requested_by.trim(),
      designation: form.designation.trim(),
      purpose: form.purpose.trim(),
      with_inspection: form.with_inspection,
    };
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const requisitions = (data ?? []) as Requisition[];
  const departmentsOpts: SelectOptionType[] = departments.map((d) => ({ value: String(d.id), label: d.name }));

  const tabTitles: Record<TabValue, string> = {
    pending: "Pending Requisitions",
    "for-dispensing": "For Dispensing",
    dispensed: "Dispensed",
  };

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={3} mb={4}>{tabTitles[tab]}</Title>
          <Text size="sm" c="dimmed">
            {tab === "pending" && "Create and manage pending requisitions"}
            {tab === "for-dispensing" && "Requisitions ready for dispensing"}
            {tab === "dispensed" && "Dispensed requisitions"}
          </Text>
        </div>
        {tab === "pending" && (
          <Button leftSection={<IconPlus size={16} />} onClick={openCreate} size="md">
            New Requisition
          </Button>
        )}
      </Group>

      <Paper p="lg" withBorder radius="lg" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>RIS No</Table.Th>
              <Table.Th>Department</Table.Th>
              <Table.Th>Requested by</Table.Th>
              <Table.Th>Designation</Table.Th>
              <Table.Th>With inspection</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
            <Table.Tr style={{ backgroundColor: "var(--mantine-color-default-hover)" }}>
              <Table.Th>
                <FilterInput name="ris_no" placeholder="RIS No" value={risNo} onChange={(e) => setRisNo(e.target.value)} />
              </Table.Th>
              <Table.Th>
                <FilterSelect name="Department" data={departmentsOpts} value={departmentId} onChange={setDepartmentId} placeholder="Department" />
              </Table.Th>
              <Table.Th>
                <FilterInput name="requested_by" placeholder="Requested by" value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} />
              </Table.Th>
              <Table.Th>
                <FilterInput name="designation" placeholder="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
              </Table.Th>
              <Table.Th />
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Box py="xl" style={{ display: "flex", justifyContent: "center" }}>
                    <Loader size="sm" />
                  </Box>
                </Table.Td>
              </Table.Tr>
            ) : requisitions.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text py="md" c="dimmed" ta="center">
                    No requisitions yet. Create one to get started.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              requisitions.map((r) => (
                <Table.Tr key={r.id}>
                  <Table.Td>{r.ris_no}</Table.Td>
                  <Table.Td>{r.department?.name ?? "—"}</Table.Td>
                  <Table.Td>{r.requested_by}</Table.Td>
                  <Table.Td>{r.designation}</Table.Td>
                  <Table.Td>{r.with_inspection ? "Yes" : "No"}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        component={Link}
                        to={`/requisitions/${r.id}`}
                        title="View / Items"
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" onClick={() => openEdit(r)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => deleteMutation.mutate(r.id)}
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
      </Paper>

      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          setEditingId(null);
          setForm(initialForm);
        }}
        title={editingId ? "Edit Requisition" : "New Requisition"}
        size="md"
        radius="lg"
      >
        <Stack>
          <TextInput
            label="RIS No"
            required
            value={form.ris_no}
            onChange={(e) => setForm((f) => ({ ...f, ris_no: e.target.value }))}
            placeholder="e.g. RIS-2025-001"
          />
          <Select
            label="Department"
            required
            placeholder="Select department"
            data={departments.map((d) => ({ value: String(d.id), label: d.name }))}
            value={form.department_id ? String(form.department_id) : null}
            onChange={(v) => setForm((f) => ({ ...f, department_id: v ? Number(v) : 0 }))}
          />
          <TextInput
            label="Requested by"
            required
            value={form.requested_by}
            onChange={(e) => setForm((f) => ({ ...f, requested_by: e.target.value }))}
            placeholder="Name of requester"
          />
          <TextInput
            label="Designation"
            required
            value={form.designation}
            onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
            placeholder="Job title / role"
          />
          <Textarea
            label="Purpose"
            value={form.purpose}
            onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))}
            placeholder="Optional purpose"
            minRows={2}
          />
          <Switch
            label="With inspection"
            checked={form.with_inspection}
            onChange={(e) =>
              setForm((f) => ({ ...f, with_inspection: e.currentTarget.checked }))
            }
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
