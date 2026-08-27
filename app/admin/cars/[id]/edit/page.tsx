import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CarForm from "@/components/admin/CarForm";
import type { CarCategory } from "@/lib/carOptions";

export default async function EditCarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const car = await prisma.car.findUnique({ where: { id }, include: { images: true } });

  if (!car) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">تعديل السيارة</h1>
      <CarForm
        carId={car.id}
        initialValues={{
          name: car.name,
          brand: car.brand,
          category: car.category as CarCategory,
          description: car.description,
          pricePerDay: car.pricePerDay,
          seats: car.seats,
          transmission: car.transmission as "automatic" | "manual",
          fuelType: car.fuelType as "petrol" | "diesel" | "electric" | "hybrid",
          location: car.location ?? "",
          isActive: car.isActive,
          imagesText: car.images.map((i) => i.url).join("\n"),
        }}
      />
    </div>
  );
}
