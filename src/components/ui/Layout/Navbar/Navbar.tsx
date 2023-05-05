import { LogIn, LogOut, Menu } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import NoiseFilter from "~/components/util/NoiseFilter";
import Drawer from "../../Drawer";

const Navbar = () => {
  const { data } = useSession();

  const noiseFilterRef = useRef<SVGSVGElement | null>(null);

  const drawerLinks = [
    { children: "Clips", href: "/clips" },
    /* To do make the aobut page */
    { children: "About", href: "/" },
  ];

  const handleAuth = () => (data ? void signOut() : void signIn("google"));

  useEffect(() => {
    const debounce = (fn: (...params: unknown[]) => void) => {
      let frame: number;

      return (...params: unknown[]) => {
        if (frame) {
          cancelAnimationFrame(frame);
        }

        frame = requestAnimationFrame(() => {
          fn(...params);
        });
      };
    };

    const storeScroll = debounce(() => {
      if (!noiseFilterRef.current) {
        return;
      }
      noiseFilterRef.current.dataset.scroll = `${window.scrollY}`;
    });

    document.addEventListener("scroll", storeScroll, { passive: true });

    //Initialise scroll pos
    storeScroll();

    return function cleanup() {
      document.removeEventListener("scroll", storeScroll);
    };
  }, []);

  return (
    <header className="sticky inset-0 z-[1300] bg-slate-900/10 backdrop-blur-sm">
      <NoiseFilter
        className="will-change-opacity opacity-25 mix-blend-soft-light transition-opacity data-[scroll='0']:opacity-0"
        data-scroll={"0"}
        ref={noiseFilterRef}
      />
      <nav className="flex items-center justify-between px-8 py-4 text-lg md:justify-evenly md:text-xl [&>*]:shrink-0">
        <Link className="text-2xl hover:text-teal-200" href={"/"}>
          <b>RankedThing</b>
        </Link>
        <ul className="flex items-center gap-4 md:gap-16">
          {drawerLinks.map((link, index) => {
            return (
              <li className="hidden md:block" key={index}>
                <Link className="hover:text-teal-200" href={link.href}>
                  {link.children}
                </Link>
              </li>
            );
          })}

          <li>
            <button
              className="flex items-center justify-center hover:text-teal-200"
              onClick={handleAuth}
            >
              <span className="md:hidden">{data ? <LogOut /> : <LogIn />}</span>
              <span className="hidden md:inline">
                {data ? "Sign out" : "Sign in"}
              </span>
            </button>
          </li>

          <li className="inline-flex items-center justify-center md:hidden">
            <Drawer trigger={<Menu />}>
              <div className="flex flex-col gap-8 p-2 text-2xl">
                {drawerLinks.map((link, index) => {
                  return (
                    <Link
                      className="hover:text-teal-200"
                      key={index}
                      href={link.href}
                    >
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
