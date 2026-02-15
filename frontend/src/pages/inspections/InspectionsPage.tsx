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
  Tabs,
} from "@mantine/core";
import { IconPlus, IconEdit, IconTrash, IconEye } from "@tabler/icons-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FilterInput, FilterSelect } from "@components/filters";
import type { SelectOptionType } from "@components/filters";
import {
  inspectionsApi,
  suppliersApi,
  purchaseOrdersApi,
  type Inspection,
  type PurchaseOrder,
} from "@services/api";
import { notifications } from "@mantine/notifications";

type TabValue = "all" | "to-forward" | "forwarded";

const initialForm = {
  iar_no: "",
  supplier_id: 0,
  delivery_date: "",
  invoice_date: "",
  dr_number: "",
  invoice_number: "",
  purchase_order_id: undefined as number | undefined,
  for_warehouse: false,
  remarks: "",
};

export default function InspectionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegment = location.pathname.split("/").filter(Boolean);
  const tab = (pathSegment[1] === "to-forward" || pathSegment[1] === "forwarded"
    ? pathSegment[1]
    : "all") as TabValue;

  const [opened, setOpened] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [iarNo, setIarNo] = useState("");
  const [supplierId, setSupplierId] = useState<string | null>(null);
  const [debouncedIarNo] = useDebouncedValue(iarNo, 300);
  const queryClient = useQueryClient();

  const fetchList = () => {
    if (tab === "to-forward") {
      return inspectionsApi.toForward({
        pageSize: 100,
        iar_no: debouncedIarNo || undefined,
        supplier_id: supplierId ? Number(supplierId) : undefined,
      });
    }
    if (tab === "forwarded") {
      return inspectionsApi.forwarded({
        pageSize: 100,
        iar_no: debouncedIarNo || undefined,
        supplier_id: supplierId ? Number(supplierId) : undefined,
      });
    }
    return inspectionsApi.list({
      pageSize: 100,
      iar_no: debouncedIarNo || undefined,
      supplier_id: supplierId ? Number(supplierId) : undefined,
    });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["inspections", tab, debouncedIarNo, supplierId],
    queryFn: async () => {
      const res = await fetchList();
      return (res.data.data ?? []) as Inspection[];
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const res = await suppliersApi.list({ pageSize: 200 });
      return (res.data.data ?? []) as { id: number; name: string }[];
    },
  });

  const { data: purchaseOrders = [] } = useQuery({
    queryKey: ["purchase-orders-select"],
    queryFn: async () => {
      const res = await purchaseOrdersApi.list({ pageSize: 200 });
      return (res.data.data ?? []) as PurchaseOrder[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof initialForm) =>
      inspectionsApi.create({
        iar_no: payload.iar_no,
        supplier_id: payload.supplier_id,
        delivery_date: payload.delivery_date,
        invoice_date: payload.invoice_date || undefined,
        dr_number: payload.dr_number || undefined,
        invoice_number: payload.invoice_number || undefined,
        purchase_order_id: payload.purchase_order_id,
        for_warehouse: payload.for_warehouse,
        remarks: payload.remarks || undefined,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      setOpened(false);
      setForm(initialForm);
      notifications.show({ title: "Created", message: "Inspection created.", color: "green" });
      const created = res?.data?.data as Inspection | undefined;
      if (created?.id) navigate(`/inspections/${created.id}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: { iar_no?: string; remarks?: string } }) =>
      inspectionsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      setEditingId(null);
      setOpened(false);
      setForm(initialForm);
      notifications.show({ title: "Updated", message: "Inspection updated.", color: "green" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => inspectionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      notifications.show({ title: "Deleted", message: "Inspection deleted.", color: "green" });
    },
  });

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...initialForm,
      delivery_date: new Date().toISOString().slice(0, 10),
      invoice_date: new Date().toISOString().slice(0, 10),
    });
    setOpened(true);
  };

  const openEdit = (ins: Inspection) => {
    setEditingId(ins.id);
    setForm({
      iar_no: ins.iar_no,
      supplier_id: ins.delivery?.supplier?.id ?? 0,
      delivery_date: ins.delivery?.delivery_date?.slice(0, 10) ?? "",
      invoice_date: "",
      dr_number: "",
      invoice_number: "",
      purchase_order_id: ins.purchase_order?.id,
      for_warehouse: ins.for_warehouse ?? false,
      remarks: ins.remarks ?? "",
    });
    setOpened(true);
  };

  const handleSave = () => {
    if (!form.iar_no.trim() || !form.supplier_id || !form.delivery_date) {
      notifications.show({
        title: "Validation",
        message: "IAR No, supplier, and delivery date are required.",
        color: "red",
      });
      return;
    }
    if (editingId !== null) {
      updateMutation.mutate({
        id: editingId,
        payload: { iar_no: form.iar_no.trim(), remarks: form.remarks.trim() || undefined },
      });
    } else {
      createMutation.mutate(form);
    }
  };

  const inspections = (data ?? []) as Inspection[];
  const suppliersOpts: SelectOptionType[] = suppliers.map((s) => ({ value: String(s.id), label: s.name }));

  const tabLabels: Record<TabValue, string> = {
    all: "All Inspections",
    "to-forward": "To Forward",
    forwarded: "Forwarded",
  };

  return (
    <Stack gap="xl">
      <Tabs
        value={tab}
        onChange={(v) => {
          const base = "/inspections";
          navigate(v === "all" ? base : `${base}/${v}`);
        }}
      >
        <Group justify="space-between" mb="md">
          <div>
            <Title order={3} mb={4}>{tabLabels[tab]}</Title>
            <Text size="sm" c="dimmed">Inspection and delivery items management</Text>
          </div>
          {tab === "all" && (
            <Button leftSection={<IconPlus size={16} />} onClick={openCreate} size="md">
              New Inspection
            </Button>
          )}
        </Group>

        <Tabs.List>
          <Tabs.Tab value="all">All</Tabs.Tab>
          <Tabs.Tab value="to-forward">To Forward</Tabs.Tab>
          <Tabs.Tab value="forwarded">Forwarded</Tabs.Tab>
        </Tabs.List>

        <Paper p="lg" withBorder radius="lg" mt="md" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>IAR No</Table.Th>
                <Table.Th>Supplier</Table.Th>
                <Table.Th>Delivery Date</Table.Th>
                <Table.Th>PO</Table.Th>
                <Table.Th>For Warehouse</Table.Th>
                <Table.Th>Forwarded</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
              <Table.Tr style={{ backgroundColor: "var(--mantine-color-default-hover)" }}>
                <Table.Th>
                  <FilterInput name="iar_no" placeholder="IAR No" value={iarNo} onChange={(e) => setIarNo(e.target.value)} />
                </Table.Th>
                <Table.Th>
                  <FilterSelect name="Supplier" data={suppliersOpts} value={supplierId} onChange={setSupplierId} placeholder="Supplier" />
                </Table.Th>
                <Table.Th />
                <Table.Th />
                <Table.Th />
                <Table.Th />
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading ? (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Box py="xl" style={{ display: "flex", justifyContent: "center" }}>
                      <Loader size="sm" />
                    </Box>
                  </Table.Td>
                </Table.Tr>
              ) : inspections.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Text py="md" c="dimmed" ta="center">
                      No inspections.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                inspections.map((ins) => (
                  <Table.Tr key={ins.id}>
                    <Table.Td>{ins.iar_no}</Table.Td>
                    <Table.Td>{ins.delivery?.supplier?.name ?? "—"}</Table.Td>
                    <Table.Td>
                      {ins.delivery?.delivery_date
                        ? new Date(ins.delivery.delivery_date).toLocaleDateString()
                        : "—"}
                    </Table.Td>
                    <Table.Td>{ins.purchase_order?.po_number ?? "—"}</Table.Td>
                    <Table.Td>{ins.for_warehouse ? "Yes" : "No"}</Table.Td>
                    <Table.Td>{ins.is_forward ? "Yes" : "No"}</Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          variant="subtle"
                          component={Link}
                          to={`/inspections/${ins.id}`}
                          title="View"
                        >
                          <IconEye size={16} />
                        </ActionIcon>
                        <ActionIcon variant="subtle" onClick={() => openEdit(ins)}>
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => deleteMutation.mutate(ins.id)}
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
      </Tabs>

      <Modal
        opened={opened}
        onClose={() => {
          setOpened(false);
          setEditingId(null);
          setForm(initialForm);
        }}
        title={editingId ? "Edit Inspection" : "New Inspection"}
        size="md"
        radius="lg"
      >
        <Stack>
          <TextInput
            label="IAR No"
            required
            value={form.iar_no}
            onChange={(e) => setForm((f) => ({ ...f, iar_no: e.target.value }))}
            placeholder="e.g. IAR-2025-001"
          />
          <Select
            label="Supplier"
            required
            placeholder="Select supplier"
            data={suppliers.map((s) => ({ value: String(s.id), label: s.name }))}
            value={form.supplier_id ? String(form.supplier_id) : null}
            onChange={(v) => setForm((f) => ({ ...f, supplier_id: v ? Number(v) : 0 }))}
            disabled={!!editingId}
          />
          <TextInput
            type="date"
            label="Delivery Date"
            required
            value={form.delivery_date}
            onChange={(e) => setForm((f) => ({ ...f, delivery_date: e.target.value }))}
            disabled={!!editingId}
          />
          {!editingId && (
            <>
              <TextInput
                type="date"
                label="Invoice Date"
                value={form.invoice_date}
                onChange={(e) => setForm((f) => ({ ...f, invoice_date: e.target.value }))}
              />
              <TextInput
                label="DR Number"
                value={form.dr_number}
                onChange={(e) => setForm((f) => ({ ...f, dr_number: e.target.value }))}
              />
              <TextInput
                label="Invoice Number"
                value={form.invoice_number}
                onChange={(e) => setForm((f) => ({ ...f, invoice_number: e.target.value }))}
              />
              <Select
                label="Purchase Order"
                placeholder="Optional"
                data={purchaseOrders.map((po) => ({ value: String(po.id), label: `${po.po_number} - ${po.supplier?.name ?? ""}` }))}
                value={form.purchase_order_id ? String(form.purchase_order_id) : null}
                onChange={(v) => setForm((f) => ({ ...f, purchase_order_id: v ? Number(v) : undefined }))}
                clearable
              />
              <Select
                label="For Warehouse"
                data={[{ value: "0", label: "No" }, { value: "1", label: "Yes" }]}
                value={form.for_warehouse ? "1" : "0"}
                onChange={(v) => setForm((f) => ({ ...f, for_warehouse: v === "1" }))}
              />
            </>
          )}
          <Textarea
            label="Remarks"
            value={form.remarks}
            onChange={(e) => setForm((f) => ({ ...f, remarks: e.target.value }))}
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
