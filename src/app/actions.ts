"use server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8)
});
const listingSchema = z.object({
    title: z.string().min(5),
    description: z.string().min(10),
    imageSrc: z.string().url(),
    imageGallery: z.array(z.string().url()).min(1).max(10),
    category: z.string().min(2),
    roomCount: z.coerce.number().int().min(1),
    bathroomCount: z.coerce.number().int().min(1),
    guestCount: z.coerce.number().int().min(1),
    locationValue: z.string().min(2),
    pricePerNight: z.coerce.number().int().min(10)
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
export async function createListing(formData: FormData) {
    const user = await requireUser();
    const parsedGallery = parseListingGallery(formData.get("imageGallery"));
    const parsed = listingSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        imageSrc: formData.get("imageSrc"),
        imageGallery: parsedGallery,
        category: formData.get("category"),
        roomCount: formData.get("roomCount"),
        bathroomCount: formData.get("bathroomCount"),
        guestCount: formData.get("guestCount"),
        locationValue: formData.get("locationValue"),
        pricePerNight: formData.get("pricePerNight")
    });
    if (!parsed.success)
        throw new Error("Invalid listing payload.");
    await prisma.listing.create({
        data: {
            ...parsed.data,
            userId: user.id
        }
    });
    revalidatePath("/");
    revalidatePath("/host");
}
function parseListingGallery(rawGallery: FormDataEntryValue | null) {
    try {
        const value = JSON.parse(String(rawGallery ?? "[]"));
        return Array.isArray(value) ? value : [];
    }
    catch {
        return [];
    }
}
export async function updateListing(listingId: string, formData: FormData) {
    const user = await requireUser();
    if (!listingId)
        throw new Error("Listing id is missing.");
    const parsedGallery = parseListingGallery(formData.get("imageGallery"));
    const parsed = listingSchema.safeParse({
        title: formData.get("title"),
        description: formData.get("description"),
        imageSrc: formData.get("imageSrc"),
        imageGallery: parsedGallery,
        category: formData.get("category"),
        roomCount: formData.get("roomCount"),
        bathroomCount: formData.get("bathroomCount"),
        guestCount: formData.get("guestCount"),
        locationValue: formData.get("locationValue"),
        pricePerNight: formData.get("pricePerNight")
    });
    if (!parsed.success)
        throw new Error("Invalid listing payload.");
    const updated = await prisma.listing.updateMany({
        where: {
            id: listingId,
            userId: user.id
        },
        data: parsed.data
    });
    if (updated.count === 0) {
        throw new Error("Listing not found or access denied.");
    }
    revalidatePath("/");
    revalidatePath("/host");
    revalidatePath(`/listings/${listingId}`);
    redirect("/host");
}
export async function deleteListing(formData: FormData) {
    const user = await requireUser();
    const listingId = String(formData.get("listingId") ?? "");
    if (!listingId)
        throw new Error("Listing id is missing.");
    await prisma.listing.deleteMany({
        where: {
            id: listingId,
            userId: user.id
        }
    });
    revalidatePath("/");
    revalidatePath("/host");
}
