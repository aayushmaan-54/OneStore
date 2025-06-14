import Link from "next/link";
import HeaderRight from "./header-right";
import checkAuth from "../utils/check-auth";
import isAdmin from "../utils/is-admin";


export default async function Header() {
  const session = await checkAuth();
  const isAdminRole = await isAdmin();

  return (
    <>
    <header className="w-full">
      <div className="flex items-center justify-between p-4 border-b border-b-accent max-w-7xl mx-auto">
        <div>
          <Link
            href='/'
            className="font-bold text-2xl"
          >
            OneStore 🛍️
          </Link>
        </div>

        <div>
          <HeaderRight
            session={session}
            isAdmin={isAdminRole}
          />
        </div>
      </div>
      </header>
    </>
  );
}
