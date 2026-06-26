import { CreateAdminUser } from "@/components/admin/create-admin-user";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Create User",
  description: "Create a verified user account",
};

export default function AdminCreateUserPage() {
  return <CreateAdminUser />;
}
