# Microsite — API & features request (EN / AR)

A single, summarized request to the team lead. Full JSON shapes live in
`docs/MICROSITE_API_SPEC.md`.

---

## English

**Subject: Public API + features the customer microsite needs from the POS**

Hey — the customer microsite (menu, ordering, live order tracking, multiple
concurrent orders, hero offers) is built and working on mock data. To go live it
needs a set of public, read-only endpoints plus order-create and order-status.
On my side it's one file to swap — once these exist I point it at the real API.

**Ground rules**
- **Public & unauthenticated** (the customer has no login) — separate from the
  auth-guarded `/api/*` routes, identified by a public store **slug**,
  rate-limited.
- **Money is always a 3-decimal string** (`"1.250"`), never a number. The server
  **recomputes all prices** on order.

**Schema additions**
- `Tenant.slug` — unique public id (web address → store).
- `Order.tableId` — nullable FK to `Table` (dine-in orders from the web).

**Endpoints**
1. `GET /public/stores/:slug` → store info + `branches[]` + enabled `orderTypes` + `offers[]` (see new features).
2. `GET /public/stores/:slug/menu?branchId=` → `categories[]` (with `parentId` for sub-categories) + active `products[]` (`categoryId`, variants, modifier groups). `branchId` optional — see per-branch note.
3. `GET /public/branches/:branchId/tables` → dining areas + tables (dine-in).
4. `GET /public/stores/:slug/delivery-areas` → admin's zones `[{id,name,nameAr,fee,isActive}]`, `fee` as a 3-decimal string.
5. `POST /public/stores/:slug/orders` → "fire to kitchen", lands as `NEW`/`PAYMENT_PENDING`. Body: `branchId, orderType, items[], tableId?, deliveryAreaId?, address?, customer fields`. Recompute prices server-side.
6. `GET /public/orders/:orderNumber/status` → live status; return `{ step }`: 0 received, 1 preparing, 2 ready/out-for-delivery, 3 done (or raw `OrderStatus`+`KitchenStatus`, I'll map it).

**New POS features (don't exist yet)**
- **Offers / featured banners** — admin-managed (title, image, badge, optional link, active, order) for the hero carousel. Return as `offers[]` in #1.
- **Per-branch menu** — decision needed: a product↔branch **availability toggle** (lighter, recommended) vs. fully separate menus. Then the menu endpoint uses `?branchId`.
- (Delivery areas + tables already exist in the dashboard — just need the public endpoints above.)

**Payment** is out of scope for now — orders fire unpaid; the customer picks
Cash on the site. The pay step / gateway comes later.

Full JSON shapes are in `docs/MICROSITE_API_SPEC.md`. Send me the real responses
once they're up and I'll wire them in. Thanks!

---

## العربية

**الموضوع: واجهة برمجية عامة (API) ومميزات يحتاجها الموقع المصغّر للعملاء من نظام الـ POS**

مرحباً — الموقع المصغّر للعملاء (القائمة، الطلب، تتبّع الطلب المباشر، الطلبات
المتعددة، عروض الـ hero) جاهز ويعمل ببيانات تجريبية. لتشغيله فعلياً يحتاج مجموعة
endpoints عامة للقراءة + endpoint لإنشاء الطلب + endpoint لحالة الطلب. من جهتي
التغيير في ملف واحد فقط — بمجرد توفّرها أوجّه الموقع للـ API الحقيقي.

**قواعد أساسية**
- **عامة وبدون تسجيل دخول** (العميل ليس لديه حساب) — منفصلة عن مسارات `/api/*`
  المحمية، تُعرّف عبر **slug** عام للمتجر، ومحدودة المعدّل (rate-limited).
- **المبالغ دائماً نص (string) بثلاث خانات عشرية** (`"1.250"`) وليست رقماً.
  والخادم **يعيد حساب جميع الأسعار** عند الطلب.

**إضافات على قاعدة البيانات**
- `Tenant.slug` — معرّف عام فريد (لربط رابط الموقع بالمتجر).
- `Order.tableId` — مفتاح أجنبي اختياري إلى `Table` (لطلبات تناول الطعام في المطعم من الويب).

**الـ Endpoints**
1. `GET /public/stores/:slug` ← معلومات المتجر + `branches[]` + أنواع الطلب المفعّلة + `offers[]` (انظر المميزات الجديدة).
2. `GET /public/stores/:slug/menu?branchId=` ← الأقسام `categories[]` (مع `parentId` للأقسام الفرعية) + المنتجات الفعّالة `products[]` (مع `categoryId` والمتغيّرات ومجموعات الإضافات). `branchId` اختياري — انظر ملاحظة الفروع.
3. `GET /public/branches/:branchId/tables` ← مناطق الجلوس والطاولات (لتناول الطعام في المطعم).
4. `GET /public/stores/:slug/delivery-areas` ← مناطق التوصيل التي يضبطها الأدمن `[{id,name,nameAr,fee,isActive}]`، والرسوم `fee` كنص بثلاث خانات عشرية.
5. `POST /public/stores/:slug/orders` ← "إرسال إلى المطبخ"، يصل كـ `NEW`/`PAYMENT_PENDING`. الـ body: `branchId, orderType, items[], tableId?, deliveryAreaId?, address?` وبيانات العميل. أعد حساب الأسعار في الخادم.
6. `GET /public/orders/:orderNumber/status` ← الحالة المباشرة؛ يرجع `{ step }`: 0 = تم الاستلام، 1 = قيد التحضير، 2 = جاهز/خرج للتوصيل، 3 = مكتمل (أو أرسل `OrderStatus` + `KitchenStatus` الخام وأنا أحوّلها).

**مميزات جديدة مطلوبة في الـ POS (غير موجودة حالياً)**
- **العروض / البانرات المميّزة** — يديرها الأدمن (عنوان، صورة، شارة، رابط اختياري، تفعيل، ترتيب) لكاروسيل الـ hero. تُرجَع كـ `offers[]` في رقم ١.
- **قائمة لكل فرع** — مطلوب قرار: **مفتاح توفّر** المنتج لكل فرع (أخف وأنصح به) مقابل قوائم منفصلة تماماً لكل فرع. بعدها يستخدم endpoint القائمة المعامل `?branchId`.
- (مناطق التوصيل والطاولات موجودة أصلاً في لوحة التحكم — نحتاج فقط الـ endpoints العامة أعلاه.)

**الدفع** خارج النطاق حالياً — الطلبات تُرسل غير مدفوعة؛ يختار العميل "نقداً" في
الموقع. خطوة الدفع / بوابة الدفع تُضاف لاحقاً.

التفاصيل الكاملة (شكل الـ JSON لكل endpoint) في `docs/MICROSITE_API_SPEC.md`.
أرسل لي الاستجابات الحقيقية بمجرد جاهزيتها وسأربطها. شكراً!
