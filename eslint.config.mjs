{
  "_comment": "Sample of the JSON object the POS microsite-settings page should output for ONE store. The website reads this via getTenant(slug). Money stays a string. This is the 'settings' object — the menu (categories + products) comes from a separate /menu endpoint.",

  "slug": "noor",
  "businessName": "Noor Kitchen",
  "businessNameAr": "مطبخ نور",
  "businessType": "RESTAURANT",
  "tagline": "Levantine grill & mezze, made fresh in Salmiya",
  "taglineAr": "مشاوي ومقبلات شامية تُحضّر طازجة في السالمية",

  "logo": "https://cdn.recety.com/stores/noor/logo.png",
  "coverImage": "https://cdn.recety.com/stores/noor/cover.jpg",

  "currency": "KWD",
  "hours": "Daily · 12:00 PM – 1:00 AM",
  "hoursAr": "يومياً · ١٢:٠٠ ظهراً – ١:٠٠ صباحاً",
  "isOpenNow": true,

  "_comment_theme": "Brand colors the merchant picks in the dashboard. The site injects these into its CSS variables, so the whole storefront re-themes automatically.",
  "theme": {
    "primary": "#3b5bdb",
    "primaryDeep": "#2f49b0",
    "accent": "#0ca678"
  },

  "_comment_sectionOrder": "Order of the page blocks on the storefront home. Merchant reorders these in the dashboard.",
  "sectionOrder": ["hero", "offers", "menu"],

  "_comment_orderTypes": "Which order buttons the store shows.",
  "orderTypes": ["TAKEAWAY", "DINE_IN", "DELIVERY"],

  "branches": [
    { "id": "br_salmiya", "name": "Salmiya", "nameAr": "السالمية", "area": "Salem Al Mubarak St", "areaAr": "شارع سالم المبارك" },
    { "id": "br_kuwaitcity", "name": "Kuwait City", "nameAr": "مدينة الكويت", "area": "Al Soor St", "areaAr": "شارع السور" }
  ],

  "offers": [
    {
      "id": "of_grill",
      "title": "Weekend Grill Feast",
      "titleAr": "وليمة المشاوي في عطلة نهاية الأسبوع",
      "subtitle": "Mixed grill platters for the whole family, all weekend long.",
      "subtitleAr": "صحون مشاوي مشكّلة للعائلة طوال عطلة نهاية الأسبوع.",
      "badge": "30% OFF",
      "badgeAr": "خصم ٣٠٪",
      "image": "https://cdn.recety.com/stores/noor/offer-grill.jpg",
      "href": "/s/noor/c/grill"
    }
  ]
}
