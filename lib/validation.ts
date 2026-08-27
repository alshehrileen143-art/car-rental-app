import { z } from "zod";
import { CAR_CATEGORIES } from "@/lib/carOptions";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جدًا").max(100),
  email: z.string().trim().toLowerCase().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل").max(100),
});

export const carSchema = z.object({
  name: z.string().trim().min(1, "الاسم مطلوب").max(120),
  brand: z.string().trim().min(1, "الماركة مطلوبة").max(60),
  category: z.enum(CAR_CATEGORIES),
  description: z.string().trim().min(1, "الوصف مطلوب").max(2000),
  pricePerDay: z.coerce.number().positive("السعر يجب أن يكون أكبر من صفر"),
  seats: z.coerce.number().int().min(1).max(20),
  transmission: z.enum(["automatic", "manual"]),
  fuelType: z.enum(["petrol", "diesel", "electric", "hybrid"]),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  images: z.array(z.string().trim().url("رابط صورة غير صالح")).max(8).optional(),
});

export const bookingSchema = z
  .object({
    carId: z.string().min(1),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .refine((data) => data.endDate.getTime() >= data.startDate.getTime(), {
    message: "تاريخ النهاية يجب أن يكون بعد أو يساوي تاريخ البداية",
    path: ["endDate"],
  });

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "التقييم مطلوب").max(5),
  comment: z.string().trim().min(1, "التعليق مطلوب").max(1000),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type CarInput = z.infer<typeof carSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
