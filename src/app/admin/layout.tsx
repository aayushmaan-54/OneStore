import { AdminNavigation } from "./_components/admin-navigation"


export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your products, orders, and users</p>
          </div>
        </div>
        <AdminNavigation />
        <div>{children}</div>
      </div>
    </div>
  )
}
