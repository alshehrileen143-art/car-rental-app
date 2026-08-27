export const CAR_CATEGORIES = ["economy", "sedan", "suv", "luxury", "van", "pickup"] as const;
export type CarCategory = (typeof CAR_CATEGORIES)[number];

export const categoryLabel: Record<CarCategory, string> = {
  economy: "اقتصادية",
  sedan: "سيدان",
  suv: "دفع رباعي (SUV)",
  luxury: "فاخرة",
  van: "عائلية / فان",
  pickup: "بيك أب",
};

export const transmissionLabel: Record<string, string> = {
  automatic: "أوتوماتيك",
  manual: "يدوي",
};

export const fuelLabel: Record<string, string> = {
  petrol: "بنزين",
  diesel: "ديزل",
  electric: "كهربائي",
  hybrid: "هجين",
};

export const TRIP_PURPOSES = ["trip", "daily", "business", "family"] as const;
export type TripPurpose = (typeof TRIP_PURPOSES)[number];

export const purposeLabel: Record<TripPurpose, string> = {
  trip: "رحلة / سفر",
  daily: "استخدام يومي",
  business: "عمل",
  family: "عائلي",
};

/** When the user picks a purpose but no explicit category/seats, suggest sensible defaults. */
export const purposeDefaults: Record<TripPurpose, { category?: CarCategory; minSeats?: number }> = {
  trip: { category: "suv" },
  daily: { category: "economy" },
  business: { category: "luxury" },
  family: { category: "van", minSeats: 6 },
};
