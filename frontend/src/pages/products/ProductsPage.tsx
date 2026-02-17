import { useState } from "react";
import { useDebouncedValue } from "@mantine/hooks";
import { Table, TextInput, Textarea, Stack, Select, NumberInput } from "@mantine/core";
import { FilterInput, FilterSelect } from "@components/filters";
import type { SelectOptionType } from "@components/filters";
import { PageHeader, ActionButtons, CrudModal } from "@components/ui";
import { DataTable } from "@components/tables";
import { notifications } from "@mantine/notifications";
import { useProductsQuery } from "@hooks/queries/products/useProductsQuery";
import { useProductMutation } from "@hooks/mutations/products/useProductMutation";
import { useLibraryListQuery } from "@hooks/queries/libraries/useLibraryListQuery";
import { unitsApi, categoriesApi, fundClustersApi, genericNamesApi } from "@api/libraries";
import type { Product, ProductPayload } from "@api/products";
import { productPayloadSchema } from "@schemas/product";

const PAGE_SIZE = 10;
const initialForm: ProductPayload = { name: "", description: "", unit_id: 0, category_id: 0, fund_cluster_id: 0, generic_name_id: null, critical_level: null };

export default function ProductsPage() {
  const [opened, setOpened] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [productCode, setProductCode] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [fundClusterId] = useState<string | null>(null);
  const [genericNameId] = useState<string | null>(null);
  const [debouncedName] = useDebouncedValue(name, 300);
  const [debouncedDescription] = useDebouncedValue(description, 300);
  const [debouncedProductCode] = useDebouncedValue(productCode, 300);
  const [form, setForm] = useState<ProductPayload>(initialForm);

  const { data: listResponse, isLoading } = useProductsQuery({ page, pageSize: PAGE_SIZE, name: debouncedName || undefined, description: debouncedDescription || undefined, product_code: debouncedProductCode || undefined, category_id: categoryId ? Number(categoryId) : undefined, fund_cluster_id: fundClusterId ? Number(fundClusterId) : undefined, generic_name_id: genericNameId ? Number(genericNameId) : undefined });
  const { data: units = [] } = useLibraryListQuery("units", unitsApi, { pageSize: 200 });
  const { data: categories = [] } = useLibraryListQuery("categories", categoriesApi, { pageSize: 200 });
  const { data: fundClusters = [] } = useLibraryListQuery("fund-clusters", fundClustersApi, { pageSize: 200 });
  const { data: genericNames = [] } = useLibraryListQuery("generic-names", genericNamesApi, { pageSize: 200 });
  const { create, update, remove } = useProductMutation();

  const resetForm = () => setForm(initialForm);
  const openCreate = () => { setEditingId(null); resetForm(); setOpened(true); };
  const openEdit = (p: Product) => { setEditingId(p.id); setForm({ name: p.name, description: p.description ?? "", unit_id: p.unit_id, category_id: p.category_id, fund_cluster_id: p.fund_cluster_id, generic_name_id: p.generic_name_id ?? null, critical_level: p.critical_level != null ? Number(p.critical_level) : null }); setOpened(true); };
  const closeModal = () => { setOpened(false); setEditingId(null); resetForm(); };

  const handleSave = () => {
    const parsed = productPayloadSchema.safeParse({ name: form.name.trim(), description: form.description?.trim() || null, unit_id: form.unit_id, category_id: form.category_id, fund_cluster_id: form.fund_cluster_id, generic_name_id: form.generic_name_id || null, critical_level: form.critical_level ?? null });
    if (!parsed.success) { notifications.show({ title: "Validation", message: parsed.error.issues[0]?.message ?? "Invalid form", color: "red" }); return; }
    const payload = { ...parsed.data };
    if (editingId !== null) update.mutate({ id: editingId, payload }, { onSettled: closeModal });
    else create.mutate(payload, { onSettled: closeModal });
  };

  const products = listResponse?.data ?? [];
  const meta = listResponse?.meta;
  const totalPages = meta?.last_page ?? 1;
  const categoriesOpts: SelectOptionType[] = categories.map((c) => ({ value: String(c.id), label: c.name }));

  return (
    <Stack gap="xl">
      <PageHeader title="Product Profiles" subtitle="Manage product catalog and stock" actionLabel="Add Product" onAction={openCreate} />
      <DataTable<Product>
        columns={[
          { key: "product_code", header: "Code" },
          { key: "name", header: "Name" },
          { key: "category", header: "Category", render: (r) => r.category?.name ?? "—" },
          { key: "unit", header: "Unit", render: (r) => r.unit?.name ?? "—" },
          { key: "critical_level", header: "Critical Level", render: (r) => r.critical_level != null ? String(r.critical_level) : "—" },
        ]}
        data={products}
        keyExtractor={(r) => r.id}
        isLoading={isLoading}
        filterRow={
          <>
            <Table.Th><FilterInput name="product_code" placeholder="Code" value={productCode} onChange={(e) => setProductCode(e.target.value)} /></Table.Th>
            <Table.Th><FilterInput name="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} /></Table.Th>
            <Table.Th><FilterSelect name="Category" data={categoriesOpts} value={categoryId} onChange={setCategoryId} placeholder="Category" /></Table.Th>
            <Table.Th><FilterInput name="description" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} /></Table.Th>
            <Table.Th />
          </>
        }
        actions={(p) => <ActionButtons viewTo={`/products/${p.id}`} viewTitle="View / Stocks" onEdit={() => openEdit(p)} onDelete={() => remove.mutate(p.id)} />}
        page={page}
        totalPages={meta && meta.total > PAGE_SIZE ? totalPages : undefined}
        onPageChange={setPage}
      />
      <CrudModal opened={opened} onClose={closeModal} title={editingId ? "Edit Product" : "New Product"} onSave={handleSave} isSaving={create.isPending || update.isPending} submitLabel={editingId ? "Update" : "Create"}>
        <TextInput label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Product name" radius="md" />
        <Textarea label="Description" value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional description" minRows={2} radius="md" />
        <Select label="Unit" required placeholder="Select unit" data={units.map((u) => ({ value: String(u.id), label: u.name }))} value={form.unit_id ? String(form.unit_id) : null} onChange={(v) => setForm((f) => ({ ...f, unit_id: v ? Number(v) : 0 }))} radius="md" />
        <Select label="Category" required placeholder="Select category" data={categories.map((c) => ({ value: String(c.id), label: c.name }))} value={form.category_id ? String(form.category_id) : null} onChange={(v) => setForm((f) => ({ ...f, category_id: v ? Number(v) : 0 }))} radius="md" />
        <Select label="Fund Cluster" required placeholder="Select fund cluster" data={fundClusters.map((fc) => ({ value: String(fc.id), label: fc.name }))} value={form.fund_cluster_id ? String(form.fund_cluster_id) : null} onChange={(v) => setForm((f) => ({ ...f, fund_cluster_id: v ? Number(v) : 0 }))} radius="md" />
        <Select label="Generic Name" placeholder="Optional" clearable data={genericNames.map((g) => ({ value: String(g.id), label: g.name }))} value={form.generic_name_id != null ? String(form.generic_name_id) : null} onChange={(v) => setForm((f) => ({ ...f, generic_name_id: v ? Number(v) : null }))} radius="md" />
        <NumberInput label="Critical Level" min={0} decimalScale={2} value={form.critical_level ?? ""} onChange={(v) => setForm((f) => ({ ...f, critical_level: typeof v === "number" ? v : null }))} placeholder="Optional" radius="md" />
      </CrudModal>
    </Stack>
  );
}
