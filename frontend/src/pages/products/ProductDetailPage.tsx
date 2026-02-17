import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Title, Paper, Stack, Group, Text, Table, Button, Badge, Box, Loader, ActionIcon, SimpleGrid } from "@mantine/core";
import { IconArrowLeft, IconPencil } from "@tabler/icons-react";
import { productsApi, type Product, type Stock } from "@services/api";

function Details({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <Stack gap={4}>
      <Text size="xs" c="dimmed" fw={600}>{label}</Text>
      <Text size="sm" fw={500}>{value ?? "—"}</Text>
    </Stack>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = id ? parseInt(id, 10) : NaN;

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res = await productsApi.get(productId);
      return res.data.data as Product;
    },
    enabled: Number.isInteger(productId),
  });

  const { data: stocks = [], isLoading: stocksLoading } = useQuery({
    queryKey: ["product-stocks", productId],
    queryFn: async () => {
      const res = await productsApi.getStocks(productId);
      return (res.data.data ?? []) as Stock[];
    },
    enabled: Number.isInteger(productId),
  });

  if (productLoading || !product) {
    return (
      <Box py="xl" style={{ display: "flex", justifyContent: "center" }}>
        <Loader size="md" type="dots" color="primary" />
      </Box>
    );
  }

  const criticalLevel = product.critical_level != null ? Number(product.critical_level) : null;
  const availableQty = product.available_quantity != null ? Number(product.available_quantity) : null;
  const isLow = criticalLevel != null && availableQty != null && availableQty <= criticalLevel;

  return (
    <Stack gap="xl" p="xs">
      <Button
        variant="subtle"
        leftSection={<IconArrowLeft size={18} />}
        onClick={() => navigate("/products")}
        style={{ alignSelf: "flex-start" }}
        radius="md"
      >
        Back
      </Button>

      <Paper
        p="lg"
        radius="lg"
        style={{
          background: "linear-gradient(135deg, var(--mantine-color-primary-0) 0%, var(--mantine-color-primary-1) 100%)",
          border: "1px solid var(--mantine-color-primary-2)",
          boxShadow: "0 4px 16px rgba(79,70,229,.1)",
        }}
      >
        <Stack gap="lg">
          <Group justify="space-between" align="flex-end">
            <Group gap="sm">
              <ActionIcon variant="subtle" radius="md" size="md" aria-label="Edit product"><IconPencil size={16} /></ActionIcon>
              <Title order={3} c="var(--mantine-color-primary-8)" fw={700}>{product.name}</Title>
              {isLow && <Badge color="red" variant="light" size="sm" radius="sm">Low stock</Badge>}
            </Group>
            <Group>
              <Button variant="light" size="sm" radius="md" onClick={() => window.open(`/products/${id}/stock-card`, "_blank")}>Stock Card</Button>
              <Button variant="light" size="sm" radius="md" onClick={() => window.open(`/products/${id}/bin-card`, "_blank")}>Bin Card</Button>
            </Group>
          </Group>
          {product.description && <Box><Details label="Description" value={product.description} /></Box>}
          <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} spacing="md">
            <Details label="Product Code" value={product.product_code} />
            <Details label="Category" value={product.category?.name} />
            <Details label="On-hand Quantity" value={availableQty != null && product.unit?.name ? `${availableQty} ${product.unit.name}` : null} />
            <Details label="Critical Level" value={criticalLevel} />
            <Details label="Fund Cluster" value={product.fund_cluster?.name} />
            <Details label="Unit" value={product.unit?.name} />
          </SimpleGrid>
        </Stack>
      </Paper>

      <div>
        <Title order={4} mb={4} fw={600}>Stocks</Title>
        <Text size="sm" c="dimmed" fw={500}>Stock batches and running balance</Text>
      </div>
      <Paper withBorder radius="lg" style={{ boxShadow: "0 4px 16px rgba(0,0,0,.06)" }}>
        {stocksLoading ? (
          <Box p="xl" style={{ display: "flex", justifyContent: "center" }}><Loader size="sm" type="dots" /></Box>
        ) : stocks.length === 0 ? (
          <Text p="lg" c="dimmed" fw={500}>No stock records.</Text>
        ) : (
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>ID</Table.Th>
                <Table.Th>Brand</Table.Th>
                <Table.Th>Lot No</Table.Th>
                <Table.Th>Running Balance</Table.Th>
                <Table.Th>Unit Price</Table.Th>
                <Table.Th>Expiry Date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {stocks.map((s) => (
                <Table.Tr key={s.id}>
                  <Table.Td>{s.id}</Table.Td>
                  <Table.Td>{s.brand?.name ?? "—"}</Table.Td>
                  <Table.Td>{s.lot_no ?? "—"}</Table.Td>
                  <Table.Td>{s.running_balance}</Table.Td>
                  <Table.Td>{s.unit_price != null ? s.unit_price : "—"}</Table.Td>
                  <Table.Td>{s.expiry_date ? new Date(s.expiry_date).toLocaleDateString() : "—"}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Paper>
    </Stack>
  );
}
