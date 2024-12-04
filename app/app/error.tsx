"use client";

import { useEffect } from "react";
import Button from "./button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="text-center py-16">
      <h2 className="text-xl font-bold red mb-4">Something went wrong!</h2>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  );
}
