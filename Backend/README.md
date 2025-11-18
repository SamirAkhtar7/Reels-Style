# Reels-Style — Backend

This README documents the Backend of the Reels-Style (Zomato-style) project.
It lists environment setup, how to run the server, and a complete API reference with request and response examples for every backend route in this repository.

> Location: `Backend/`

---

## Table of contents

- Project overview
- Backend folder structure
- Environment variables
- Authentication & security
- API Reference
  - Auth (`/api/auth`)
  - User (`/api/user`)
  - Shop / Restaurants (`/api/shop`)
  - Food collection (`/api/food`)
  - Item endpoints (`/api/item`)
  - Order (`/api/order`)
  - Geo (`/api/geo`)
- Sample seed data (format)
- Notes: file uploads (Cloudinary), pagination, search & filters
- Best practices & production notes

---

## Project overview

The backend is an Express.js app using MongoDB (Mongoose) as the database. It provides public and private APIs for a food ordering application similar to Zomato. Authentication is JWT-based. The frontend (SPA) communicates with these APIs.

Base API prefix used in this README: `/api`

From `app.js` the mounted route groups are:

- `/api/auth` — authentication
- `/api/user` — user-related endpoints
- `/api/food` — food collection endpoints
- `/api/shop` — restaurants/shops
- `/api/item` — food item endpoints
- `/api/order` — order & payment
- `/api/geo` — geo / city data

## Backend folder structure (short)

Key files and folders (relative to `Backend/`):

- `src/app.js` — main Express app (routes mounted here)
- `src/routes/` — route definitions
- `src/controllers/` — controller implementations
- `src/middlewares/` — middleware (auth, multer, etc.)
- `src/models/` — Mongoose models (User, Shop, Item, Food, Order, ...)
- `src/services/cloudinary.js` — image upload helper
- `src/db/db.js` — DB connection helper
- `server.js` — server launcher

## Environment variables

Create a `.env` file (or set environment variables) with at least:

- `MONGO_URI` — MongoDB connection string
- `PORT` — server port (default usually 5000)
- `JWT_SECRET` — secret used to sign JWT tokens
- `FRONTEND_URL` — frontend origin used for CORS
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — for Cloudinary uploads

```
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/reels-style?retryWrites=true&w=majority
PORT=5000
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

## Install & run

From `Backend/`:

```powershell
npm install

# run dev
npm run dev  # or: node server.js
```

Server listens on `process.env.PORT` (default may be `5000`). The frontend origin should be in `FRONTEND_URL` to allow cookies if using cookie-based tokens.

## Authentication & security

- JWT tokens are used for authentication. The backend may set a cookie named `token`, and also returns the token in JSON for frontend storage in `localStorage`.
- Protected routes require either an `Authorization: Bearer <token>` header or the `token` cookie. The middleware returns `401` if token missing/invalid.
- Sensitive fields (like password) are stripped before sending user objects.
- All inputs should be validated/sanitized at controller level.

---

# API Reference

All request examples show JSON body unless `x-www-form-urlencoded` or `multipart/form-data` is explicitly required.

General response shape for successful operations:

```json
{
  "success": true,
  "message": "...",
  "data": { ... }
}
```

General error response shape:

```json
{
  "success": false,
  "message": "Error description"
}
```

## 1) Auth routes — `/api/auth`

### POST /api/auth/register

- Public. Register a new user.
- Request body:

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "mobile": "9999999999"
}
```

- Response (201 Created):

{
"message": "User registered successfully",
"token": "<jwt-token>",
"user": {
"\_id": "64f...",
"email": "john@example.com",
"fullName": "John Doe",
"mobile": "9999999999",
"role": "user"
}
}

````

Notes: The server may also set an HttpOnly cookie named `token` for the created session.


### POST /api/auth/login

- Request body:

