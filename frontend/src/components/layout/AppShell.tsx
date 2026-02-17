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

function NavItem({ to, label, icon: Icon, isActive, large }: { to: string; label: string; icon: React.ComponentType<{ size?: number }>; isActive: boolean; large: boolean }) {
  const link = (
    <NavLink
      component={Link}
      to={to}
      label={large ? label : null}
      leftSection={<Icon size={large ? 18 : 22} />}
      active={isActive}
      variant="light"
      style={{
        borderRadius: "var(--mantine-radius-md)",
        fontWeight: isActive ? 600 : 500,
        backgroundColor: isActive ? "var(--mantine-color-primary-0)" : undefined,
      }}
    />
  );
  return large ? link : <Tooltip label={label} position="right" offset={8}>{link}</Tooltip>;
}

export default function AppShellLayout() {
  const [opened, { toggle }] = useDisclosure();
  const { width } = useViewportSize();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try { await authApi.logout(); } finally { logout(); navigate("/login"); }
  };

  const large = (width ?? 1200) >= 1338;
  const navbarWidth = large ? 260 : 72;

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
      header={{ height: 64 }}
      navbar={{ width: navbarWidth, breakpoint: "sm", collapsed: { mobile: !opened } }}
      aside={{ width: 64, breakpoint: "sm", collapsed: { desktop: false, mobile: true } }}
      padding="md"
      styles={{
        main: { background: "transparent", minHeight: "100vh" },
        header: {
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--mantine-color-gray-2)",
          boxShadow: "0 1px 3px rgba(0,0,0,.04)",
        },
        navbar: {
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
          borderRight: "1px solid var(--mantine-color-gray-2)",
        },
      }}
    >
      <MantineAppShell.Header>
        <Group justify="space-between" px="lg" h="100%">
          <Group h="100%" gap="xl">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <UnstyledButton component={Link} to="/dashboard" style={{ textDecoration: "none" }}>
              <Group px={12} gap="sm">
                <ThemeIcon size={42} radius="md" style={{ background: "linear-gradient(135deg, var(--mantine-color-primary-6), var(--mantine-color-primary-8))", color: "white", boxShadow: "0 4px 12px rgba(79,70,229,.35)" }}>
                  <Text fw={700} size="xs">OA</Text>
                </ThemeIcon>
                <Box>
                  <Text size="lg" fw={700} c="dark.7">Office Anesthesia</Text>
                  <Text size="xs" c="dimmed" visibleFrom="md">Inventory Management System</Text>
                </Box>
              </Group>
            </UnstyledButton>
          </Group>
          <Menu shadow="lg" width={220} position="bottom-end" radius="md">
            <Menu.Target>
              <Button variant="light" radius="md" leftSection={<IconUser size={18} />}>
                <Text visibleFrom="sm" span>{user?.name ?? "Guest"}</Text>
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconUser style={{ width: rem(16), height: rem(16) }} />} component={Link} to="/my-profile">My Profile</Menu.Item>
              <Menu.Item leftSection={<IconLock style={{ width: rem(16), height: rem(16) }} />} component={Link} to="/change-password">Change Password</Menu.Item>
              <Menu.Divider />
              <Menu.Item leftSection={<IconLogout style={{ width: rem(16), height: rem(16) }} />} color="red" onClick={handleLogout}>Logout</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </MantineAppShell.Header>

      <MantineAppShell.Navbar p={large ? "md" : "xs"}>
        <MantineAppShell.Section grow>
          <Stack gap={4}>
            {NAV_ITEMS.map(({ to, label, icon }) => (
              <NavItem key={to} to={to} label={label} icon={icon} isActive={isActive(to)} large={large} />
            ))}
            <NavLink
              label={large ? "Libraries" : null}
              leftSection={<IconCategory size={large ? 18 : 22} />}
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

      <MantineAppShell.Main><Outlet /></MantineAppShell.Main>
      <MantineAppShell.Aside p="sm"><RightSideNav /></MantineAppShell.Aside>
    </MantineAppShell>
  );
}
