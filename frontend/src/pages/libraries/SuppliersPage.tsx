import LibraryCrudPage from "@components/libraries/LibraryCrudPage";
import { suppliersApi } from "@api/libraries";

export default function SuppliersPage() {
  return (
    <LibraryCrudPage
      title="Suppliers"
      api={suppliersApi}
      queryKey="suppliers"
    />
  );
}
