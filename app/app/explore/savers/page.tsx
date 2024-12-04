"use client";
import { fetchJson } from "@/utils/json";
import SaversView from "./SaversView";
import { Saver } from "@/app/explore/types";

interface SaverDetails {
  savers: Saver;
}

interface Savers {
  [key: string]: SaverDetails;
}

export default async function SaversPage() {
  const saversData = await fetchJson("https://vanaheimex.com/api/saversInfo");
  if (!saversData) return null;

  const savers = Object.values(saversData as Savers).map(
    (s) => s.savers as Saver,
  );

  return <SaversView savers={savers} />;
}