import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ExploreNav() {
  const pathname = usePathname();
  const isPoolsActive = pathname.startsWith("/explore/pools");

  return (
    <nav className="mb-4">
      <ul className="flex md:space-x-8 space-x-4 font-semibold font-gt-america-exp md:text-2xl text-base">
        <li>
          <Link
            href="/explore/pools"
            className={`pb-2 no-underline ${
              isPoolsActive
                ? "text-gray-900 font-bold"
                : "text-gray-400 hover:text-gray-700 font-medium"
            }`}
          >
            LIQUIDITY POOLS
          </Link>
        </li>
      </ul>
    </nav>
  );
}
