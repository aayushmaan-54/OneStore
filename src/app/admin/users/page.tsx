import isAdmin from "@/common/utils/is-admin";
import { Card, CardContent } from "@/components/ui/card";
import { notFound } from "next/navigation";
import UsersTab from "./_components/users-tab";


export default async function AdminUsersPage() {
  const isAdminRole = await isAdmin();
  if (!isAdminRole) return notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div>
        <Card>
          <CardContent className="p-6">
            <UsersTab />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
