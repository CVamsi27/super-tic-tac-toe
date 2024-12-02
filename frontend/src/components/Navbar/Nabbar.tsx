import Link from "next/link";

const Navbar = () => {
  return (
    <div className="sticky top-0 flex items-center justify-center">
      <Link href="/" className="font-bold text-2xl my-2">
        Play super tic-tac-toe
      </Link>
    </div>
  );
};

export default Navbar;
