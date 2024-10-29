"use client";

import { Saver } from "@/app/explore/types";
import ExploreNav from "../components/ExploreNav";
import SaverVaults from "./SaverVaults";

interface SaversViewProps {
  savers: Saver[];
}

export default function SaversView({ savers }: SaversViewProps) {
  return (
    <main className="md:mx-16">
      <ExploreNav />
      <SaverVaults savers={savers} />
    </main>
  );
}
