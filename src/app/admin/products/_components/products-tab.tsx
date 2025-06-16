/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { Product } from "@/drizzle/schema";
import { Plus, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import ProductDialog from "./product-dialog";
import ProductsTable from "./products-table";
import ProductsSkeleton from "./products-skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}



export default function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);


  const fetchProducts = async () => {
    setIsFetching(true);
    try {
      console.log('Fetching products from API...');

      const response = await fetch('/api/products', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON, got:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }

      const data: ProductsResponse = await response.json();

      if (data.success) {
        setProducts(data.data);
        console.log('Products loaded successfully:', data.data.length);
      } else {
        throw new Error(data.error || 'Failed to fetch products');
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast.error(error.message || 'Failed to fetch products');
    } finally {
      setIsFetching(false);
    }
  };


  useEffect(() => {
    fetchProducts();
  }, []);


  const openCreateDialog = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };


  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };


  const handleCreateProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'Product created successfully!');
        setIsDialogOpen(false);
        await fetchProducts();
      } else {
        throw new Error(result.error || "Failed to create product");
      }
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast.error(error.message || "Failed to create product.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleEditProduct = async (productData: Omit<Product, "id" | "createdAt" | "updatedAt">) => {
    if (!editingProduct) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'Product updated successfully!');
        setEditingProduct(null);
        setIsDialogOpen(false);
        await fetchProducts();
      } else {
        throw new Error(result.error || "Failed to update product");
      }
    } catch (error: any) {
      console.error("Error updating product:", error);
      toast.error(error.message || "Failed to update product.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleDeleteProduct = async (product: Product) => {
    setProductToDelete(product);
    setIsAlertDialogOpen(true);
  };


  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || 'Product deleted successfully!');
        await fetchProducts();
      } else {
        throw new Error(result.error || "Failed to delete product");
      }
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Failed to delete product.");
    } finally {
      setIsAlertDialogOpen(false);
      setProductToDelete(null);
    }
  };


  const handleRefresh = () => {
    fetchProducts();
  };


  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold">Product Inventory</h3>
            <p className="text-sm text-muted-foreground">
              Manage your product catalog and inventory
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw className={`size-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="size-4 mr-2" />
              Create Product
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>Total Products: {products.length}</span>
          <span>•</span>
          <span>In Stock: {products.filter(p => p.stock > 0).length}</span>
          <span>•</span>
          <span>Out of Stock: {products.filter(p => p.stock === 0).length}</span>
        </div>

        <div className="border rounded-lg">
          {isFetching ? (
            <ProductsSkeleton />
          ) : (
            <ProductsTable
              products={products}
              onEdit={openEditDialog}
              onDelete={handleDeleteProduct}
            />
          )}
        </div>

        <ProductDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          product={editingProduct}
          onSubmit={editingProduct ? handleEditProduct : handleCreateProduct}
          isLoading={isLoading}
        />

        <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{productToDelete?.name}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsAlertDialogOpen(false);
                setProductToDelete(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteProduct}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete Product
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
