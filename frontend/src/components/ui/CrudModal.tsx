import { Modal, Stack, Button, Group } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

interface CrudModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  isSaving?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
}

const headerBg = "#FFF8EB";

export default function CrudModal({
  opened,
  onClose,
  title,
  children,
  onSave,
  isSaving,
  submitLabel = "Save",
  cancelLabel = "Cancel",
}: CrudModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="md"
      radius="lg"
      centered
      padding={0}
      styles={{
        overlay: { backdropFilter: "blur(6px)", backgroundColor: "rgba(0,0,0,.45)" },
        content: { borderRadius: 12, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,.2)", border: "1px solid var(--mantine-color-gray-2)" },
        header: { padding: "20px 24px", backgroundColor: headerBg, borderBottom: "1px solid rgba(0,0,0,.08)", margin: 0, flex: 1 },
        title: { fontWeight: 700, fontSize: "1.125rem", color: "#1e293b" },
        close: { color: "var(--mantine-color-gray-6)" },
        body: { padding: 0 },
      }}
    >
      <Stack gap={0}>
        <div style={{ padding: "var(--mantine-spacing-xl)", backgroundColor: "#fff" }}>
          {children}
        </div>
        <div
          style={{
            padding: "var(--mantine-spacing-lg)",
            backgroundColor: "#f8fafc",
            borderTop: "1px solid var(--mantine-color-gray-2)",
          }}
        >
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onClose} radius="md" style={{ borderColor: "var(--mantine-color-gray-3)", backgroundColor: "#fff" }}>
              {cancelLabel}
            </Button>
            <Button leftSection={<IconCheck size={18} />} onClick={onSave} loading={isSaving} radius="md" color="orange">
              {submitLabel}
            </Button>
          </Group>
        </div>
      </Stack>
    </Modal>
  );
}
