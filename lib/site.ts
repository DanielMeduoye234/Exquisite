// Store-wide settings. In the Shopify port these become theme settings in settings_schema.json.
// Values marked CONFIRM are placeholders the client must approve before launch.
export const site = {
  name: "The Exquisite Wine Experience",
  by: "By Vitalita",
  slogan: "Pour something worth remembering.",
  legalName: "Vitalita Wines & Spirits Inc.", // shown until the licence moves to the new name
  address: ["8611 Weston Road", "Vaughan, ON"],
  email: "hello@exquisitewine.ca", // CONFIRM
  phone: null as string | null, // CONFIRM: add the store phone number
  hours: "Monday to Friday, 9 am to 5 pm", // CONFIRM
  minimumBottles: 6,
  freeDeliveryBottles: 12, // CONFIRM
  deliveryNote: "Delivered across Ontario in 5 to 10 business days.", // CONFIRM
  minimumExplainer:
    "Our wines are ordered privately on your behalf, by the case, so every order starts at six bottles. Mix any six you like.", // CONFIRM with licensing counsel
};

// Legal drinking age by province or territory, from the brand book age check.
export const provinces: Record<string, number> = {
  Alberta: 18,
  "British Columbia": 19,
  Manitoba: 18,
  "New Brunswick": 19,
  "Newfoundland and Labrador": 19,
  "Northwest Territories": 19,
  "Nova Scotia": 19,
  Nunavut: 19,
  Ontario: 19,
  "Prince Edward Island": 19,
  Quebec: 18,
  Saskatchewan: 19,
  Yukon: 19,
};
