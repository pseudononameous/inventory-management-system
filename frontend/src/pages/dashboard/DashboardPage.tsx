import { useQuery } from "@tanstack/react-query";
import {
  Title,
  Text,
  Paper,
  Stack,
  Grid,
  Group,
  Box,
  Button,
} from "@mantine/core";
import {
  IconChartDonutFilled,
  IconPackage,
  IconCategory,
  IconAlertTriangle,
  IconListDetails,
  IconGitPullRequest,
  IconListSearch,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { dashboardApi, type DashboardStats } from "@services/api";
import { Link } from "react-router-dom";

function StatCard({
  icon,
  count,
  label,
  bgColor,
  to,
}: {
  icon: React.ReactNode;
  count: string | number;
  label: string;
  bgColor: string;
  to?: string;
}) {
  const content = (
    <Paper
      p="lg"
      radius="lg"
      style={{ backgroundColor: bgColor, height: "100%", minHeight: 120 }}
    >
      <Group justify="space-between" wrap="nowrap" align="flex-start">
        <Stack gap={4}>
          <Text size="xl" fw={700}>
            {count}
          </Text>
          <Text size="sm" fw={500} c="dark.7">
            {label}
          </Text>
        </Stack>
        <Box style={{ opacity: 0.9 }}>{icon}</Box>
      </Group>
    </Paper>
  );
  if (to) {
    return (
      <Button
        component={Link}
        to={to}
        variant="subtle"
        p={0}
        style={{ height: "auto", display: "block" }}
      >
        {content}
      </Button>
    );
  }
  return content;
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await dashboardApi.getStats();
      return res.data.data as DashboardStats;
    },
  });

  const stats = data ?? {
    product_count: 0,
    category_count: 0,
    low_stock_count: 0,
    product_per_category: [],
    product_per_fund_cluster: [],
  };

  const now = new Date();
  const dateLabel = `${now.toLocaleString("default", { month: "long" })}, ${now.getFullYear()}`;

  return (
    <Stack gap="xl">
      <Grid gutter="lg">
        <Grid.Col span={{ base: 12, md: 12, lg: 2.4 }}>
          <Paper
            p="lg"
            radius="lg"
            style={{
              background: "var(--mantine-color-dark-7)",
              color: "white",
              minHeight: 120,
            }}
          >
            <Group justify="space-between" wrap="nowrap">
              <Stack gap={4}>
                <Text size="md" fw={600} c="gray.3">
                  Quick Stats
                </Text>
                <Text size="sm" c="gray.4">
                  {dateLabel}
                </Text>
              </Stack>
              <IconChartDonutFilled size={48} style={{ opacity: 0.8 }} />
            </Group>
          </Paper>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 2.4 }}>
          <StatCard
            icon={<IconPackage size={48} color="var(--mantine-color-primary-8)" />}
            count={isLoading ? "—" : stats.product_count}
            label="Products"
            bgColor="var(--mantine-color-primary-0)"
            to="/products"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 2.4 }}>
          <StatCard
            icon={<IconCategory size={48} color="var(--mantine-color-teal-8)" />}
            count={isLoading ? "—" : stats.category_count}
            label="Categories"
            bgColor="var(--mantine-color-teal-0)"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 2.4 }}>
          <StatCard
            icon={<IconAlertTriangle size={48} color="var(--mantine-color-red-8)" />}
            count={isLoading ? "—" : stats.low_stock_count}
            label="Low Stock"
            bgColor="var(--mantine-color-red-0)"
            to="/products"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 2.4 }}>
          <StatCard
            icon={<IconListDetails size={48} color="var(--mantine-color-blue-8)" />}
            count={isLoading ? "—" : (stats.purchase_order_count ?? 0)}
            label="Purchase Orders"
            bgColor="var(--mantine-color-blue-0)"
            to="/purchase-orders"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 2.4 }}>
          <StatCard
            icon={<IconGitPullRequest size={48} color="var(--mantine-color-orange-8)" />}
            count={isLoading ? "—" : (stats.requisition_count ?? 0)}
            label="Requisitions"
            bgColor="var(--mantine-color-orange-0)"
            to="/requisitions/pending"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 2.4 }}>
          <StatCard
            icon={<IconListSearch size={48} color="var(--mantine-color-cyan-8)" />}
            count={isLoading ? "—" : (stats.inspection_count ?? 0)}
            label="Inspections"
            bgColor="var(--mantine-color-cyan-0)"
            to="/inspections"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 2.4 }}>
          <StatCard
            icon={<IconTruckDelivery size={48} color="var(--mantine-color-green-8)" />}
            count={isLoading ? "—" : (stats.dispense_count ?? 0)}
            label="Dispenses"
            bgColor="var(--mantine-color-green-0)"
            to="/dispenses/for-dispense"
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6, lg: 2.4 }}>
          <StatCard
            icon={<IconChartDonutFilled size={48} color="var(--mantine-color-violet-8)" />}
            count={isLoading ? "—" : (stats.total_stock_value != null ? `₱${Number(stats.total_stock_value).toLocaleString()}` : "—")}
            label="Total Stock Value"
            bgColor="var(--mantine-color-violet-0)"
          />
        </Grid.Col>
      </Grid>

      <Paper p="lg" withBorder radius="lg">
        <Title order={4} mb="xs">
          Overview
        </Title>
        <Text size="sm" c="dimmed">
          Welcome to the Inventory Management System.
          Use the sidebar to manage products, requisitions, purchase orders, and
          inspections.
        </Text>
      </Paper>
    </Stack>
  );
}
