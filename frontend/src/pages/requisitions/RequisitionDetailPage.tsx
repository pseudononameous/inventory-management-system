import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Title,
  Paper,
  Stack,
  Group,
  Text,
  Table,
  Button,
  Modal,
  TextInput,
  NumberInput,
  Select,
  ActionIcon,
  Box,
  Loader,
  Divider,
  Switch,
  Textarea,
  Tabs,
  Menu,
  Grid,
  Flex,
} from "@mantine/core";
import { IconArrowLeft, IconPlus, IconEdit, IconTrash, IconList, IconFile, IconDotsVertical, IconPrinter } from "@tabler/icons-react";
import { useMantineTheme } from "@mantine/core";
import {
  requisitionsApi,
  departmentsApi,
  type Requisition,
  type RequisitionItem,
  type Stock,
  type Product,
} from "@services/api";
import { notifications } from "@mantine/notifications";

export default function RequisitionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const requisitionId = id ? parseInt(id, 10) : NaN;
  const queryClient = useQueryClient();
  const theme = useMantineTheme();

  const tabValue = location.pathname.endsWith("/archive") ? "archive" : "items";

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addItemModalOpen, setAddItemModalOpen] = useState(false);
  const [editItemId, setEditItemId] = useState<number | null>(null);
  const [editItemQty, setEditItemQty] = useState<string | number>("");
  const [warehouseSearch, setWarehouseSearch] = useState("");
  const [selectedStockId, setSelectedStockId] = useState<number | null>(null);
  const [addQuantity, setAddQuantity] = useState<number>(1);

  const [editForm, setEditForm] = useState({
    ris_no: "",
    department_id: 0,
    requested_by: "",
    designation: "",
    purpose: "",
    with_inspection: false,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["requisition", requisitionId],
    queryFn: async () => {
      const res = await requisitionsApi.get(requisitionId);
      return res.data.data as { requisition: Requisition; requisition_items: RequisitionItem[] };
    },
    enabled: Number.isInteger(requisitionId),
  });

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await departmentsApi.list({ pageSize: 200 });
      return (res.data.data ?? []) as { id: number; name: string }[];
    },
  });

  const { data: warehouseData, isLoading: warehouseLoading } = useQuery({
    queryKey: ["warehouse-stocks", warehouseSearch],
    queryFn: async () => {
      const res = await requisitionsApi.warehouseStocks({
        search: warehouseSearch || undefined,
        pageSize: 20,
      });
      return (res.data.data ?? []) as (Stock & {
        product?: Product;
        brand?: { id: number; name: string } | null;
      })[];
    },
    enabled: addItemModalOpen,
  });

  const updateRequisitionMutation = useMutation({
    mutationFn: (payload: typeof editForm) => requisitionsApi.update(requisitionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisition", requisitionId] });
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      setEditModalOpen(false);
      notifications.show({ title: "Updated", message: "Requisition updated.", color: "green" });
    },
  });

  const addItemMutation = useMutation({
    mutationFn: (payload: { stock_id: number; quantity: number }) =>
      requisitionsApi.addItem(requisitionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisition", requisitionId] });
      setAddItemModalOpen(false);
      setSelectedStockId(null);
      setAddQuantity(1);
      setWarehouseSearch("");
      notifications.show({ title: "Added", message: "Item added to requisition.", color: "green" });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) =>
      requisitionsApi.updateItem(itemId, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisition", requisitionId] });
      setEditItemId(null);
      setEditItemQty("");
      notifications.show({ title: "Updated", message: "Item quantity updated.", color: "green" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: (itemId: number) => requisitionsApi.deleteItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisition", requisitionId] });
      notifications.show({ title: "Removed", message: "Item removed.", color: "green" });
    },
  });

  const markForDispenseMutation = useMutation({
    mutationFn: () => requisitionsApi.markAsForDispense(requisitionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["requisition", requisitionId] });
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      notifications.show({ title: "Updated", message: "Requisition marked for dispensing.", color: "green" });
    },
  });

  const dispenseMutation = useMutation({
    mutationFn: () => requisitionsApi.dispense(requisitionId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["requisition", requisitionId] });
      queryClient.invalidateQueries({ queryKey: ["requisitions"] });
      const dispense = res?.data?.data;
      notifications.show({
        title: "Dispense Created",
        message: dispense ? `Dispense ${dispense.dispense_code} created.` : "Dispense created.",
        color: "green",
      });
      if (dispense?.id) navigate(`/dispenses/${dispense.id}`);
    },
  });

  const openEditModal = () => {
    if (!data?.requisition) return;
    const r = data.requisition;
    setEditForm({
      ris_no: r.ris_no,
      department_id: r.department_id,
      requested_by: r.requested_by,
      designation: r.designation,
      purpose: r.purpose ?? "",
      with_inspection: r.with_inspection,
    });
    setEditModalOpen(true);
  };

  const handleUpdateRequisition = () => {
    if (
      !editForm.ris_no.trim() ||
      !editForm.department_id ||
      !editForm.requested_by.trim() ||
      !editForm.designation.trim()
    ) {
      notifications.show({
        title: "Validation",
        message: "RIS No, Department, Requested by and Designation are required.",
        color: "red",
      });
      return;
    }
    updateRequisitionMutation.mutate(editForm);
  };

  const handleAddItem = () => {
    if (!selectedStockId || addQuantity <= 0) {
      notifications.show({
        title: "Validation",
        message: "Select a stock and enter a valid quantity.",
        color: "red",
      });
      return;
    }
    addItemMutation.mutate({ stock_id: selectedStockId, quantity: addQuantity });
  };

  const warehouseStocks = (warehouseData ?? []) as (Stock & {
    product?: Product;
    brand?: { id: number; name: string } | null;
  })[];

  if (isLoading || !data) {
    return (
      <Box py="xl" style={{ display: "flex", justifyContent: "center" }}>
        <Loader size="md" />
      </Box>
    );
  }

  const { requisition, requisition_items: items } = data;
  const isForDispense = Boolean(requisition.is_for_dispense);

  return (
    <Stack gap="md" p="xs">
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={16} />}
        onClick={() => navigate("/requisitions/pending")}
        style={{ alignSelf: "flex-start" }}
      >
        Back
      </Button>

      <Paper
        p="lg"
        radius="lg"
        shadow="sm"
        style={{ backgroundColor: theme.colors.primary[0] ?? theme.colors.blue[0] }}
      >
        <Stack gap="lg">
          <Group justify="space-between" align="flex-end">
            <Group gap="xs">
              <Menu shadow="md" position="bottom-start">
                <Menu.Target>
                  <ActionIcon variant="subtle" radius="md" size="md">
                    <IconDotsVertical size={20} />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Item leftSection={<IconEdit size={14} />} onClick={openEditModal}>
                    Edit Requisition
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconPrinter size={14} />}
                    onClick={() => window.open(`/requisitions/${id}/printable`, "_blank")}
                  >
                    Print RIS
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
              <Title order={3} c={theme.colors.primary[9] ?? theme.colors.blue[9]}>
                RIS No. {requisition.ris_no}
              </Title>
            </Group>
            <Flex gap="xs">
              {!isForDispense && !requisition.with_inspection && (
                <Button size="sm" onClick={() => setAddItemModalOpen(true)}>
                  Add Item
                </Button>
              )}
              {!isForDispense && items.length > 0 && (
                <Button
                  size="sm"
                  color="teal"
                  onClick={() => markForDispenseMutation.mutate()}
                  loading={markForDispenseMutation.isPending}
                >
                  Mark as for Dispensing
                </Button>
              )}
              {isForDispense && (
                <Button
                  size="sm"
                  color="green"
                  onClick={() => {
                    if (window.confirm("Create dispense record and allocate stock?")) {
                      dispenseMutation.mutate();
                    }
                  }}
                  loading={dispenseMutation.isPending}
                >
                  Create Dispense
                </Button>
              )}
            </Flex>
          </Group>
          <Grid>
            <Grid.Col span={{ base: 12, lg: 2 }}>
              <Text size="sm" fw={500} c="dimmed">Requestor</Text>
              <Text size="sm">{requisition.requested_by}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 2 }}>
              <Text size="sm" fw={500} c="dimmed">Designation</Text>
              <Text size="sm">{requisition.designation}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <Text size="sm" fw={500} c="dimmed">Department</Text>
              <Text size="sm">{requisition.department?.name ?? "—"}</Text>
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 2 }}>
              <Text size="sm" fw={500} c="dimmed">Source</Text>
              <Text size="sm">
                {requisition.with_inspection ? "From Issuance" : "From Warehouse"}
              </Text>
            </Grid.Col>
          </Grid>
        </Stack>
      </Paper>

      <Tabs
        value={tabValue}
        onChange={(v) => navigate(v === "archive" ? `/requisitions/${id}/archive` : `/requisitions/${id}/items`)}
      >
        <Tabs.List>
          <Tabs.Tab value="items" leftSection={<IconList size={12} />}>
            Items
          </Tabs.Tab>
          <Tabs.Tab value="archive" leftSection={<IconFile size={12} />}>
            Archive
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="items" pt="md">

          <Group justify="space-between" mb="sm">
            <div>
              <Title order={4} mb={4}>Items</Title>
              <Text size="sm" c="dimmed">Requisition line items from warehouse stock</Text>
            </div>
            <Button
              leftSection={<IconPlus size={16} />}
              size="sm"
              onClick={() => {
                setWarehouseSearch("");
                setSelectedStockId(null);
                setAddQuantity(1);
                setAddItemModalOpen(true);
              }}
            >
              Add item
            </Button>
          </Group>

          <Paper withBorder radius="lg" style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
            {items.length === 0 ? (
              <Text p="lg" c="dimmed">
                No items. Add items from warehouse stock.
              </Text>
            ) : (
              <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Product</Table.Th>
                    <Table.Th>Brand</Table.Th>
                    <Table.Th>Lot No</Table.Th>
                    <Table.Th>Quantity</Table.Th>
                    <Table.Th>Unit</Table.Th>
                    <Table.Th>Unit price</Table.Th>
                    <Table.Th>Expiry</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>{item.product?.name ?? "—"}</Table.Td>
                      <Table.Td>{item.brand?.name ?? "—"}</Table.Td>
                      <Table.Td>{item.lot_no ?? "—"}</Table.Td>
                      <Table.Td>
                        {editItemId === item.id ? (
                          <Group gap="xs">
                            <NumberInput
                              size="xs"
                              min={0.01}
                              value={editItemQty}
                              onChange={setEditItemQty}
                              style={{ width: 80 }}
                            />
                            <Button
                              size="xs"
                              onClick={() => {
                                const q = Number(editItemQty);
                                if (q > 0) updateItemMutation.mutate({ itemId: item.id, quantity: q });
                              }}
                              loading={updateItemMutation.isPending}
                            >
                              Save
                            </Button>
                            <Button
                              size="xs"
                              variant="subtle"
                              onClick={() => {
                                setEditItemId(null);
                                setEditItemQty("");
                              }}
                            >
                              Cancel
                            </Button>
                          </Group>
                        ) : (
                          <>
                            {item.quantity}
                            <ActionIcon
                              variant="subtle"
                              size="xs"
                              ml="xs"
                              onClick={() => {
                                setEditItemId(item.id);
                                setEditItemQty(item.quantity);
                              }}
                            >
                              <IconEdit size={14} />
                            </ActionIcon>
                          </>
                        )}
                      </Table.Td>
                      <Table.Td>{item.product?.unit?.name ?? "—"}</Table.Td>
                      <Table.Td>{item.unit_price != null ? item.unit_price : "—"}</Table.Td>
                      <Table.Td>
                        {item.expiry_date
                          ? new Date(item.expiry_date).toLocaleDateString()
                          : "—"}
                      </Table.Td>
                      <Table.Td>
                        {editItemId !== item.id && (
                          <ActionIcon
                            color="red"
                            variant="subtle"
                            size="sm"
                            onClick={() => deleteItemMutation.mutate(item.id)}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Paper>

        </Tabs.Panel>
        <Tabs.Panel value="archive" pt="md">
          <Paper p="lg" withBorder radius="lg">
            <Text size="sm" c="dimmed">
              Archive and history for this requisition. (Placeholder)
            </Text>
          </Paper>
        </Tabs.Panel>
      </Tabs>

      {/* Edit requisition modal */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Requisition"
        size="md"
        radius="lg"
      >
        <Stack>
          <TextInput
            label="RIS No"
            required
            value={editForm.ris_no}
            onChange={(e) => setEditForm((f) => ({ ...f, ris_no: e.target.value }))}
          />
          <Select
            label="Department"
            required
            data={departments.map((d) => ({ value: String(d.id), label: d.name }))}
            value={String(editForm.department_id)}
            onChange={(v) => setEditForm((f) => ({ ...f, department_id: v ? Number(v) : 0 }))}
          />
          <TextInput
            label="Requested by"
            required
            value={editForm.requested_by}
            onChange={(e) => setEditForm((f) => ({ ...f, requested_by: e.target.value }))}
          />
          <TextInput
            label="Designation"
            required
            value={editForm.designation}
            onChange={(e) => setEditForm((f) => ({ ...f, designation: e.target.value }))}
          />
          <Textarea
            label="Purpose"
            value={editForm.purpose}
            onChange={(e) => setEditForm((f) => ({ ...f, purpose: e.target.value }))}
            minRows={2}
          />
          <Switch
            label="With inspection"
            checked={editForm.with_inspection}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, with_inspection: e.currentTarget.checked }))
            }
          />
          <Button onClick={handleUpdateRequisition} loading={updateRequisitionMutation.isPending}>
            Update
          </Button>
        </Stack>
      </Modal>

      {/* Add item modal */}
      <Modal
        opened={addItemModalOpen}
        onClose={() => {
          setAddItemModalOpen(false);
          setSelectedStockId(null);
          setWarehouseSearch("");
        }}
        title="Add item from warehouse"
        size="lg"
        radius="lg"
      >
        <Stack>
          <TextInput
            label="Search product"
            placeholder="Product name or code"
            value={warehouseSearch}
            onChange={(e) => setWarehouseSearch(e.target.value)}
          />
          <Box style={{ maxHeight: 280, overflow: "auto" }}>
            {warehouseLoading ? (
              <Loader size="sm" />
            ) : warehouseStocks.length === 0 ? (
              <Text size="sm" c="dimmed">
                No warehouse stock found. Try a different search.
              </Text>
            ) : (
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Product</Table.Th>
                    <Table.Th>Brand</Table.Th>
                    <Table.Th>Lot</Table.Th>
                    <Table.Th>Balance</Table.Th>
                    <Table.Th>Select</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {warehouseStocks.map((s) => (
                    <Table.Tr
                      key={s.id}
                      style={{
                        background: selectedStockId === s.id ? "var(--mantine-color-teal-light)" : undefined,
                      }}
                    >
                      <Table.Td>{s.product?.name ?? "—"}</Table.Td>
                      <Table.Td>{s.brand?.name ?? "—"}</Table.Td>
                      <Table.Td>{s.lot_no ?? "—"}</Table.Td>
                      <Table.Td>{s.running_balance}</Table.Td>
                      <Table.Td>
                        <Button
                          size="xs"
                          variant={selectedStockId === s.id ? "filled" : "light"}
                          onClick={() => setSelectedStockId(s.id)}
                        >
                          {selectedStockId === s.id ? "Selected" : "Select"}
                        </Button>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}
          </Box>
          <Divider />
          <NumberInput
            label="Quantity"
            min={0.01}
            value={addQuantity}
            onChange={(v) => setAddQuantity(typeof v === "number" ? v : 1)}
          />
          <Button
            onClick={handleAddItem}
            loading={addItemMutation.isPending}
            disabled={!selectedStockId}
          >
            Add to requisition
          </Button>
        </Stack>
      </Modal>
    </Stack>
  );
}
