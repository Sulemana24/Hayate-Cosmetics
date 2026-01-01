🛍️ Hayate Cosmetics – Full E-Commerce Platform (Next.js + Firebase + Paystack)

Hayate Cosmetics is a full-featured e-commerce platform that helps beauty brands sell online effortlessly. It includes a public shopping website for customers and a secure admin dashboard for managing products, orders, and staff. Payments are handled securely via Paystack, and all data is stored using Firebase & Firestore.

The platform is designed to drive smooth shopping experiences and efficient business operations.

🛒 Customer-Facing Features

Browse products by category (Lotions, Serums, Facials, Body Oils, Creams, Perfumes, Bags, Jewelry, Spectacles)

View detailed product information

Dark mode toggle for improved UX

Add products to cart and checkout seamlessly via Paystack

Select delivery region and address

WhatsApp support floating button for instant help

Back-to-top floating button for easy navigation

Order confirmation after successful payment

🧑‍💼 Admin Dashboard Features

Secure admin authentication using Firebase Auth

Role-based admin access and restrictions

Add, edit, or delete products with image uploads

Set original & discounted prices and manage stock quantities

View all products and track orders with buyer delivery details

Automatic stock reduction after purchase

Full admin navbar displaying name & email for easy management

Secure logout for all admin users

Business Value: The admin dashboard empowers brands to manage products, track orders, and drive sales efficiently, while the customer site provides a smooth, conversion-focused shopping experience.

🧱 Tech Stack

Next.js 16 (App Router) & TypeScript

Tailwind CSS for responsive, modern design

Firebase Authentication & Cloud Firestore for secure backend

UploadThing for image storage

Paystack for payments

Sonner for notifications

Zustand for state management

React Icons for UI enhancements

📁 Project Folder Structure
app/
├── admin/
│ ├── dashboard/
│ ├── products/
│ ├── orders/
│ ├── login/
│ └── layout.tsx
├── cart/
├── checkout/
├── product/[slug]/
├── layout.tsx
└── page.tsx

components/
├── admin/
│ ├── AdminNavbar.tsx
│ ├── AdminLayout.tsx
│ └── ProductForm.tsx
├── ui/
│ ├── Navbar.tsx
│ ├── Footer.tsx
│ └── DarkModeToggle.tsx
└── store/
└── cartStore.ts

lib/
├── firebase.ts
├── admin.ts
└── paystack.ts

public/
└── assets
