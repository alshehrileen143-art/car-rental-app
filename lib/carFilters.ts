import type { Prisma } from "@prisma/client";
import { CAR_CATEGORIES, TRIP_PURPOSES, purposeDefaults, type TripPurpose } from "@/lib/carOptions";
import { toCalendarDate } from "@/lib/dateRanges";

export type CarSearchParams = {
  location?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  seats?: string;
  startDate?: string;
  endDate?: string;
  purpose?: string;
};

/** Resolved filter values after applying purpose-based defaults, used to pre-fill the results form. */
export type ResolvedCarFilters = {
  location: string;
  category: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  seats: string;
  startDate: string;
  endDate: string;
  purpose: string;
};

function isTripPurpose(value: string | undefined): value is TripPurpose {
  return !!value && (TRIP_PURPOSES as readonly string[]).includes(value);
}

export function resolveCarFilters(params: CarSearchParams): ResolvedCarFilters {
  const purpose = isTripPurpose(params.purpose) ? params.purpose : "";
  const defaults = purpose ? purposeDefaults[purpose] : undefined;

  return {
    location: params.location?.trim() ?? "",
    category: params.category?.trim() || defaults?.category || "",
    brand: params.brand?.trim() ?? "",
    minPrice: params.minPrice?.trim() ?? "",
    maxPrice: params.maxPrice?.trim() ?? "",
    seats: params.seats?.trim() || (defaults?.minSeats ? String(defaults.minSeats) : ""),
    startDate: params.startDate?.trim() ?? "",
    endDate: params.endDate?.trim() ?? "",
    purpose,
  };
}

export function buildCarWhere(
  filters: ResolvedCarFilters,
  opts?: { includeInactive?: boolean }
): Prisma.CarWhereInput {
  const minPrice = filters.minPrice ? Number(filters.minPrice) : undefined;
  const maxPrice = filters.maxPrice ? Number(filters.maxPrice) : undefined;
  const seats = filters.seats ? Number(filters.seats) : undefined;
  const category = CAR_CATEGORIES.includes(filters.category as (typeof CAR_CATEGORIES)[number])
    ? filters.category
    : undefined;

  const where: Prisma.CarWhereInput = {
    ...(opts?.includeInactive ? {} : { isActive: true }),
    ...(filters.location ? { location: filters.location } : {}),
    ...(filters.brand ? { brand: filters.brand } : {}),
    ...(category ? { category } : {}),
    ...(seats && !Number.isNaN(seats) ? { seats: { gte: seats } } : {}),
    ...(minPrice !== undefined && !Number.isNaN(minPrice)
      ? { pricePerDay: { gte: minPrice, ...(maxPrice !== undefined && !Number.isNaN(maxPrice) ? { lte: maxPrice } : {}) } }
      : maxPrice !== undefined && !Number.isNaN(maxPrice)
        ? { pricePerDay: { lte: maxPrice } }
        : {}),
  };

  if (filters.startDate && filters.endDate) {
    const start = toCalendarDate(filters.startDate);
    const end = toCalendarDate(filters.endDate);
    if (end.getTime() >= start.getTime()) {
      where.bookings = {
        none: {
          status: "CONFIRMED",
          startDate: { lte: end },
          endDate: { gte: start },
        },
      };
    }
  }

  return where;
}
