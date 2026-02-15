import LibraryCrudPage from "@components/libraries/LibraryCrudPage";
import { brandsApi } from "@api/libraries";

export default function BrandsPage() {
  return (
    <LibraryCrudPage
      title="Brands"
      api={brandsApi}
      queryKey="brands"
    />
  );
}
