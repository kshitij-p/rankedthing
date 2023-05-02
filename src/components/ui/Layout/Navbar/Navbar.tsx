import Link from "next/link";
import AuthButton from "~/components/util/AuthButton";

const Navbar = () => {
  return (
    <header>
      <nav className="flex items-center justify-evenly p-4 text-lg md:text-2xl [&>*]:shrink-0">
        <b>RankedThing</b>

        <ul className="flex items-center gap-4 md:gap-16">
          {/* To do make the clips page */}
          <li>
            <Link href={"/"}>Clips</Link>
          </li>
          {/* To do make the about page */}
          <li>
            <Link href={"/"}>About</Link>
          </li>
          <li>
            <AuthButton
              className="max-sm:p-2 md:p-6"
              variants={{ type: "secondary", size: "sm" }}
            />
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
