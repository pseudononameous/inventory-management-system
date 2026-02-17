import { useState } from "react";
import { TextInput, Stack } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { PageHeader, ActionButtons, CrudModal } from "@components/ui";
import { DataTable } from "@components/tables";
import { useLibraryListQuery } from "@hooks/queries/libraries/useLibraryListQuery";
import { useLibraryMutation } from "@hooks/mutations/libraries/useLibraryMutation";
import type { LibraryRecord } from "@api/libraries";
import { libraryNameSchema } from "@schemas/library";

export type LibraryApi = {
  list: (params?: { name?: string; pageSize?: number }) => Promise<{ data: { data: LibraryRecord[] } }>;
  create: (payload: { name: string }) => Promise<unknown>;
  update: (id: number, payload: { name: string }) => Promise<unknown>;
  delete: (id: number) => Promise<unknown>;
};

interface LibraryCrudPageProps {
  title: string;
  api: LibraryApi;
  queryKey: string;
}

export default function LibraryCrudPage({ title, api, queryKey }: LibraryCrudPageProps) {
  const [opened, setOpened] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");

  const { data = [], isLoading } = useLibraryListQuery(queryKey, api, { pageSize: 100 });
  const { create, update, remove } = useLibraryMutation(queryKey, api, title);

  const openCreate = () => { setEditingId(null); setName(""); setOpened(true); };
  const openEdit = (row: LibraryRecord) => { setEditingId(row.id); setName(row.name); setOpened(true); };
  const closeModal = () => { setOpened(false); setEditingId(null); setName(""); };

  const handleSave = () => {
    const parsed = libraryNameSchema.safeParse({ name: name.trim() });
    if (!parsed.success) { notifications.show({ title: "Validation", message: parsed.error.issues[0]?.message ?? "Name is required", color: "red" }); return; }
    if (editingId !== null) update.mutate({ id: editingId, name: parsed.data.name }, { onSettled: closeModal });
    else create.mutate({ name: parsed.data.name }, { onSettled: closeModal });
  };

  const rows = data as LibraryRecord[];
  const singular = title.slice(0, -1);

  return (
    <Stack gap="xl">
      <PageHeader title={title} subtitle={`Manage ${title.toLowerCase()} records`} actionLabel={`Add ${singular}`} onAction={openCreate} />
      <DataTable<LibraryRecord>
        columns={[
          { key: "id", header: "ID" },
          { key: "name", header: "Name" },
        ]}
        data={rows}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        actions={(r) => <ActionButtons onEdit={() => openEdit(r)} onDelete={() => remove.mutate(r.id)} />}
      />
      <CrudModal opened={opened} onClose={closeModal} title={editingId ? `Edit ${singular}` : `New ${singular}`} onSave={handleSave} isSaving={create.isPending || update.isPending} submitLabel={editingId ? "Update" : "Create"}>
        <TextInput label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder={`e.g. ${singular} name`} radius="md" />
      </CrudModal>
    </Stack>
  );
}
