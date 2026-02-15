import LibraryCrudPage from "@components/libraries/LibraryCrudPage";
import { genericNamesApi } from "@services/api";

export default function GenericNamesPage() {
  return (
    <LibraryCrudPage
      title="Generic Names"
      api={genericNamesApi}
      queryKey="generic-names"
    />
  );
}
