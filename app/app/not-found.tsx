import { Button } from "@shared/components/ui";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h2 className="text-2xl font-bold mb-6">Page Not Found</h2>
      <Link href="/" passHref>
        <Button>Head home</Button>
      </Link>
    </div>
  );
}
