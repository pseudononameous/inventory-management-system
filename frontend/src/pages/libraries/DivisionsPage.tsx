import LibraryCrudPage from "@components/libraries/LibraryCrudPage";
import { divisionsApi } from "@api/libraries";

export default function DivisionsPage() {
  return (
    <LibraryCrudPage
      title="Divisions"
      api={divisionsApi}
      queryKey="divisions"
    />
  );
}
