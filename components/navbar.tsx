"use client";

import Link from "next/link";
import {Button} from "@/components/ui/button";
import SignOutButton from "./signout-button";
import { Session } from "@/auth";

export default function Navbar({session}: {session: Session | null}) {

  return (
    <nav className="flex justify-between items-center py-3 px-4 fixed top-0 left-0 right-0 z-50 bg-slate-100">
      <Link href="/" className="text-x1 font-bold">
        Better-auth
      </Link>
      {!session ? (<div className="flex gap-2 justify-center">
        <Link href="/sign-in">
            <Button variant="default">Sign In</Button>
        </Link>
        <Link href="/sign-up">
            <Button variant="default">Sign Up</Button>
        </Link>
      </div>) : (
        <div className="flex items-center gap-2">
          <SignOutButton/>
        </div>
      )}
    </nav>
  );
}
