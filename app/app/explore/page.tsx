import { getPools, getStats } from "@/midgard";
import Explore, { Saver } from "./Explore";
import { fetchJson } from "@/utils/json";

interface SaverDetails {
  savers: Saver;
}

interface Savers {
  [key: string]: SaverDetails;
}

const ExplorePage = async () => {
  try {
    const [poolsData, statsData, saversData] = await Promise.all([
      getPools(),
      getStats(),
      fetchJson("https://vanaheimex.com/api/saversInfo"),
    ]);

    // TODO(matt): handle no data
    if (!poolsData.data) return;
    if (!statsData.data) return;
    if (!saversData) return;

    const savers = Object.values(saversData as Savers).map(
      (s) => s.savers as Saver,
    );
    return (
      <Explore pools={poolsData.data} stats={statsData.data} savers={savers} />
    );
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export default ExplorePage;
