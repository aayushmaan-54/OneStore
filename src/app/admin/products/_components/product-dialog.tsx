"use client";
import createSlug from "@/common/utils/create-slug";
import { Product } from "@/drizzle/schema";
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
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSubmit: (product: Omit<Product, "id" | "createdAt" | "updatedAt">) => void;
  isLoading?: boolean;
}



export default function ProductDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  isLoading = false
}: ProductDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: 0,
    slug: "",
    description: "",
    image: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { startUpload, isUploading } = useUploadThing("productImageUploader");


  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        stock: product.stock,
        slug: product.slug,
        description: product.description,
        image: product.image,
      });
    } else {
      setFormData({
        name: "",
        price: "",
        stock: 0,
        slug: "",
        description: "",
        image: "",
      });
    }
  }, [product, open]);


  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug === createSlug(prev.name) || prev.slug === "" ? createSlug(name) : prev.slug,
    }));
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!formData.price || formData.price === "" || parseFloat(formData.price) < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (!formData.slug.trim()) {
      toast.error("Product slug is required");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Product description is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name.trim(),
        price: formData.price,
        stock: formData.stock,
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        image: formData.image,
      };

      await onSubmit(productData);
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Create Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Update the product details below." : "Add a new product to your inventory."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden group hover:border-primary/50 transition-colors">
                {isUploading ? (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : formData.image ? (
                  <>
                    {formData.image &&
                      <div className="relative w-full h-64">
                        <Image
                          src={formData.image}
                          alt="Product Image"
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    }
                  </>
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

          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter product name"
              disabled={isDisabled}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="10"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                disabled={isDisabled}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock === 0 ? '' : formData.stock}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    stock: Number(e.target.value) || 0,
                  }))
                }
                placeholder="0"
                disabled={isDisabled}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
              placeholder="product-slug"
              disabled={isDisabled}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Enter product description"
              rows={3}
              disabled={isDisabled}
              required
            />
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
                  {product ? "Updating..." : "Creating..."}
                </>
              ) : (
                product ? "Update Product" : "Create Product"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
