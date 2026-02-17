import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { Table, TextInput, Textarea, Select, Switch, Stack } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";
import { FilterInput, FilterSelect } from "@components/filters";
import type { SelectOptionType } from "@components/filters";
import { PageHeader, ActionButtons, CrudModal } from "@components/ui";
import { DataTable } from "@components/tables";
import { notifications } from "@mantine/notifications";
import { useRequisitionsQuery } from "@hooks/queries/requisitions/useRequisitionsQuery";
import { useRequisitionMutation } from "@hooks/mutations/requisitions/useRequisitionMutation";
import { useLibraryListQuery } from "@hooks/queries/libraries/useLibraryListQuery";
import { departmentsApi } from "@api/libraries";
import type { Requisition } from "@api/requisitions";
import { requisitionPayloadSchema } from "@schemas/requisition";

const initialForm = { ris_no: "", department_id: 0, requested_by: "", designation: "", purpose: "", with_inspection: false };
type TabValue = "pending" | "for-dispensing" | "dispensed";

export default function RequisitionsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegment = location.pathname.split("/").filter(Boolean);
  const tab = (pathSegment[2] as TabValue) || "pending";

  const [opened, setOpened] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [risNo, setRisNo] = useState("");
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [requestedBy, setRequestedBy] = useState("");
  const [designation, setDesignation] = useState("");
  const [debouncedRisNo] = useDebouncedValue(risNo, 300);
  const [debouncedRequestedBy] = useDebouncedValue(requestedBy, 300);
  const [debouncedDesignation] = useDebouncedValue(designation, 300);

  const isForDispenseParam = tab === "pending" ? 0 : tab === "for-dispensing" ? 1 : undefined;
  const isDispenseParam = tab === "dispensed" ? 1 : undefined;

  const { data, isLoading } = useRequisitionsQuery({
    pageSize: 100,
    ...(isForDispenseParam !== undefined && { is_for_dispense: isForDispenseParam }),
    ...(isDispenseParam !== undefined && { is_dispense: isDispenseParam }),
    ris_no: debouncedRisNo || undefined,
    department_id: departmentId ? Number(departmentId) : undefined,
    requested_by: debouncedRequestedBy || undefined,
    designation: debouncedDesignation || undefined,
  });

  const { data: departments = [] } = useLibraryListQuery("departments", departmentsApi, { pageSize: 200 });
  const { create, update, remove } = useRequisitionMutation();

  const openCreate = () => { setEditingId(null); setForm(initialForm); setOpened(true); };
  const openEdit = (r: Requisition) => { setEditingId(r.id); setForm({ ris_no: r.ris_no, department_id: r.department_id, requested_by: r.requested_by, designation: r.designation, purpose: r.purpose ?? "", with_inspection: r.with_inspection }); setOpened(true); };
  const closeModal = () => { setOpened(false); setEditingId(null); setForm(initialForm); };

  const handleSave = () => {
    const parsed = requisitionPayloadSchema.safeParse({ ...form, ris_no: form.ris_no.trim(), requested_by: form.requested_by.trim(), designation: form.designation.trim(), purpose: form.purpose?.trim() ?? "" });
    if (!parsed.success) { notifications.show({ title: "Validation", message: parsed.error.issues[0]?.message ?? "Invalid form", color: "red" }); return; }
    const payload = { ...parsed.data, purpose: parsed.data.purpose ?? "" };
    if (editingId !== null) update.mutate({ id: editingId, payload }, { onSettled: closeModal });
    else create.mutate(payload, { onSuccess: (res) => { closeModal(); const created = res?.data?.data as Requisition | undefined; if (created?.id) navigate(`/requisitions/${created.id}`); } });
  };

  const requisitions = (data ?? []) as Requisition[];
  const departmentsOpts: SelectOptionType[] = departments.map((d) => ({ value: String(d.id), label: d.name }));

  const tabTitles: Record<TabValue, string> = { pending: "Pending Requisitions", "for-dispensing": "For Dispensing", dispensed: "Dispensed" };
  const tabSubtitles: Record<TabValue, string> = { pending: "Create and manage pending requisitions", "for-dispensing": "Requisitions ready for dispensing", dispensed: "Dispensed requisitions" };

  return (
    <Stack gap="xl">
      <PageHeader title={tabTitles[tab]} subtitle={tabSubtitles[tab]} actionLabel={tab === "pending" ? "New Requisition" : undefined} onAction={tab === "pending" ? openCreate : undefined} />
      <DataTable<Requisition>
        columns={[
          { key: "ris_no", header: "RIS No" },
          { key: "department", header: "Department", render: (r) => r.department?.name ?? "—" },
          { key: "requested_by", header: "Requested by" },
          { key: "designation", header: "Designation" },
          { key: "with_inspection", header: "With inspection", render: (r) => r.with_inspection ? "Yes" : "No" },
        ]}
        data={requisitions}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        emptyMessage="No requisitions yet. Create one to get started."
        filterRow={
          <>
            <Table.Th><FilterInput name="ris_no" placeholder="RIS No" value={risNo} onChange={(e) => setRisNo(e.target.value)} /></Table.Th>
            <Table.Th><FilterSelect name="Department" data={departmentsOpts} value={departmentId} onChange={setDepartmentId} placeholder="Department" /></Table.Th>
            <Table.Th><FilterInput name="requested_by" placeholder="Requested by" value={requestedBy} onChange={(e) => setRequestedBy(e.target.value)} /></Table.Th>
            <Table.Th><FilterInput name="designation" placeholder="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} /></Table.Th>
            <Table.Th />
          </>
        }
        actions={(r) => <ActionButtons viewTo={`/requisitions/${r.id}`} viewTitle="View / Items" onEdit={() => openEdit(r)} onDelete={() => remove.mutate(r.id)} />}
      />
      <CrudModal opened={opened} onClose={closeModal} title={editingId ? "Edit Requisition" : "New Requisition"} onSave={handleSave} isSaving={create.isPending || update.isPending} submitLabel={editingId ? "Update" : "Create"}>
        <TextInput label="RIS No" required value={form.ris_no} onChange={(e) => setForm((f) => ({ ...f, ris_no: e.target.value }))} placeholder="e.g. RIS-2025-001" radius="md" />
        <Select label="Department" required placeholder="Select department" data={departments.map((d) => ({ value: String(d.id), label: d.name }))} value={form.department_id ? String(form.department_id) : null} onChange={(v) => setForm((f) => ({ ...f, department_id: v ? Number(v) : 0 }))} radius="md" />
        <TextInput label="Requested by" required value={form.requested_by} onChange={(e) => setForm((f) => ({ ...f, requested_by: e.target.value }))} placeholder="Name of requester" radius="md" />
        <TextInput label="Designation" required value={form.designation} onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))} placeholder="Job title / role" radius="md" />
        <Textarea label="Purpose" value={form.purpose} onChange={(e) => setForm((f) => ({ ...f, purpose: e.target.value }))} placeholder="Optional purpose" minRows={2} radius="md" />
        <Switch label="With inspection" checked={form.with_inspection} onChange={(e) => setForm((f) => ({ ...f, with_inspection: e.currentTarget.checked }))} />
      </CrudModal>
    </Stack>
  );
}
