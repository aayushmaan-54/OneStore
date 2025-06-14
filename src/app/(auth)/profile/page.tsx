import checkAuth from "@/common/utils/check-auth";
import { redirect } from "next/navigation";
import ProfileForm from "./_components/profile-form";
import db from "@/common/lib/db";
import { eq } from "drizzle-orm";
import { userDataTable } from "@/drizzle/schema";



async function getUserData(userId: string) {
  const data = await db.query.userDataTable.findFirst({
    where: eq(userDataTable.userId, userId),
  });
  return data;
}

export default async function ProfilePage() {
  const session = await checkAuth();
  if (!session) redirect("/login");
  const userData = await getUserData(session.user.id);

  return (
    <>
      <ProfileForm
        session={session}
        userData={userData!}
      />
    </>
  )
}
