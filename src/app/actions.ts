"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8)
});
export async function registerUser(formData: FormData) {
    const parsed = registerSchema.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password")
    });
    if (!parsed.success)
        throw new Error("Invalid registration input.");
    const existing = await prisma.user.findUnique({
        where: { email: parsed.data.email }
    });
    if (existing)
        throw new Error("Email already exists.");
    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.create({
        data: {
            name: parsed.data.name,
            email: parsed.data.email,
            hashedPassword
        }
    });
    redirect("/login");
}
