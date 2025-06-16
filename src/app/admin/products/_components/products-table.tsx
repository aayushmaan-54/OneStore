"use client";
import { Product } from "@/drizzle/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Package } from "lucide-react";
import Image from "next/image";

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}



export default function ProductsTable({ products, onEdit, onDelete }: ProductsTableProps) {
  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(parseFloat(price));
  };


  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };


  const getStockBadge = (stock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    } else if (stock < 10) {
      return <Badge variant="secondary">Low Stock</Badge>;
    } else {
      return <Badge variant="default">In Stock</Badge>;
    }
  };


  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto size-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">No products found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Get started by creating your first product.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Image</TableHead>
            <TableHead className="min-w-[200px]">Name</TableHead>
            <TableHead className="min-w-[100px]">Price</TableHead>
            <TableHead className="min-w-[80px]">Stock</TableHead>
            <TableHead className="min-w-[120px]">Status</TableHead>
            <TableHead className="min-w-[150px] hidden sm:table-cell">Slug</TableHead>
            <TableHead className="min-w-[100px] hidden md:table-cell">Created</TableHead>
            <TableHead className="min-w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="min-w-0">
                  <div className="font-medium truncate">{product.name}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-[200px]" title={product.description}>
                    {product.description}
                  </div>
                </div>
              </TableCell>
              <TableCell className="font-medium whitespace-nowrap">
                {formatPrice(product.price)}
              </TableCell>
              <TableCell>
                <span className="font-medium">{product.stock}</span>
              </TableCell>
              <TableCell>
                {getStockBadge(product.stock)}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <code className="text-xs bg-muted px-2 py-1 rounded whitespace-nowrap">
                  {product.slug}
                </code>
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground whitespace-nowrap">
                {formatDate(product.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(product)}
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit product</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(product)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete product</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
