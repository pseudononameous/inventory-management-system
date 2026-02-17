import { NavLink, useLocation } from "react-router-dom";
import { Stack, ActionIcon, Tooltip } from "@mantine/core";
import { IconBuilding, IconBuildingStore, IconTags, IconCategory, IconBadge, IconScaleOutline, IconChartPie, IconSitemap } from "@tabler/icons-react";

const items = [
  { label: "Departments", to: "/libraries/departments", Icon: IconBuilding },
  { label: "Suppliers", to: "/libraries/suppliers", Icon: IconBuildingStore },
  { label: "Units", to: "/libraries/units", Icon: IconScaleOutline },
  { label: "Brands", to: "/libraries/brands", Icon: IconBadge },
  { label: "Categories", to: "/libraries/categories", Icon: IconCategory },
  { label: "Generic Names", to: "/libraries/generic-names", Icon: IconTags },
  { label: "Fund Clusters", to: "/libraries/fund-clusters", Icon: IconChartPie },
  { label: "Divisions", to: "/libraries/divisions", Icon: IconSitemap },
] as const;

export default function RightSideNav() {
  const location = useLocation();
  return (
    <Stack align="center" gap={6}>
      {items.map(({ label, to, Icon }) => {
        const isActive = location.pathname === to;
        return (
          <Tooltip key={to} label={label} position="left" offset={10}>
            <ActionIcon
              variant={isActive ? "filled" : "light"}
              size={34}
              radius="md"
              component={NavLink}
              to={to}
              color={isActive ? "primary" : "gray"}
              style={{ transition: "all 0.15s ease" }}
            >
              <Icon size={18} />
            </ActionIcon>
          </Tooltip>
        );
      })}
    </Stack>
  );
}
