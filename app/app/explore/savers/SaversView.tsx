"use client";

import { Saver } from "@/app/explore/Explore";
import SaverVaults from "@/app/explore/savers/SaverVaults";
import ExploreNav from "../components/ExploreNav";

interface SaversViewProps {
  savers: Saver[];
}

export default function SaversView({ savers }: SaversViewProps) {
  return (
    <main className="mx-16">
      <ExploreNav />
      <SaverVaults savers={savers} />
    </main>
  );
}