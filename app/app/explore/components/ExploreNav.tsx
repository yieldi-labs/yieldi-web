import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ExploreNav() {
  const pathname = usePathname();
  const isPoolsActive = pathname.startsWith('/explore/pools');
  const isSaversActive = pathname.startsWith('/explore/savers');

  return (
    <nav className="mb-4">
      <ul className="flex space-x-8 font-semibold font-gt-america-exp text-2xl">
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
        <li>
          <Link
            href="/explore/savers"
            className={`pb-2 no-underline ${
              isSaversActive
                ? "text-gray-900 font-bold"
                : "text-gray-400 hover:text-gray-700 font-medium"
            }`}
          >
            SAVER VAULTS
          </Link>
        </li>
      </ul>
    </nav>
  );
}
