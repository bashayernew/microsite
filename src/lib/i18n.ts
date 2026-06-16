import type { Locale } from "./api/types";

/**
 * Lightweight i18n for the storefront UI chrome. Menu content (product names,
 * etc.) is bilingual at the data layer (name/nameAr) and picked via `pick()`.
 *
 * This deliberately avoids next-intl routing for the demo; the structure doc's
 * `[locale]` segment is the production upgrade. Direction is driven off locale.
 */

export const LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "en";

export function dir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** Pick the localized variant of a bilingual field, falling back to English. */
export function pick(en: string, ar: string, locale: Locale): string {
  return locale === "ar" ? ar || en : en;
}

type Dict = Record<string, string>;

const en: Dict = {
  open_now: "Open now",
  closed: "Closed",
  reviews: "reviews",
  view_menu: "View menu",
  order_now: "Order now",
  search_placeholder: "Search the menu…",
  popular: "Popular",
  vegetarian: "Vegetarian",
  spicy: "Spicy",
  from: "from",
  add: "Add",
  added: "Added",
  customize: "Customize",
  required: "Required",
  optional: "Optional",
  choose_up_to: "Choose up to",
  special_instructions: "Special instructions",
  notes_placeholder: "e.g. no onions, extra napkins",
  quantity: "Quantity",
  add_to_order: "Add to order",
  update_order: "Update order",
  your_order: "Your order",
  cart_empty: "Your order is empty",
  cart_empty_hint: "Add a few dishes from the menu to get started.",
  browse_menu: "Browse the menu",
  subtotal: "Subtotal",
  items: "items",
  item: "item",
  checkout: "Checkout",
  order_type: "How would you like it?",
  takeaway: "Takeaway",
  dine_in: "Dine-in",
  pickup_branch: "Pickup branch",
  dinein_branch: "Dining at",
  your_details: "Your details",
  name: "Name",
  phone: "Phone",
  name_placeholder: "Your name",
  phone_placeholder: "+965 …",
  order_notes: "Order notes",
  place_order: "Place order",
  placing: "Sending to the kitchen…",
  back_to_menu: "Back to menu",
  edit: "Edit",
  remove: "Remove",
  order_confirmed: "Order sent!",
  order_confirmed_sub: "Your order is in and on its way to the kitchen.",
  order_number: "Order number",
  est_ready: "Estimated ready in",
  minutes: "minutes",
  pay_at_counter: "Pay at the counter when you collect.",
  pay_at_table: "Your server will bring the bill to your table.",
  start_new_order: "Start a new order",
  powered_by: "Powered by Recety",
  currency: "KWD",
  close: "Close",
  menu: "Menu",
  each: "each",
  total: "Total",
  continue: "Continue",
  select_required: "Please choose a required option",
};

const ar: Dict = {
  open_now: "مفتوح الآن",
  closed: "مغلق",
  reviews: "تقييم",
  view_menu: "تصفح القائمة",
  order_now: "اطلب الآن",
  search_placeholder: "ابحث في القائمة…",
  popular: "الأكثر طلباً",
  vegetarian: "نباتي",
  spicy: "حار",
  from: "من",
  add: "أضف",
  added: "تمت الإضافة",
  customize: "خصّص",
  required: "إلزامي",
  optional: "اختياري",
  choose_up_to: "اختر حتى",
  special_instructions: "ملاحظات خاصة",
  notes_placeholder: "مثال: بدون بصل، مناديل إضافية",
  quantity: "الكمية",
  add_to_order: "أضف إلى الطلب",
  update_order: "تحديث الطلب",
  your_order: "طلبك",
  cart_empty: "طلبك فارغ",
  cart_empty_hint: "أضف بعض الأطباق من القائمة للبدء.",
  browse_menu: "تصفح القائمة",
  subtotal: "المجموع الفرعي",
  items: "أصناف",
  item: "صنف",
  checkout: "إتمام الطلب",
  order_type: "كيف تفضّل طلبك؟",
  takeaway: "سفري",
  dine_in: "تناول في المطعم",
  pickup_branch: "فرع الاستلام",
  dinein_branch: "تتناول في",
  your_details: "بياناتك",
  name: "الاسم",
  phone: "الهاتف",
  name_placeholder: "اسمك",
  phone_placeholder: "+965 …",
  order_notes: "ملاحظات الطلب",
  place_order: "أرسل الطلب",
  placing: "جارٍ الإرسال إلى المطبخ…",
  back_to_menu: "العودة للقائمة",
  edit: "تعديل",
  remove: "إزالة",
  order_confirmed: "تم إرسال الطلب!",
  order_confirmed_sub: "تم استلام طلبك وهو في طريقه إلى المطبخ.",
  order_number: "رقم الطلب",
  est_ready: "الوقت المتوقع للتحضير",
  minutes: "دقيقة",
  pay_at_counter: "ادفع عند الكاونتر عند الاستلام.",
  pay_at_table: "سيحضر لك النادل الفاتورة إلى طاولتك.",
  start_new_order: "ابدأ طلباً جديداً",
  powered_by: "مدعوم من ريستي",
  currency: "د.ك",
  close: "إغلاق",
  menu: "القائمة",
  each: "للحبة",
  total: "الإجمالي",
  continue: "متابعة",
  select_required: "الرجاء اختيار خيار إلزامي",
};

const DICTS: Record<Locale, Dict> = { en, ar };

export function makeT(locale: Locale) {
  const d = DICTS[locale] ?? en;
  return (key: keyof typeof en): string => d[key] ?? en[key] ?? String(key);
}

export type T = ReturnType<typeof makeT>;
