import { fetchJson } from "@/utils/json";
import SaversView from "./SaversView";
import { Saver } from "@/app/explore/types";
import { getStats } from "@/midgard";

interface SaverDetails {
  savers: Saver;
}

interface Savers {
  [key: string]: SaverDetails;
}

export default async function SaversPage() {
  const [saversData, statsData] = await Promise.all([
    fetchJson("https://vanaheimex.com/api/saversInfo"),
    getStats(),
  ]);
  if (!saversData || !statsData.data) return null;

  const savers = Object.values(saversData as Savers).map(
    (s) => s.savers as Saver,
  );

  return <SaversView savers={savers} stats={statsData.data} />;
}
