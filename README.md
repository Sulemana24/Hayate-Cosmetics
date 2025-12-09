# 🛍️ Hayate Cosmetics – Full E-Commerce Platform (Next.js + Firebase + Paystack)

Hayate Cosmetics is a **full-featured e-commerce web application** built with **Next.js (App Router)**. It includes a **public shopping website** and a **secure admin dashboard** for managing products, orders, and admins. Payments are processed using **Paystack**, and all data is stored using **Firebase & Firestore**.

This platform is designed for selling:

- Body Lotions
- Serums
- Facials
- Body Oils
- Creams
- Perfumes
- Bags
- Jewelry
- Spectacles

---

## 🚀 Features

### 🛒 Customer Features

- ✅ Browse products by category
- ✅ View product details
- ✅ Dark mode toggle
- ✅ Add to cart
- ✅ Checkout with Paystack
- ✅ Select delivery region & address
- ✅ WhatsApp floating support button
- ✅ Back-to-top floating button
- ✅ Order confirmation after successful payment

---

### 🧑‍💼 Admin Features

- ✅ Admin authentication (Firebase Auth)
- ✅ Admin role restriction
- ✅ Add / Edit / Delete products
- ✅ Upload product images
- ✅ Set original & discounted prices
- ✅ Product quantity management
- ✅ View all available products
- ✅ View orders after successful payment
- ✅ Automatic stock reduction after order
- ✅ View buyer delivery details
- ✅ Secure logout
- ✅ Admin navbar with full name & email

---

## 🧱 Tech Stack

- **Next.js 16 (App Router)**
- **TypeScript**
- **Firebase Authentication**
- **Cloud Firestore**
- **UploadThing (Image Storage)**
- **Paystack (Payments)**
- **Tailwind CSS**
- **Sonner (Toasts)**
- **Zustand (State Management)**
- **React Icons**

---

## 📁 Project Folder Structure

```txt
app/
 ├── admin/
 │   ├── dashboard/
 │   │   └── page.tsx
 │   ├── products/
 │   │   └── page.tsx
 │   ├── orders/
 │   │   └── page.tsx
 │   ├── login/
 │   │   └── page.tsx
 │   └── layout.tsx
 │
 ├── cart/
 │   └── page.tsx
 │
 ├── checkout/
 │   └── page.tsx
 │
 ├── product/
 │   └── [slug]/
 │       └── page.tsx
 │
 ├── layout.tsx
 └── page.tsx

components/
 ├── admin/
 │   ├── AdminNavbar.tsx
 │   ├── AdminLayout.tsx
 │   └── ProductForm.tsx
 │
 ├── ui/
 │   ├── Navbar.tsx
 │   ├── Footer.tsx
 │   └── DarkModeToggle.tsx
 │
 └── store/
     └── cartStore.ts

lib/
 ├── firebase.ts
 ├── admin.ts
 └── paystack.ts

public/
 └── comlogo.png
```
