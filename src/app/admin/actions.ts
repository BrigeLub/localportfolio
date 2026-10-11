"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseTags } from "@/lib/artworks";
import { checkPassword, endSession, loginAllowed, requireAdmin, startSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteArtworkFiles } from "@/lib/storage";

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  if (!(await loginAllowed())) return "Too many attempts. Try again in 15 minutes.";
  if (!checkPassword(String(form.get("password") ?? ""))) return "Wrong password.";
  await startSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

export async function updateArtwork(id: string, form: FormData): Promise<void> {
  await requireAdmin();
  await prisma.artwork.update({
    where: { id },
    data: {
      title: String(form.get("title") ?? "").trim().slice(0, 200) || "Untitled",
      description: String(form.get("description") ?? "").trim().slice(0, 2000),
      tags: parseTags(String(form.get("tags") ?? "")),
      published: form.get("published") === "on",
    },
  });
  revalidatePath("/gallery");
  revalidatePath("/admin");
}

export async function deleteArtwork(id: string): Promise<void> {
  await requireAdmin();
  const artwork = await prisma.artwork.delete({ where: { id } });
  await deleteArtworkFiles(artwork.originalKey, artwork.widths, artwork.pixelArt);
  revalidatePath("/gallery");
  revalidatePath("/admin");
}
