import isAdmin from "@/common/utils/is-admin";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { notFound } from "next/navigation";
import ProductsTab from "./_components/products-tab";



export default async function AdminProductsPage() {
  const isAdminRole = await isAdmin();
  if (!isAdminRole) return notFound();

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div>
          <Card>
            <CardContent>
              <ProductsTab />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
