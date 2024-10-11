import Image from "next/image";
import Link from "next/link";

const Brand = () => (
  <Link href="/" className="flex justify-center align-middle mr-5">
    <Image src="/logo.svg" alt="Yieldi Logo" width="96" height="20" className="lg:w-[160px] lg:h-[34px]" />
  </Link>
);
export default Brand;
