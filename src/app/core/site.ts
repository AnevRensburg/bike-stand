/** Business details shown across the site. Change them here and they update everywhere. */
export const SITE = {
  url: 'https://anevrensburg.github.io/bike-stand',
  ogImage: 'https://anevrensburg.github.io/bike-stand/images/og-image.jpg',
  email: 'anejvr06@gmail.com',
  /** Shown to visitors. */
  phoneDisplay: '071 547 7921',
  /** International format without "+" or spaces, as wa.me expects. */
  whatsappNumber: '27715477921',
  address: ['Durbanville', 'Cape Town'],
  /** Name used in the footer copyright line. */
  copyrightHolder: 'Bike Stands RSA',
  youtubeId: '-ahN9NmHhCU',
} as const;

export const PRODUCT = {
  name: 'MTB / eMTB bike stand',
  /** Price per stand in rand. */
  price: 3500,
} as const;

/**
 * Multi-buy special shown in the top banner and applied to the order total.
 * Set to `null` to switch the special off everywhere.
 */
export const SPECIAL: { readonly quantity: number; readonly price: number } | null = {
  quantity: 2,
  price: 6800,
};

export const DELIVERY = {
  /** The old site offered free courier anywhere in South Africa. */
  courierFree: true,
} as const;

/** "R3 500" style price, without cents. */
export const formatRand = (amount: number): string => `R${amount.toLocaleString('en-ZA')}`;

/** Total for a number of stands, applying the special to every full set (e.g. 3 = R6 800 + R3 500). */
export const standsTotal = (quantity: number): number =>
  SPECIAL
    ? Math.floor(quantity / SPECIAL.quantity) * SPECIAL.price +
      (quantity % SPECIAL.quantity) * PRODUCT.price
    : quantity * PRODUCT.price;

/** "2 for R6 800", or null when there is no special. */
export const specialLabel = (): string | null =>
  SPECIAL ? `${SPECIAL.quantity} for ${formatRand(SPECIAL.price)}` : null;
