"use client";
import React, { useState, useEffect } from "react";
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Save, X, User2, MapPin, Phone } from 'lucide-react';
import toast from "react-hot-toast";
import getAvatarText from "@/common/utils/get-avatar-text";
import { UserData } from "@/drizzle/schema";
import { auth } from '@/common/lib/auth';
import { useActionState } from "react";
import { ServerActionType } from "@/common/types/api";
import updateProfileAction from "@/app/actions/auth/update-profile.action";

export type SessionType = Awaited<ReturnType<typeof auth.api.getSession>>;

interface UserProfileData {
  username: string;
  address: string;
  phoneNumber: string;
}



export default function ProfileForm({ userData, session }: { userData: UserData, session: SessionType }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfileData>({
    username: session?.user?.name || '',
    address: userData?.address || '',
    phoneNumber: userData?.phone || '',
  });
  const [originalProfile, setOriginalProfile] = useState<UserProfileData>(profile);

  const [state, formAction, isPending] = useActionState<ServerActionType, FormData>(
    updateProfileAction,
    null
  );


  useEffect(() => {
    if (state?.status === "success") {
      toast.success(state.message || "Profile updated successfully!");
      setIsEditing(false);
      setOriginalProfile(profile);
    } else if (state?.status === "error") {
      toast.error(state.error ?? "Failed to update profile. Please try again.");
    }
  }, [state, profile]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };


  const handleEdit = () => {
    setIsEditing(true);
    setOriginalProfile(profile);
  };


  const handleCancel = () => {
    setIsEditing(false);
    setProfile(originalProfile);
    toast.error("Changes cancelled.");
  };


  return (
    <>
      <div className="flex flex-col items-center justify-center p-14 mt-10">
        <Card className="w-full max-w-lg shadow-lg rounded-xl">
          <CardHeader className="text-center rounded-t-xl">
            <div className="mx-auto flex items-center justify-center">
              <Avatar className="size-22 cursor-pointer border-4 border-secondary">
                {session?.user?.image ? (
                  <AvatarImage src={session?.user?.image!} alt="user profile" />
                ) : (
                  <AvatarFallback className="text-4xl font-bold">
                    {getAvatarText(session?.user?.name || "User")}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <CardTitle className="text-3xl font-bold">User Profile</CardTitle>
            <CardDescription>
              View and manage your personal information.
            </CardDescription>
          </CardHeader>

          <Form action={formAction}>
            <CardContent className="space-y-6">
              {state?.status === "error" && state.error && (
                <div className="mb-4 p-3 text-sm text-destructive bg-destructive-foreground border border-destructive rounded-md">
                  {state.error}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="username" className="text-sm font-medium flex items-center">
                  <User2 className="size-4 mr-1" /> Username
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={profile.username}
                  onChange={handleChange}
                  disabled={!isEditing || isPending}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address" className="text-sm font-medium flex items-center">
                  <MapPin className="size-4 mr-1" /> Address
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  disabled={!isEditing || isPending}
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium flex items-center">
                  <Phone className="size-4 mr-1" /> Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={profile.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing || isPending}
                />
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-3 mt-5">
              {!isEditing ? (
                <Button
                  type="button"
                  onClick={handleEdit}
                >
                  <Pencil className="size-4" /> Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isPending}
                  >
                    <X className="size-4" /> Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? "Saving..." : <><Save className="size-4" /> Save Changes</>}
                  </Button>
                </>
              )}
            </CardFooter>
          </Form>
        </Card>
      </div>
    </>
  );
}
