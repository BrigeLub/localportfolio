import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";
import "../admin.css";

export const metadata = { title: "Admin · Brigitte Lubker", robots: { index: false } };

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="admin admin--login">
      <h1>Admin</h1>
      <LoginForm />
    </main>
  );
}
