"use client";
import resetPasswordAction from "@/app/actions/auth/reset-password.action";
import { Button } from "@/components/ui/button";
import Form from 'next/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import toast from "react-hot-toast";
import { devLogger } from "@/common/utils/dev-logger";
import { ServerActionType } from "@/common/types/api";
import { redirect, useRouter } from "next/navigation";



export default function ResetPasswordPage({
  token,
  callbackURL,
}: {
  token: string;
  callbackURL: string;
}) {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<ServerActionType, FormData>(
    resetPasswordAction,
    null
  );


  useEffect(() => {
    if (state?.status === "success") {
      toast.success(state.message || "Your password has been reset successfully!");
      redirect(callbackURL);
    } else if (state?.status === "error") {
      devLogger.error("Error during password reset", state.error);
      toast.error(state.error ?? "Failed to reset password. Please try again.");
    }
  }, [state, token, router, callbackURL]);


  return (
    <div className="relative max-w-7xl mx-auto">
      <div className="absolute top-4 left-4 z-10">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/forgot-password">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Request Link
          </Link>
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center px-4">
        <Card className="w-full mt-40 max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
              <LockKeyhole className="h-6 w-6 text-secondary-foreground" />
            </div>
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>
              Enter your new password below to reset your account.
            </CardDescription>
          </CardHeader>

          <Form action={formAction}>
            <CardContent>
              <div className="grid gap-4">
                <input type="hidden" name="token" value={token || ''} />

                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    required
                    disabled={isPending || !token}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    required
                    disabled={isPending || !token}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-3 mt-5">
              <Button
                type="submit"
                className="w-full"
                disabled={isPending || !token}
              >
                {isPending ? "Resetting Password..." : "Reset Password"}
              </Button>
            </CardFooter>
          </Form>
        </Card>
      </div>
    </div>
  );
}
