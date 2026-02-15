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
  Paper,
  Text,
  Box,
  Loader,
} from "@mantine/core";
import { IconPlus, IconEdit, IconTrash, IconEye } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { FilterInput, FilterSelect } from "@components/filters";
import type { SelectOptionType } from "@components/filters";
import {
  purchaseOrdersApi,
  suppliersApi,
  type PurchaseOrder,
} from "@services/api";
import { notifications } from "@mantine/notifications";

const initialForm = {
  po_date: "",
  po_number: "",
  remarks: "",
  supplier_id: 0,
};

export default function PurchaseOrdersPage() {
  const [opened, setOpened] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [poNumber, setPoNumber] = useState("");
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [debouncedPoNumber] = useDebouncedValue(poNumber, 300);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["purchase-orders", debouncedPoNumber, supplierId],
    queryFn: async () => {
      const res = await purchaseOrdersApi.list({
        pageSize: 100,
        po_number: debouncedPoNumber || undefined,
        supplier_id: supplierId ? Number(supplierId) : undefined,
      });
      return (res.data.data ?? []) as PurchaseOrder[];
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await suppliersApi.list({ pageSize: 200 });
      return (res.data.data ?? []) as { id: number; name: string }[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof initialForm) =>
      purchaseOrdersApi.create({
        po_date: payload.po_date,
        po_number: payload.po_number,
        remarks: payload.remarks || undefined,
        supplier_id: payload.supplier_id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      setOpened(false);
      setForm(initialForm);
      notifications.show({ title: "Created", message: "Purchase order created.", color: "green" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: typeof initialForm;
    }) => purchaseOrdersApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      setEditingId(null);
      setOpened(false);
      setForm(initialForm);
      notifications.show({ title: "Updated", message: "Purchase order updated.", color: "green" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => purchaseOrdersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
      notifications.show({ title: "Deleted", message: "Purchase order deleted.", color: "green" });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      notifications.show({
        title: "Delete failed",
        message: err?.response?.data?.message ?? "Purchase order has inspections.",
        color: "red",
      });
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...initialForm, po_date: new Date().toISOString().slice(0, 10) });
    setOpened(true);
  };

  const openEdit = (po: PurchaseOrder) => {
    setEditingId(po.id);
    setForm({
      po_date: po.po_date?.slice(0, 10) ?? "",
      po_number: po.po_number,
      remarks: po.remarks ?? "",
      supplier_id: po.supplier_id,
    });
    setOpened(true);
  };

  const handleSave = () => {
    if (!form.po_date || !form.po_number.trim() || !form.supplier_id) {
      notifications.show({
        title: "Validation",
        message: "PO date, PO number, and supplier are required.",
        color: "red",
      });
      return;
    }
    const payload = {
      po_date: form.po_date,
      po_number: form.po_number,
      remarks: form.remarks.trim() || "",
      supplier_id: form.supplier_id,
    };
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const purchaseOrders = (data ?? []) as PurchaseOrder[];
  const suppliersOpts: SelectOptionType[] = suppliers.map((s) => ({ value: String(s.id), label: s.name }));

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={3} mb={4}>Purchase Orders</Title>
          <Text size="sm" c="dimmed">Manage purchase orders and related requests</Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate} size="md">
          New Purchase Order
        </Button>
      </Group>

      <Paper p="lg" withBorder radius="lg" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>PO Number</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Supplier</Table.Th>
              <Table.Th>Remarks</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
            <Table.Tr style={{ backgroundColor: "var(--mantine-color-default-hover)" }}>
              <Table.Th>
                <FilterInput name="po_number" placeholder="PO No" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} />
              </Table.Th>
              <Table.Th />
              <Table.Th>
                <FilterSelect name="Supplier" data={suppliersOpts} value={supplierId} onChange={setSupplierId} placeholder="Supplier" />
              </Table.Th>
              <Table.Th />
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Box py="xl" style={{ display: "flex", justifyContent: "center" }}>
                    <Loader size="sm" />
                  </Box>
                </Table.Td>
              </Table.Tr>
            ) : purchaseOrders.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text py="md" c="dimmed" ta="center">
                    No purchase orders yet.
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              purchaseOrders.map((po) => (
                <Table.Tr key={po.id}>
                  <Table.Td>{po.po_number}</Table.Td>
                  <Table.Td>{po.po_date ? new Date(po.po_date).toLocaleDateString() : "—"}</Table.Td>
                  <Table.Td>{po.supplier?.name ?? "—"}</Table.Td>
                  <Table.Td>
                    <Text size="sm" lineClamp={1} maw={180}>{po.remarks ?? "—"}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon
                        variant="subtle"
                        component={Link}
                        to={`/purchase-orders/${po.id}`}
                        title="View"
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon variant="subtle" onClick={() => openEdit(po)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="red"
                        variant="subtle"
                        onClick={() => deleteMutation.mutate(po.id)}
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
        title={editingId ? "Edit Purchase Order" : "New Purchase Order"}
        size="md"
        radius="lg"
      >
        <Stack>
          <TextInput
            label="PO Number"
            required
            value={form.po_number}
            onChange={(e) => setForm((f) => ({ ...f, po_number: e.target.value }))}
            placeholder="e.g. PO-2025-001"
          />
          <TextInput
            type="date"
            label="PO Date"
            required
            value={form.po_date}
            onChange={(e) => setForm((f) => ({ ...f, po_date: e.target.value }))}
          />
          <Select
            label="Supplier"
            required
            placeholder="Select supplier"
            data={suppliers.map((s) => ({ value: String(s.id), label: s.name }))}
            value={form.supplier_id ? String(form.supplier_id) : null}
            onChange={(v) => setForm((f) => ({ ...f, supplier_id: v ? Number(v) : 0 }))}
          />
          <Textarea
            label="Remarks"
            value={form.remarks}
            onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
            placeholder="Optional"
            minRows={2}
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
