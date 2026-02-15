import LibraryCrudPage from "@components/libraries/LibraryCrudPage";
import { unitsApi } from "@api/libraries";

export default function UnitsPage() {
  return (
    <LibraryCrudPage
      title="Units"
      api={unitsApi}
      queryKey="units"
    />
  );
}