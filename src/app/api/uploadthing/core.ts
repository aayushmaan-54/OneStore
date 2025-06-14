import { devLogger } from "@/common/utils/dev-logger";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import checkAuth from "@/common/utils/check-auth";
import isAdmin from "@/common/utils/is-admin";

const f = createUploadthing();


export const ourFileRouter = {
  productImageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await checkAuth();
      if (!session) {
        throw new UploadThingError("You must be logged in to upload files.");
      }

      const isAdminRole = await isAdmin();
      if (!isAdminRole) {
        throw new UploadThingError("You are not authorized to upload product images.");
      }

      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      devLogger.info("✅ Product image upload complete for userId:", metadata.userId);
      devLogger.info("📷 Image URL:", file.ufsUrl);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;



export type OurFileRouter = typeof ourFileRouter;
