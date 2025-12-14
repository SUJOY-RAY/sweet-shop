# Sweet Shop - Full Stack E-Commerce Platform

CHECK THIS OUT AT : https://sweet-shop-nine-cyan.vercel.app/

A full-stack e-commerce platform built with **Next.js**, **Prisma**, and **PostgreSQL**, allowing users to browse sweets, manage their cart, and place orders. Admins can manage sweet items (CRUD operations). JWT authentication is used for secure access.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Database Models](#database-models)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- [Installation](#installation)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Project Overview

Sweet Shop is a simple e-commerce platform for sweets. It allows:

- Browsing sweets with name, price, category, image, and stock.
- Adding sweets to a cart.
- Updating item quantity in the cart.
- Removing items from the cart.
- Placing orders via **Buy Now**.
- Admin users can add, edit, or delete sweet items.
- Secure JWT authentication ensures only authorized users can access certain actions.

---

## Tech Stack

- **Frontend:** Next.js (App Router), React 18, TailwindCSS  
- **Backend:** Next.js API Routes, Prisma ORM  
- **Database:** PostgreSQL  
- **Authentication:** JWT (JSON Web Token)  
- **State Management:** React `useState`  

---

## Features

### User Features
- Register and login using JWT authentication.
- Browse all sweets with stock and price.
- Add items to cart.
- Update quantity of cart items.
- Remove items from cart.
- Buy Now to place orders.
- Stock is automatically updated when order is placed.

### Admin Features
- Add new sweets.
- Edit existing sweets.
- Delete sweets.
- View orders (can be added in future).

### Backend Features
- Secure API routes with JWT authentication.
- Prisma transactions for **atomic operations** (stock decrement + order creation).
- Proper error handling for 400, 401, 404, and 500 errors.

---

## Database Models (Prisma)

### User
```prisma
model User {
  id       Int    @id @default(autoincrement())
  name     String
  email    String @unique
  password String
  role     String @default("USER") // USER | ADMIN
  cart     Cart?
  orders   Order[]
}
```
### Sweet

``` prisma
model Sweet {
  id        Int      @id @default(autoincrement())
  name      String
  price     Float
  category  String
  quantity  Int
  imageUrl  String?
  cartItems CartItem[]
  orderItems OrderItem[]
}

```

### Cart & CartItem

``` prisma
model Cart {
  id      Int        @id @default(autoincrement())
  user    User       @relation(fields: [userId], references: [id])
  userId  Int
  items   CartItem[]
}

model CartItem {
  id       Int   @id @default(autoincrement())
  cart     Cart  @relation(fields: [cartId], references: [id])
  cartId   Int
  sweet    Sweet @relation(fields: [sweetId], references: [id])
  sweetId  Int
  quantity Int
}

```

### Order & OrderItem
```prisma
model Order {
  id        Int         @id @default(autoincrement())
  user      User        @relation(fields: [userId], references: [id])
  userId    Int
  items     OrderItem[]
  total     Float       @default(0)
  status    OrderStatus @default(PENDING)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

model OrderItem {
  id       Int    @id @default(autoincrement())
  order    Order  @relation(fields: [orderId], references: [id])
  orderId  Int
  sweet    Sweet  @relation(fields: [sweetId], references: [id])
  sweetId  Int
  quantity Int
  price    Float
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

```
---
### API Endpoints
---
| Route                  | Method | Description                  | Auth |
| ---------------------- | ------ | ---------------------------- | ---- |
| `/api/auth/register`   | POST   | Register a new user          | No   |
| `/api/auth/login`      | POST   | Login user and return JWT    | No   |
| `/api/sweets`          | GET    | List all sweets              | No   |
| `/api/sweets`          | POST   | Add a new sweet (Admin only) | Yes  |
| `/api/sweets/:id`      | PUT    | Update sweet (Admin only)    | Yes  |
| `/api/sweets/:id`      | DELETE | Delete sweet (Admin only)    | Yes  |
| `/api/cart/add`        | POST   | Add item to cart             | Yes  |
| `/api/cart/update`     | PUT    | Update cart item quantity    | Yes  |
| `/api/cart/remove/:id` | DELETE | Remove cart item             | Yes  |
| `/api/order`           | POST   | Place an order (Buy Now)     | Yes  |



### Notes:
- All protected routes require Authorization: Bearer <token>.

- Cart updates and Buy Now use Prisma transactions to ensure atomic updates.

---
## Frontend Components

### SweetCard
- Displays sweet image, name, price, category, and available stock.

- Add to Cart button (for users).

- Edit/Delete buttons (for admins).

### CartCard
- Shows items in the cart with quantity controls.

- Remove button removes item from cart and restores stock.

- Buy Now button places an order, decrements stock, and removes item from cart.

- Handles loading state and API errors gracefully.

---
## Installation

1. Clone the repo:

```
https://github.com/SUJOY-RAY/sweet-shop.git

cd sweet-shop
```

2. Install dependencies:
``` 
npm install
```

3. Set up .env:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your_secret_key (Must very secure)"
```

4. Run Prisma migrations:

```
npx prisma migrate dev --name init
```

5. Start the development server:
```
npm run dev
```
6. App should now be running at: http://localhost:3000

---
Usage
---
1. Register/Login

- Users can register and log in using email and password.

- By default, new users have the role USER.

- Admin users can be seeded via Prisma (see `seeder.js`
).

2. Browse Sweets

- View all sweets with name, price, category, stock, and image.

- Users can see available quantity for each sweet.

3. Add Items to Cart

- Click Add to Cart on a sweet to add it to your shopping cart.

- Only users with role USER can add to cart.

4. Update Cart

- Change quantity using + or - buttons or input field.

- Remove items from the cart using the Remove button.

- Stock is automatically updated when items are removed.

5. Buy Now

- Click Buy Now to place an order for the selected item.

- The sweet quantity in the database is decremented accordingly.

- The item is removed from the cart after purchase.

6. Admin Actions

- Admins can Add, Edit, or Delete sweets.

- When adding a sweet, admins can attach a picture using any online image URL.

- Only users with role ADMIN can see and perform these actions.