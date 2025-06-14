"use client";
import { Button } from "@/components/ui/button";
import Form from 'next/form';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useActionState, useState, useEffect } from "react";
import authClient from "@/common/lib/auth-client";
import { ErrorContext } from "better-auth/react";
import { devLogger } from "@/common/utils/dev-logger";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ServerActionType } from "@/common/types/api";
import signupAction from "@/app/actions/auth/sign-up.action";



export default function SignUpPage() {
  const [requestPending, setRequestPending] = useState(false);
  const [state, formAction, isPending] = useActionState<ServerActionType, FormData>(
    signupAction,
    null
  );
  const router = useRouter();


  useEffect(() => {
    if (state?.status === "success") {
      toast.success(state.message || "Account created successfully! Please check your email to verify your account.");
    } else if (state?.status === "error") {
      devLogger.error("Error in form submission", state.error);
      toast.error(state.error ?? "Something went wrong during signup.");
    }
  }, [state, router]);


  const handleGoogleLogin = async () => {
    authClient.signIn.social({
      provider: 'google',
      callbackURL: process.env.NEXT_PUBLIC_AUTH_REDIRECT!,
    }, {
      onRequest: () => {
        setRequestPending(true);
      },
      onSuccess: () => {
        setRequestPending(false);
        router.push(process.env.NEXT_PUBLIC_AUTH_REDIRECT!);
      },
      onError: (ctx: ErrorContext) => {
        devLogger.error("Google signup error", ctx);
        toast.error(ctx.error.message ?? "Something went wrong during Google signup.");
        setRequestPending(false);
      },
    });
  }


  const handleGitHubLogin = async () => {
    authClient.signIn.social({
      provider: 'github',
      callbackURL: process.env.NEXT_PUBLIC_AUTH_REDIRECT!,
    }, {
      onRequest: () => {
        setRequestPending(true);
      },
      onSuccess: () => {
        setRequestPending(false);
        router.push(process.env.NEXT_PUBLIC_AUTH_REDIRECT!);
      },
      onError: (ctx: ErrorContext) => {
        devLogger.error("GitHub signup error", ctx.error);
        toast.error(ctx.error.message ?? "Something went wrong during GitHub signup.");
        setRequestPending(false);
      },
    });
  }


  return (
    <div className="relative max-w-7xl mx-auto">
      <div className="absolute top-4 left-4 z-10">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center px-4">
        <Card className="w-full mt-40 max-w-sm">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Enter your details below to create your account
            </CardDescription>
            <CardAction>
              <Button variant="link" asChild>
                <Link href="/login">Login</Link>
              </Button>
            </CardAction>
          </CardHeader>

          <Form action={formAction}>
            <CardContent>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="john_doe"
                    required
                    disabled={isPending || requestPending}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    disabled={isPending || requestPending}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    disabled={isPending || requestPending}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 mt-5">
              <Button type="submit" className="w-full" disabled={isPending || requestPending}>
                {isPending ? "Creating account..." : "Sign Up"}
              </Button>

              <Button variant="outline" className="w-full" type="button" onClick={handleGoogleLogin} disabled={isPending || requestPending}>
                Sign Up with Google
              </Button>
              <Button variant="outline" className="w-full" type="button" onClick={handleGitHubLogin} disabled={isPending || requestPending}>
                Sign Up with GitHub
              </Button>
            </CardFooter>
          </Form>
        </Card>
      </div>
    </div >
  );
}
