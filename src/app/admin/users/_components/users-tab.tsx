/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Button } from "@/components/ui/button";
import { User, UserData } from "@/drizzle/schema";
import { RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import UsersTable from "./users-table";
import UsersSkeleton from "./users-skeleton";
import UserDialog from "./user-dialog";
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

interface UserWithData extends User {
  userData?: UserData;
}



export default function UsersTab() {
  const [users, setUsers] = useState<UserWithData[]>([]);
  const [editingUser, setEditingUser] = useState<UserWithData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithData | null>(null);


  const fetchUsers = async () => {
    setIsFetching(true);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch users');
    } finally {
      setIsFetching(false);
    }
  };


  useEffect(() => {
    fetchUsers();
  }, []);


  const openEditDialog = (user: UserWithData) => {
    setEditingUser(user);
    setIsDialogOpen(true);
  };


  const handleEditUser = async (userData: any) => {
    if (!editingUser) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (!response.ok) throw new Error('Failed to update user');

      toast.success('User updated successfully!');
      setEditingUser(null);
      setIsDialogOpen(false);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update user.");
    } finally {
      setIsLoading(false);
    }
  };


  const handleDeleteUser = async (user: UserWithData) => {
    setUserToDelete(user);
    setIsAlertDialogOpen(true);
  };


  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete user');

      toast.success('User deleted successfully!');
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user.");
    } finally {
      setIsAlertDialogOpen(false);
      setUserToDelete(null);
    }
  };


  const handleRefresh = () => {
    fetchUsers();
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold">User Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage user accounts and permissions
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isFetching}
        >
          <RefreshCw className={`size-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="border rounded-lg">
        {isFetching ? (
          <UsersSkeleton />
        ) : (
          <UsersTable
            users={users}
            onEdit={openEditDialog}
            onDelete={handleDeleteUser}
          />
        )}
      </div>

      <UserDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        user={editingUser}
        onSubmit={handleEditUser}
        isLoading={isLoading}
      />

      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{userToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
