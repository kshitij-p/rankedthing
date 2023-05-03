import { LogIn, LogOut, Menu } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import AuthButton from "~/components/util/AuthButton";
import Drawer from "../../Drawer";

const Navbar = () => {
  const { data } = useSession();

  const drawerLinks = [
    { children: "Clips", href: "/" },
    { children: "About", href: "/" },
  ];

  return (
    <header>
      <nav className="flex items-center justify-between px-8 py-6 text-lg md:justify-evenly md:text-2xl [&>*]:shrink-0">
        <Link className="text-3xl" href={"/"}>
          <b>RankedThing</b>
        </Link>
        <ul className="flex items-center gap-4 md:gap-16">
          {drawerLinks.map((link, index) => {
            return (
              <li className="hidden md:block" key={index}>
                <Link href={link.href}>{link.children}</Link>
              </li>
            );
          })}
          {/* To do make the clips page */}

          <li className="">
            <button className="flex items-center justify-center md:hidden">
              {data ? (
                <LogOut onClick={() => void signOut()} />
              ) : (
                <LogIn onClick={() => void signIn("google")} />
              )}
            </button>
            <AuthButton
              className="hidden max-sm:p-2 md:flex md:p-6"
              variants={{ type: "secondary", size: "sm" }}
            />
          </li>

          <li className="inline-flex items-center justify-center md:hidden">
            <Drawer trigger={<Menu />}>
              <div className="flex flex-col gap-8 p-2 text-2xl">
                {drawerLinks.map((link, index) => {
                  return (
                    <Link key={index} href={link.href}>
                      {link.children}
                    </Link>
                  );
                })}
              </div>
            </Drawer>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
