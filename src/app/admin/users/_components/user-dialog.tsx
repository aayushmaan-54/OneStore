/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { User, UserData } from "@/drizzle/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState, FormEvent } from "react";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface UserWithData extends User {
  userData?: UserData;
}

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserWithData | null;
  onSubmit: (userData: any) => void;
  isLoading?: boolean;
}



export default function UserDialog({
  open,
  onOpenChange,
  user,
  onSubmit,
  isLoading = false
}: UserDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    emailVerified: false,
    image: "",
    role: "user" as "admin" | "user",
    phone: "",
    address: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { startUpload, isUploading } = useUploadThing("productImageUploader");


  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        emailVerified: user.emailVerified || false,
        image: user.image || "",
        role: (user.userData?.role as "admin" | "user") || "user",
        phone: user.userData?.phone || "",
        address: user.userData?.address || "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        emailVerified: false,
        image: "",
        role: "user",
        phone: "",
        address: "",
      });
    }
  }, [user, open]);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("User name is required");
      return;
    }

    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        emailVerified: formData.emailVerified,
        image: formData.image,
        role: formData.role,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
      };

      await onSubmit(userData);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to submit form");
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const uploadResponse = await startUpload([file]);
      if (uploadResponse && uploadResponse[0]) {
        setFormData((prev) => ({
          ...prev,
          image: uploadResponse[0].url,
        }));
        toast.success("Image uploaded successfully!");
      }
    } catch (error) {
      toast.error("Failed to upload image");
      console.error("Upload error:", error);
    }
  };


  const isDisabled = isUploading || isSubmitting || isLoading;


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Create User"}</DialogTitle>
          <DialogDescription>
            {user ? "Update the user details below." : "Add a new user to the system."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Profile Image</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center overflow-hidden group hover:border-primary/50 transition-colors">
                {isUploading ? (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : formData.image ? (
                  <div className="relative w-full h-64">
                    <Image
                      src={formData.image}
                      alt="Product Image"
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <Upload className="size-8" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isDisabled}
                />
                {isUploading && (
                  <p className="text-sm text-muted-foreground mt-1">Uploading image...</p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter full name"
                disabled={isDisabled}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Enter email address"
                disabled={isDisabled}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "admin" | "user") =>
                  setFormData((prev) => ({ ...prev, role: value }))
                }
                disabled={isDisabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                placeholder="Enter phone number"
                disabled={isDisabled}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
              placeholder="Enter address"
              rows={3}
              disabled={isDisabled}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="emailVerified"
              checked={formData.emailVerified}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, emailVerified: checked }))
              }
              disabled={isDisabled}
            />
            <Label htmlFor="emailVerified">Email Verified</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDisabled}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isDisabled}
            >
              {(isSubmitting || isLoading) ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  {user ? "Updating..." : "Creating..."}
                </>
              ) : (
                user ? "Update User" : "Create User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
