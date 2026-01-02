🛍️ Hayate Cosmetics
Full-Featured E-Commerce Platform (Next.js • Firebase • Paystack)

Hayate Cosmetics is a production-ready e-commerce web application built to help beauty brands sell products online and manage operations efficiently. The platform includes a customer-facing shopping website and a secure admin dashboard for managing products, orders, pricing, and staff access.

It is designed to deliver a smooth shopping experience for customers while giving business owners full control over sales and inventory.

🛒 Customer-Facing Features

Browse products by category (Lotions, Serums, Facials, Body Oils, Creams, Perfumes, Bags, Jewelry, Spectacles)

View detailed product information

Dark mode toggle for improved user experience

Add products to cart and complete checkout securely via Paystack

Select delivery region and shipping address

WhatsApp floating support button for instant customer assistance

Back-to-top floating button for easy navigation

Order confirmation after successful payment

🧑‍💼 Admin Dashboard Features

Secure admin authentication using Firebase Authentication

Role-based admin access and restrictions

Add, edit, and delete products with image uploads

Set original and discounted prices

Manage product stock quantities

View and track customer orders with delivery details

Automatic stock reduction after successful purchases

Admin navigation displaying logged-in admin name and email

Secure logout for all admin users

💼 Business Value

This platform enables beauty brands to sell online efficiently, manage inventory in real time, and track customer orders without manual processes.
The admin dashboard simplifies daily operations, while the customer site is optimized for conversions, performance, and mobile users.

🧱 Tech Stack

Next.js 16 (App Router) & TypeScript

Tailwind CSS for responsive, modern UI

Firebase Authentication & Cloud Firestore

UploadThing for product image uploads

Paystack for secure payments

Zustand for state management

Sonner for notifications

React Icons for UI enhancements

🔗 Live Demo

👉 https://hayate-cosmetics-fb5u.vercel.app/

📁 Project Structure (Simplified)
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
