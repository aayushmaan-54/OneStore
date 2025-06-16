/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { ModeToggle } from "./mode-toggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { auth } from "../lib/auth";
import { useEffect, useState } from "react";
import authClient from "../lib/auth-client";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import getAvatarText from "../utils/get-avatar-text";
import { ShoppingCartIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCart } from "../hooks/use-cart";

export type SessionType = Awaited<ReturnType<typeof auth.api.getSession>>;



export default function HeaderRight({ session, isAdmin }: { session: SessionType, isAdmin: boolean }) {
  const [currentSession, setCurrentSession] = useState(session);
  const { cartCount, isLoading: _loadingCart } = useCart();
  const router = useRouter();


  useEffect(() => {
    setCurrentSession(session);
  }, [session]);


  const handleLogout = async () => {
    const res = await authClient.signOut();
    if (res.error) {
      toast.error(res.error.message || "Something went wrong.");
    } else {
      setCurrentSession(null);
      toast.success("Logged out successfully.");
      router.push("/login");
    }
  }


  return (
    <div className="flex items-center gap-4">
      {currentSession && isAdmin &&
        <Button asChild variant="link">
          <Link href='/admin/products'>Admin Dashboard</Link>
        </Button>
      }

      {currentSession && (
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          asChild
        >
          <Link href="/cart">
            <ShoppingCartIcon className="h-6 w-6" />
            {cartCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full"
              >
                {cartCount}
              </Badge>
            )}
          </Link>
        </Button>
      )}

      <ModeToggle />

      {currentSession ? (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="size-10 cursor-pointer">
              {currentSession.user.image ? (
                <AvatarImage src={currentSession.user.image!} alt="user profile" />
              ) : (
                <AvatarFallback>
                  {getAvatarText(currentSession?.user?.name)}
                </AvatarFallback>
              )}
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <Link href="/profile" className="w-full">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/orders" className="w-full">Orders</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/cart" className="w-full">Cart</Link>
            </DropdownMenuItem>
            {currentSession && isAdmin &&
              <DropdownMenuItem>
                <Link href="/admin/products" className="w-full">Admin Dashboard*</Link>
              </DropdownMenuItem>
            }
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

      ) : (
        <Button asChild className="font-semibold">
          <Link href="/login">Login</Link>
        </Button>
      )}
    </div>
  );
}
