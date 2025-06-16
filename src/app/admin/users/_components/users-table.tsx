"use client";
import { User, UserData } from "@/drizzle/schema";
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
import { Edit, Trash2, Users, Shield, User as UserIcon, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

interface UserWithData extends User {
  userData?: UserData;
}

interface UsersTableProps {
  users: UserWithData[];
  onEdit: (user: UserWithData) => void;
  onDelete: (user: UserWithData) => void;
}



export default function UsersTable({ users, onEdit, onDelete }: UsersTableProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };


  const getRoleBadge = (role?: string) => {
    if (role === 'admin') {
      return (
        <Badge variant="destructive" className="gap-1">
          <Shield className="h-3 w-3" />
          Admin
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <UserIcon className="h-3 w-3" />
        User
      </Badge>
    );
  };


  const getVerificationBadge = (verified: boolean) => {
    if (verified) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Verified
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <XCircle className="h-3 w-3" />
        Unverified
      </Badge>
    );
  };


  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto size-12 text-muted-foreground" />
        <h3 className="mt-2 text-lg font-medium">No users found</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          No users have been registered yet.
        </p>
      </div>
    );
  }


  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Avatar</TableHead>
            <TableHead className="min-w-[200px]">Name & Email</TableHead>
            <TableHead className="min-w-[100px]">Role</TableHead>
            <TableHead className="min-w-[120px]">Verification</TableHead>
            <TableHead className="min-w-[150px] hidden sm:table-cell">Contact Info</TableHead>
            <TableHead className="min-w-[100px] hidden md:table-cell">Joined</TableHead>
            <TableHead className="min-w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-muted flex items-center justify-center">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <UserIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="min-w-0">
                  <div className="font-medium truncate">{user.name}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {getRoleBadge(user.userData?.role)}
              </TableCell>
              <TableCell>
                {getVerificationBadge(user.emailVerified)}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <div className="text-sm space-y-1">
                  {user.userData?.phone && (
                    <div className="text-muted-foreground">
                      📞 {user.userData.phone}
                    </div>
                  )}
                  {user.userData?.address && (
                    <div className="text-muted-foreground truncate max-w-[200px]">
                      📍 {user.userData.address}
                    </div>
                  )}
                  {!user.userData?.phone && !user.userData?.address && (
                    <div className="text-muted-foreground">No contact info</div>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-muted-foreground whitespace-nowrap">
                {formatDate(user.createdAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(user)}
                    className="h-8 w-8 p-0 flex-shrink-0"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit user</span>
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={user.userData?.role === 'admin'}
                    size="sm"
                    onClick={() => onDelete(user)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete user</span>
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
