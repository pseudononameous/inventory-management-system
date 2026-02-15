import LibraryCrudPage from "@components/libraries/LibraryCrudPage";
import { fundClustersApi } from "@api/libraries";

export default function FundClustersPage() {
  return (
    <LibraryCrudPage
      title="Fund Clusters"
      api={fundClustersApi}
      queryKey="fund-clusters"
    />
  );
}
