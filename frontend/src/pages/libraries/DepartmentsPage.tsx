import LibraryCrudPage from "@components/libraries/LibraryCrudPage";
import { departmentsApi } from "@services/api";

export default function DepartmentsPage() {
  return (
    <LibraryCrudPage
      title="Departments"
      api={departmentsApi}
      queryKey="departments"
    />
  );
}
