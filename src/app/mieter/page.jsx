import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { Skeleton } from "@/components/ui/skeleton";
import { requireSession } from "@/lib/auth-helper";
import { toast } from "sonner";
import { PageHeader } from "@/components/page-header";

async function getMieters() {
  const mieters = await prisma.mieter.findMany();
  console.log("Fetched mieters:", mieters);
  return mieters;
}

async function Mieter() {
  //   const session = await requireSession();

  const mieters = await getMieters();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Mieter" />
      <ul>
        {mieters.map((m) => (
          <li key={m.id}>
            {m.name} {m.vorname}
          </li>
        ))}
      </ul>{" "}
    </div>
  );
}

export default Mieter;
