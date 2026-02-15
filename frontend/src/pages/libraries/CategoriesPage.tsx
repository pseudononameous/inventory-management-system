import LibraryCrudPage from "@components/libraries/LibraryCrudPage";
import { categoriesApi } from "@services/api";

export default function CategoriesPage() {
  return (
    <LibraryCrudPage
      title="Categories"
      api={categoriesApi}
      queryKey="categories"
    />
  );
}
