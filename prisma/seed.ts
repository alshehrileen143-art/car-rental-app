import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123";
const CUSTOMER_EMAIL = "customer@example.com";
const CUSTOMER_PASSWORD = "customer123";

async function main() {
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      name: "Admin",
      email: ADMIN_EMAIL,
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const customerHash = await bcrypt.hash(CUSTOMER_PASSWORD, 10);
  const customer = await prisma.user.upsert({
    where: { email: CUSTOMER_EMAIL },
    update: {},
    create: {
      name: "عميل تجريبي",
      email: CUSTOMER_EMAIL,
      passwordHash: customerHash,
      role: "CUSTOMER",
    },
  });

  const carsData = [
    {
      name: "كامري 2024",
      brand: "Toyota",
      category: "sedan",
      description: "سيارة سيدان مريحة واقتصادية، مثالية للاستخدام اليومي والرحلات الطويلة.",
      pricePerDay: 150,
      seats: 5,
      transmission: "automatic",
      fuelType: "petrol",
      location: "الرياض",
      images: ["https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800"],
    },
    {
      name: "أكورد 2023",
      brand: "Honda",
      category: "sedan",
      description: "سيدان عائلية بأداء موثوق واستهلاك وقود منخفض.",
      pricePerDay: 140,
      seats: 5,
      transmission: "automatic",
      fuelType: "petrol",
      location: "جدة",
      images: ["https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800"],
    },
    {
      name: "لاندكروزر 2023",
      brand: "Toyota",
      category: "suv",
      description: "دفع رباعي فاخر وقوي، مناسب للطرق الوعرة والرحلات العائلية الكبيرة.",
      pricePerDay: 450,
      seats: 8,
      transmission: "automatic",
      fuelType: "petrol",
      location: "الرياض",
      images: ["https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800"],
    },
    {
      name: "تسلا موديل 3",
      brand: "Tesla",
      category: "luxury",
      description: "سيارة كهربائية بالكامل، تقنية متقدمة وتسارع فائق.",
      pricePerDay: 300,
      seats: 5,
      transmission: "automatic",
      fuelType: "electric",
      location: "الدمام",
      images: ["https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800"],
    },
    {
      name: "سيفيك 2022",
      brand: "Honda",
      category: "economy",
      description: "سيارة اقتصادية صغيرة، خيار موفر للتنقل داخل المدينة.",
      pricePerDay: 100,
      seats: 5,
      transmission: "manual",
      fuelType: "petrol",
      location: "جدة",
      images: ["https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800"],
    },
    {
      name: "يوكن 2023",
      brand: "GMC",
      category: "van",
      description: "سيارة SUV فاخرة وواسعة، مناسبة للعائلات الكبيرة والرحلات الطويلة.",
      pricePerDay: 400,
      seats: 7,
      transmission: "automatic",
      fuelType: "petrol",
      location: "الرياض",
      images: ["https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800"],
    },
    {
      name: "إلنترا 2023",
      brand: "Hyundai",
      category: "economy",
      description: "سيدان أنيقة بسعر منافس وتجهيزات جيدة.",
      pricePerDay: 110,
      seats: 5,
      transmission: "automatic",
      fuelType: "petrol",
      location: "مكة",
      images: ["https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800"],
    },
  ];

  const createdCars = [];
  for (const carData of carsData) {
    const { images, ...rest } = carData;
    const existing = await prisma.car.findFirst({ where: { name: rest.name, brand: rest.brand } });
    if (existing) {
      createdCars.push(existing);
      continue;
    }
    const car = await prisma.car.create({
      data: {
        ...rest,
        images: { create: images.map((url) => ({ url })) },
      },
    });
    createdCars.push(car);
  }

  const existingBookings = await prisma.booking.count();
  if (existingBookings === 0 && createdCars.length > 0) {
    const firstCar = createdCars[0];
    const todayUtcMidnight = new Date(new Date().toISOString().slice(0, 10) + "T00:00:00.000Z");
    const in5Days = new Date(todayUtcMidnight.getTime() + 5 * 24 * 60 * 60 * 1000);
    const in8Days = new Date(todayUtcMidnight.getTime() + 8 * 24 * 60 * 60 * 1000);

    await prisma.booking.create({
      data: {
        carId: firstCar.id,
        userId: customer.id,
        startDate: in5Days,
        endDate: in8Days,
        totalPrice: firstCar.pricePerDay * 4,
        status: "CONFIRMED",
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Admin login:    ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`Customer login: ${CUSTOMER_EMAIL} / ${CUSTOMER_PASSWORD}`);
  console.log(`Admin id: ${admin.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
