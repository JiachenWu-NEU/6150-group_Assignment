# Eco-Round

A full-stack **second-hand trading platform** that supports three roles:

- **Buyer** – browse products, manage cart, place orders, view order history  
- **Vendor** – publish products, manage listings, view buyer orders  
- **Admin** – manage all users and products through a responsive admin panel  

Backend is built with **Node.js + Express + MongoDB**, following an **MVC** pattern and documented with **Swagger UI**.  
Frontend is using **React + MUI + Fetch ** with role-based layouts (buyer, vendor, admin).

---

## Features

### Core Features

- Email/password **user registration & login** (JWT-based auth)
- Google Auth
- Role system: `admin`, `vender` (seller), `buyer`
- **Account availability** flag – disabled users cannot log in
- **Product management**
  - Vendor creates products with an image (stored on server, DB keeps file path)
  - Vendor updates product details & image (old image file is deleted)
  - Vendor toggles product on sale / off sale
  - Vendor deletes own products
  - Admin can delete any product
- **Shopping cart**
  - Buyer adds items to cart
  - Buyer updates quantity (0 = remove)
  - Buyer removes cart items
  - Backend cart is per-user (based on token)
- **Orders**
  - Buyer creates an order from all cart items (cart is cleared afterward)
  - Buyer views own order history with product info & images
  - Vendor views orders that contain their products (with buyer address)
- **Responsive UI**
  - Buyer product list, detail & cart are mobile-friendly
  - Vendor center (product list, profile, seller orders) supports both desktop & mobile
  - Admin layout has a responsive sidebar + top bar, with scrollable tables
- **API documentation** via Swagger UI  
  (e.g. `/api-docs`, depending on your actual mount path)

---

## Tech Stack

### Frontend

- **React** (with hooks)
- **React Router** – routing & nested admin layout
- **MUI (Material UI)** – layout, tables, dialogs, responsive grid
- `@mui/icons-material` – icons
- `@react-oauth/google` – (optional) Google OAuth login button
- Custom utilities:
  - `utils/auth` – get/set user info & token from `localStorage`
  - Role-based redirection after login
- **Fetch** - use fetch to reach backend api and get response data

### Backend

- **Node.js + Express**
- **MongoDB + Mongoose**
- **JWT** (`jsonwebtoken`) – stateless authentication
- **bcrypt** – password hashing
- **multer** – image upload
- **Swagger UI** (`swagger-ui-express`, YAML/JSON definition)
- **MVC structure**
  - `models/` – `User`, `Product`, `Cart`, `Order`
  - `controllers/` – business logic per resource
  - `routes/` – route definitions, mounted under `/user`, `/product`, `/cart`, `/order`
  - `middlewares/` – `auth` JWT middleware, error handling, etc.
- Static file serving of uploaded images (e.g. `/images/...`)
- **Google OAuth** - support Google account login

---

## Project Structure (simplified)

```text
backend/
  src/
    models/
      User.js
      Product.js
      Cart.js
      Order.js
    controllers/
      userController.js
      productController.js
      cartController.js
      orderController.js
    routes/
      userRoutes.js
      productRoutes.js
      cartRoutes.js
      orderRoutes.js
    utils/
      tokenResolver.js      # resolve token
      uploadImage.js        # multer config for product images
    config/
      db.js            # MongoDB connection
      swagger.js       # swagger config
    app.js             # express app

frontend/
  src/
    components/
        admin/
            AdminLayout.jsx
            ProductsPage.jsx
            UsersPage.jsx
        buyer/
            Cart.jsx
            Chatbot.jsx
            Checkout.jsx
            OrderHistory.jsx
            ProductDetail.jsx
            ProductList.jsx
        /landingAll
            FeatureSection.jsx
            Footer.jsx
            HeroSection.jsx
            NavBar.jsx
        /login
            LoginPage.jsx
        /profile
            Profile.jsx
        /register
            RegisterPage.jsx
        /seller
            AddProduct.jsx
            SellerProductList.jsx
    config/
        appConfig.js
        stripe.js
    services/
        api.js          # overall setting for api request
        buyerApi.js
        chatbotApi.js
        profileApi.js
        sellerApi.js
    utils/
      auth.js           # token & user info helpers

```

---

## Roles and Functions

- Buyer: View products, view product detail, manage cart, create order, view own orders
- Vender: Manage own products (create/update/delete/toggle sale), view orders that include items they sold
- Admin: View/manage all users (disable/enable, delete) and all products (read + delete)

## Basic settings

- frontend address: localhost:3001
- backend address: localhost:3000
- SwaggerUI address: localhost:3000/api-docs


## APIs

- /user
  - /register
  - /login
  - /update
  - /{id}/disable
  - all
  - {id}
  - me
- /product
  - /create
  - /{id}
  - /{id}/onsale
  - all
  - detail/{id}
  - my
- /cart
  - /add
  - /remove
  - /update
  - /my
- /order
  - /create
  - /my
  - /vender

## How to Run

- Prerequisites: Node.js (LTS), npm , MongoDB running locally
- steps:
  - 1. open a terminal in backend folder
  - 2. run 'npm install'
  - 3. run 'npm run dev'
  - 4. open a terminal in frontend folder
  - 5. run 'npm install'
  - 6. run 'npm start'
  - 7. go to 'localhost:3001' in your browser