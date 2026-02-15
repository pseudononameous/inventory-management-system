import LibraryCrudPage from "@components/libraries/LibraryCrudPage";
import { categoriesApi } from "@api/libraries";

export default function CategoriesPage() {
  return (
    <LibraryCrudPage
      title="Categories"
      api={categoriesApi}
      queryKey="categories"
    />
  );
}
