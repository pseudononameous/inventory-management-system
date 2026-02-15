import {
  AppShell as MantineAppShell,
  Burger,
  Group,
  Stack,
  NavLink,
  UnstyledButton,
  Box,
  Text,
  ThemeIcon,
  Menu,
  Button,
  Tooltip,
} from "@mantine/core";
import { useDisclosure, useViewportSize } from "@mantine/hooks";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { rem } from "@mantine/core";
import {
  IconLogout,
  IconUser,
  IconLock,
  IconLayoutDashboard,
  IconPackage,
  IconGitPullRequest,
  IconListDetails,
  IconListSearch,
  IconFile,
  IconSettings,
  IconCategory,
  IconTruckDelivery,
} from "@tabler/icons-react";
import { useAuthStore } from "@stores/useAuthStore";
import { authApi } from "@services/api";
import RightSideNav from "./RightSideNav";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { to: "/products", label: "Products", icon: IconPackage },
  { to: "/purchase-orders", label: "Purchase Orders", icon: IconListDetails },
  { to: "/inspections", label: "Inspections", icon: IconListSearch },
  { to: "/requisitions/pending", label: "Requisitions", icon: IconGitPullRequest },
  { to: "/dispenses/for-dispense", label: "Dispenses", icon: IconTruckDelivery },
  { to: "/reports", label: "Reports", icon: IconFile },
  { to: "/settings/users", label: "Settings", icon: IconSettings },
] as const;

function NavItem({
  to,
  label,
  icon: Icon,
  isActive,
  large,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: string | number }>;
  isActive: boolean;
  large: boolean;
}) {
  const link = (
    <NavLink
      component={Link}
      to={to}
      label={large ? label : null}
      leftSection={<Icon size={large ? 16 : 24} />}
      active={isActive}
      style={{
        borderRadius: "md",
        fontWeight: isActive ? 700 : undefined,
        color: isActive ? "var(--mantine-color-primary-8)" : undefined,
      }}
    />
  );
  return large ? link : <Tooltip label={label} position="right">{link}</Tooltip>;
}

export default function AppShellLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { width } = useViewportSize();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      logout();
      navigate("/login");
    }
  };

  const large = (width ?? 1200) >= 1338;
  const navbarWidth = large ? 250 : 70;

  const isActive = (path: string) => {
    const current = location.pathname.split("/")[1];
    const target = path.split("/")[1];
    if (path.startsWith("/settings")) return location.pathname.startsWith("/settings");
    if (path.startsWith("/dispenses")) return location.pathname.startsWith("/dispenses");
    if (path.startsWith("/requisitions")) return location.pathname.startsWith("/requisitions");
    return current === target;
  };

  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{
        width: navbarWidth,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      aside={{ width: 60, breakpoint: "sm", collapsed: { desktop: false, mobile: true } }}
      padding="md"
      styles={{
        main: {
          background: "var(--mantine-color-gray-0)",
          minHeight: "100vh",
        },
        header: {
          background: "white",
          borderBottom: "1px solid var(--mantine-color-gray-2)",
        },
        navbar: {
          background: "#f9f9f9",
          borderRight: "1px solid var(--mantine-color-gray-2)",
        },
      }}
    >
      <MantineAppShell.Header>
        <Group justify="space-between" px="md" h="100%">
          <Group h="100%">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <UnstyledButton component={Link} to="/dashboard" style={{ textDecoration: "none" }}>
              <Group px={10} gap="xs">
                <ThemeIcon
                  size={40}
                  radius="md"
                  style={{ background: "var(--mantine-color-primary-8)", color: "white" }}
                >
                  <Text fw={700} size="xs">OA</Text>
                </ThemeIcon>
                <Box>
                  <Text size="lg" fw={700} c="var(--mantine-color-primary-8)">
                    Office Anesthesia
                  </Text>
                  <Text size="xs" c="dimmed" visibleFrom="md">
                    Inventory Management System
                  </Text>
                </Box>
              </Group>
            </UnstyledButton>
          </Group>
          <Group>
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <Button variant="white" leftSection={<IconUser size={18} />}>
                  <Text visibleFrom="sm" span>{user?.name ?? "Guest"}</Text>
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconUser style={{ width: rem(14), height: rem(14) }} />}
                  component={Link}
                  to="/my-profile"
                >
                  My Profile
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconLock style={{ width: rem(14), height: rem(14) }} />}
                  component={Link}
                  to="/change-password"
                >
                  Change Password
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconLogout style={{ width: rem(14), height: rem(14) }} />}
                  color="red"
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p={large ? "md" : "xs"}>
        <MantineAppShell.Section grow>
          <Stack gap={4}>
            {NAV_ITEMS.map(({ to, label, icon }) => (
              <NavItem
                key={to}
                to={to}
                label={label}
                icon={icon}
                isActive={isActive(to)}
                large={large}
              />
            ))}
            <NavLink
              label={large ? "Libraries" : null}
              leftSection={<IconCategory size={large ? 16 : 24} />}
              childrenOffset={28}
              defaultOpened={location.pathname.startsWith("/libraries")}
            >
              <NavLink component={Link} to="/libraries/departments" label="Departments" />
              <NavLink component={Link} to="/libraries/suppliers" label="Suppliers" />
              <NavLink component={Link} to="/libraries/units" label="Units" />
              <NavLink component={Link} to="/libraries/brands" label="Brands" />
              <NavLink component={Link} to="/libraries/categories" label="Categories" />
              <NavLink component={Link} to="/libraries/generic-names" label="Generic Names" />
              <NavLink component={Link} to="/libraries/fund-clusters" label="Fund Clusters" />
              <NavLink component={Link} to="/libraries/divisions" label="Divisions" />
            </NavLink>
          </Stack>
        </MantineAppShell.Section>
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>
        <Outlet />
      </MantineAppShell.Main>

      <MantineAppShell.Aside p="sm">
        <RightSideNav />
      </MantineAppShell.Aside>
    </MantineAppShell>
  );
}