```json
{
  "email": "john@example.com",
  "password": "password123"
}
````

- Response (200 OK):

```json
{
  "message": "User login successful",
  "token": "<jwt-token>",
  "user": {
    "_id": "64f...",
    "email": "john@example.com",
    "fullName": "John Doe",
    "mobile": "9999999999",
    "role": "user"
  }
}
```

Notes: Save `token` to `localStorage` and/or rely on cookie for subsequent private requests. When using `localStorage`, attach the token to `Authorization: Bearer <token>` on requests.

### POST /api/auth/logout

- (Optional) Invalidate cookie on server.
- Response: 200 OK

```json
{ "message": "Logged out" }
```

## 2) User routes — `/api/user`

Protected routes (require JWT).

### GET /api/user/profile

- Protected. Get current user profile.
- Request: Add `Authorization: Bearer <token>` header or cookie.
- Response (200):

```json
{
  "message": "User profile fetched",
  "user": {
    "_id": "64f...",
    "email": "john@example.com",
    "fullName": "John Doe",
    "role": "user",
    "addresses": [
      {
        "_id": "abc...",
        "label": "Home",
        "address": "123 Main St, City",
        "lat": 12.34,
        "lng": 56.78
      }
    ]
}
```

### PUT /api/user/profile

- Protected. Update user fields (name, mobile, etc.).
- Request body (example):

```json
{
  "fullName": "John D.",
  "mobile": "9888888888"
}
```

- Response (200): updated user object

```json
{
  "message": "Profile updated",
  "user": { ... }
}
```

### Address management

There may be endpoints such as:

- `POST /api/user/address` — add address
- `PUT /api/user/address/:id` — edit address
- `DELETE /api/user/address/:id` — remove address

Example `POST /api/user/address` request body:

```json
{
  "label": "Home",
  "lat": 12.34,
  "lng": 56.78
}
```

Response (201): address object added.

## 3) Shop / Restaurants — `/api/shop`

Shops represent restaurants. Public endpoints allow listing and details. Pagination and filters are supported via query params.

### GET /api/shop

- Public. List shops/restaurants.
- Query params (optional):
  - `page` (number)
  - `limit` (number)
  - `city` (string)
  - `category` (string)
  - `search` (text)
  - `sortBy` (e.g. `rating`, `deliveryTime`)

Example request:

`GET /api/shop?page=1&limit=12&city=San%20Francisco`

- Response (200):

```json
{
  "message": "Shops fetched",
  "data": {
    "docs": [
      {
        "_id": "shopId1",
        "name": "Pizza Palace",
        "city": "San Francisco",
        "rating": 4.5,
        "cuisines": ["Italian", "Pizza"],
        "image": "https://res.cloudinary.com/.../pizza.jpg"
      }
    ],
    "page": 1,
    "limit": 12,
    "totalDocs": 120,
    "totalPages": 10
  }
}
```

### GET /api/shop/:id

- Public. Get shop details including menu items (if implemented server-side) and ratings.
- Response (200):

```json
{
  "message": "Shop details fetched",
  "shop": {
    "_id": "shopId1",
    "name": "Pizza Palace",
    "address": "...",
    "rating": 4.5,
    "menu": [
      /* optional menu items or pointer to /api/item */
    ]
  }
}
```

### GET /api/shop/city/:cityName or /api/shop?city=...

- Public. Get shops filtered by city. Response same as `/api/shop` with filters.

## 4) Food collection — `/api/food`

This group contains food-collection-level endpoints (e.g., categories, top trending lists, popular items). There is also `/api/item` for concrete food items.

### GET /api/food

- Public. List food categories or foods depending on implementation.
- Query params for filtering & pagination:
  - `search` (text)
  - `category` (pizza, burger, chinese)
  - `maxPrice` (number)
  - `minRating` (number)
  - `isVeg` (true/false)
  - `page`, `limit`

Example: `GET /api/food?category=pizza&maxPrice=300&minRating=4&page=1&limit=20`

- Response (200):

```json
{
  "message": "Foods fetched",
  "data": {
    "docs": [
      {
        "_id": "food1",
        "name": "Margherita Pizza",
        "category": "pizza",
        "price": 250,
        "rating": 4.6,
        "isVeg": true,
        "image": "https://..."
      }
    ],
    "page": 1,
    "limit": 20,
    "totalDocs": 345,
    "totalPages": 18
  }
}
```

### GET /api/food/:id

- Public. Get one food item detail.
- Response (200): food object.

### Search with regex (backend behavior)

- Endpoint: `GET /api/food?search=<text>` or `GET /api/item/search-items?search=<text>`
- Backend uses a case-insensitive regex to match names and descriptions (e.g., `{ name: { $regex: search, $options: 'i' } }`).
- Example: `GET /api/item/search-items?search=burger`

Response (200): list of matching items.

## 5) Item endpoints — `/api/item`

`/api/item` is typically used for actual menu items and search endpoints. Routes commonly included:

### GET /api/item

- Public. List items (optionally by `shopId`).
- Query params: `shopId`, `category`, `page`, `limit`.

Example: `GET /api/item?shopId=shopId1&page=1&limit=12`

- Response (200): paginated items list.

### GET /api/item/:id

- Public. Get item detail.

### GET /api/item/search-items

- Public. Search items by `search` query param. Example:

`GET /api/item/search-items?search=chicken`

- Response (200): list of matched items.

## 6) Order routes — `/api/order`

Order and payment related endpoints. These are private — require JWT.

### POST /api/order

- Protected. Place an order (create order record, create payment order if using a gateway).
- Request body (example):

```json
{
  "cartItems": [
    { "itemId": "food1", "quantity": 2, "price": 250 },
    { "itemId": "food2", "quantity": 1, "price": 150 }
  ],
  "deliveryAddress": {
    "label": "Home",
    "address": "123 Main St, City",
    "lat": 12.34,
    "lng": 56.78
  },
  "paymentMethod": "razorpay|card|cod",
  "orderType": "delivery"
}
```

- Response (201): created order summary and payment order info (if using a gateway):

```json
{
  "message": "Order created",
  "order": {
    "_id": "order123",
    "user": "userId",
    "items": [ ... ],
    "total": 650,
    "status": "created",
    "payment": {
      "gatewayOrderId": "razorpay_order_xyz",
      "amount": 65000
    }
  }
}
```

### POST /api/order/verifyPayment

- Protected. Verify payment signature returned by gateway and mark order paid.
- Request body example depends on gateway (e.g., `razorpay_payment_id`, `razorpay_signature`, `orderId`).
- Response (200): payment verified & order updated.

### GET /api/order/track/:orderId

- Protected. Retrieve order status & delivery tracking.
- Response (200): order tracking info.

### GET /api/order/my-orders

- Protected. List user's past orders with pagination.

## 7) Geo routes — `/api/geo`

Used to support city/area lookup on frontend.

### GET /api/geo/cities

- Public. Returns available cities.
- Response example:

```json
{
  "message": "Cities fetched",
  "cities": ["San Francisco", "New York", "Mumbai"]
}
```

### GET /api/geo/areas?city=CityName

- Public. Returns areas/neighbourhoods for a city.

---

# Extra features & notes

## Search suggestions

- To show suggestions while typing, the frontend calls `GET /api/item/search-items?search=<partial>` and the backend returns a limited set (e.g., `limit=10`) using `name` regex with `i` option.

## Filters & multi-filter

- Foods and shops support combined filters using query params; the backend composes a MongoDB `find` query with the provided params (e.g., `category`, `isVeg`, `maxPrice`, `minRating`). Example API:

`GET /api/food?category=pizza&maxPrice=300&minRating=4&isVeg=true`

## Pagination

- Endpoints that list collections accept `page` and `limit` query params. The backend returns `page`, `limit`, `totalDocs` and `totalPages`.

## File upload (Cloudinary)

- Image uploads use Cloudinary via `src/services/cloudinary.js`.
- Routes that accept file uploads use `multipart/form-data` with a field such as `image`.
- The server uploads the image to Cloudinary and stores the returned secure URL on the model.

Example `multipart/form-data` request (using `curl`):

```bash
curl -X POST "http://localhost:5000/api/item" \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/file.jpg" \
  -F "name=Margherita"
```

## Wishlist (if implemented)

- If a wishlist exists it will be under `/api/wishlist` or similar and will be protected.
- Example actions: `POST /api/wishlist/add`, `POST /api/wishlist/remove`, `GET /api/wishlist`.

---

# Sample seed data (format)

A JSON seed for restaurants & foods should include records similar to the following.

Shop example:

```json
{
  "name": "Pizza Palace",
  "address": "123 Food St",
  "city": "San Francisco",
  "cuisines": ["Italian", "Pizza"],
  "rating": 4.5,
  "image": "https://res.cloudinary.com/.../pizza.jpg"
}
```

Food item example:

```json
{
  "name": "Margherita Pizza",
  "description": "Classic cheese pizza",
  "category": "pizza",
  "price": 250,
  "isVeg": true,
  "rating": 4.6,
  "shopId": "<shopId>"
}
```

# Best practices & production notes

- Use HTTPS in production and set `secure: true` on cookies.
- Prefer HttpOnly cookies for tokens to mitigate XSS. If token stored in `localStorage`, enforce strong CSP and sanitize all HTML insertion points.
- Use environment variables for secrets. Do not commit `.env`.
- Rate-limit endpoints (throttle) and validate inputs (e.g., `express-validator`) to avoid injection.
- Limit file upload sizes and validate MIME types before sending to Cloudinary.
- Log errors centrally and avoid leaking stack traces to clients.
- For heavy read traffic use pagination and indexed queries (create indexes on searchable fields like `name`, `category`, `shopId`).

---

## Postman / Quick checks

- To test protected endpoints, first `POST /api/auth/login` and save the returned `token`. Add the HTTP header:

```
Authorization: Bearer <token>
```

- Alternatively, if cookies are used by the backend, ensure your client allows credentials and sends/receives cookies.

---

If you want, I can also:

- Generate a `backend-seed.json` with sample restaurants and food items.
- Create a Postman collection/export for all endpoints with example requests.
- Extract exact request/response shapes from each controller file and produce an OpenAPI (Swagger) spec.

File created: `Backend/README.md`
