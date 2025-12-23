"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/prisma";

const schema = z.object({
  id: z.number(),
  name: z.string().min(1, "Name ist erforderlich"),
  stammverein: z.string().optional(),
  licenseType: z.string().optional(),
});

export async function updateTrainerAction(formData) {
  console.log("updateTrainerAction called");
  const data = Object.fromEntries(formData);

  const parsed = schema.safeParse({
    id: parseInt(data.id),
    name: data.name,
    stammverein: data.stammverein || undefined,
    licenseType: data.licenseType || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  await prisma.trainer.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      stammverein: parsed.data.stammverein || null,
      licenseType: parsed.data.licenseType || null,
    },
  });

  revalidatePath("/trainer");
}
