import LibraryCrudPage from "@components/libraries/LibraryCrudPage";
import { suppliersApi } from "@services/api";

export default function SuppliersPage() {
  return (
    <LibraryCrudPage
      title="Suppliers"
      api={suppliersApi}
      queryKey="suppliers"
    />
  );
}
