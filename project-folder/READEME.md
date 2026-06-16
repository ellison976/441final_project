# BHP Group Limited - Online Store Prototype

> A client-side e-commerce prototype developed for ICTWEB441 (Produce basic client-side script).

---

## 📖 Project Description

This project is a fully functional **front-end e-commerce prototype** built for **BHP Group Limited (ASX: BHP)** – one of the world's largest natural resources companies. The website simulates a B2B commodity store where customers can browse products (iron ore, coal, copper, etc.), add items to a shopping cart, register as a customer, and submit feedback.

### Key Features

| Feature | Description |
|---------|-------------|
| **Product Catalogue** | Browse products by category (Mining, Energy, Metals) with dynamic filtering. |
| **Shopping Cart** | Add/remove items, update quantities, apply coupon codes (BHP10 / BHP20), and calculate totals (subtotal, GST, shipping). |
| **Save for Later** | Temporarily remove items from the cart without losing them. |
| **Customer Registration** | Self‑registration with localStorage persistence (no backend required for the prototype). |
| **Admin Dashboard** | Admin login (Ellison / 123456) to add, edit, and delete products. |
| **Customer Feedback** | Submit star‑rating feedback; all feedback is displayed publicly (no moderation). |
| **Support Ticket System** | Submit support requests; data stored locally. |
| **Weather Widget** | Displays live Melbourne weather (BHP headquarters) using OpenWeatherMap API with caching. |
| **Responsive Design** | Mobile‑first layout with touch‑friendly buttons (min 44×44). |
| **Accessibility** | All images have `alt` text; keyboard navigation supported. |

---

## 🚀 How to Run the Project Locally

This is a **static HTML/CSS/JavaScript** project with **no build tools or server dependencies**. You can run it directly in your browser.

### Option 1: Open Directly (Quickest)

1. **Clone or download** this repository to your local machine.
2. Navigate to the project root folder.
3. **Double‑click `index.html`** – it will open in your default web browser.
4. All pages are linked via relative paths, so navigation works immediately.

### Option 2: Use a Local Development Server (Recommended)

Using a local server avoids CORS issues (especially when fetching `products.json`).

- **Using VS Code Live Server** (easiest):
  1. Open the project folder in VS Code.
  2. Install the "Live Server" extension (if not already installed).
  3. Right‑click `index.html` and select **"Open with Live Server"**.
  4. The site will open at `http://127.0.0.1:5500`.

- **Using Python** (if you have Python installed):
  ```bash
  # Python 3
  python -m http.server 8000
  # Then open http://localhost:8000 in your browser
  ## Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `Ellison` | `123456` |
| Customer | (self‑register) | (set during registration) |

---

## 🌤️ APIs Used and Why

### OpenWeatherMap API

- **Endpoint**: `https://api.openweathermap.org/data/2.5/weather`
- **Purpose**: Display the current weather at BHP's headquarters in **Melbourne, Australia**.
- **Why chosen**:
  - **Free tier** – sufficient for a prototype (1,000 calls/day).
  - **Simple REST API** – easy to integrate with vanilla JavaScript using `fetch()`.
  - **Cache support** – responses are stored in `localStorage` for 10 minutes to reduce API calls and improve performance.
  - **Fallback handling** – if the API key is invalid or the request fails, a user‑friendly error message is shown (no system details leaked).

> ⚠️ **Note**: The API key in `js/config.js` is a placeholder. Replace it with your own key from [OpenWeatherMap](https://openweathermap.org/api) if you want live weather data.

---

## 🧩 Challenges Faced and Solutions Implemented

| Challenge | Solution |
|-----------|----------|
| **XSS (Cross‑Site Scripting) vulnerability** – User input (e.g., feedback name) could contain `<script>` tags and execute malicious code. | Implemented `escapeHtml()` function (in `auth.js`) to escape `<`, `>`, `&` characters to HTML entities (`&lt;`, `&gt;`, `&amp;`). All user‑generated content is passed through this function before rendering. |
| **Product images not displaying** – Some images used absolute paths, others relative; missing images broke the UI. | Added conditional logic: if `image` starts with `http`, use it directly; otherwise prepend `/images/`. Also added an `onerror` fallback to a placeholder image. |
| **Cart inconsistency after product deletion** – When admin deleted a product, it remained in users' carts and saved‑for‑later lists. | Modified `deleteProduct()` to also filter `cart` and `savedForLater` arrays in `localStorage`, then save the cleaned data. |
| **Coupon codes case‑sensitive** – Users typed `bhp10` instead of `BHP10` and got no discount. | Used `.toUpperCase()` on the coupon input value before comparison. |
| **Weather API errors crashing the page** – If the API key was invalid, the entire script stopped. | Wrapped API calls in `try...catch` blocks. On failure, `showError()` displays a friendly message and the rest of the page continues to work. |
| **Form data lost on page refresh** – Users had to re‑enter long forms after accidental refresh. | Implemented **sessionStorage form drafts** (`session-storage.js`) – form data is auto‑saved on `input` and `change` events, and restored on page load. |

---

## 🏢 ASX Company Choice and Why

### BHP Group Limited (ASX: BHP)

**Why BHP was chosen**:

1. **Australian icon** – BHP is one of Australia's largest and most globally recognised companies, listed on the ASX. Using a well‑known brand makes the project relatable and realistic for an Australian vocational education context.

2. **Clear product categories** – BHP's core business (Mining, Energy, Metals) provides a natural and logical structure for an online catalogue, which aligns perfectly with the assessment requirements for product categorisation and filtering.

3. **Publicly available information** – BHP's official website (bhp.com) offers comprehensive product descriptions, images, and company background, making it easy to model realistic content.

4. **Global relevance** – While based in Australia, BHP operates worldwide. This allowed the project to incorporate a **weather widget** (Melbourne headquarters) and demonstrate real‑world API integration.

5. **Educational fit** – The commodity‑based product range (iron ore, coal, copper, etc.) is straightforward to present in a web store format without requiring complex product variations (like size or colour), keeping the focus on the core client‑side scripting skills.

---

## 📁 Project Structure

```text
ICTWEB441/
├── index.html                 # Homepage (hero video, carousel, featured products)
├── html/
│   ├── products.html          # Product catalogue with category filters
│   ├── cart.html              # Shopping cart + saved‑for‑later
│   ├── admin.html             # Admin dashboard (product CRUD, customer list)
│   ├── about.html             # Company information
│   ├── support.html           # Support ticket + weather widget
│   └── feedback.html          # Star‑rating feedback form
├── css/
│   ├── style.css              # Main styling
│   ├── responsive.css         # Mobile/tablet media queries
│   └── weather.css            # Weather widget specific styles
├── js/
│   ├── global.js              # Shared functions (cart, modal, toast)
│   ├── auth.js                # Login/register/logout + XSS escape
│   ├── products.js            # Product CRUD, filtering, rendering
│   ├── cart.js                # Cart operations, coupons, checkout
│   ├── api.js                 # Weather API fetch + caching
│   ├── support.js             # Support ticket submission
│   ├── feedback.js            # Feedback submission + display
│   ├── carousel.js            # Homepage carousel
│   └── session-storage.js     # Form draft auto‑save, filter persistence
├── data/
│   └── products.json          # Initial product dataset (20 items)
├── images/                    # All product images, logo, banner, videos
└── README.md                  # This file
```
## 🛠️ Technologies Used

- **HTML5** – Semantic markup, accessible structure.
- **CSS3** – Custom styling, Flexbox/Grid layout, responsive design.
- **JavaScript (ES6+)** – Vanilla JS, no external libraries (except Font Awesome for icons).
- **localStorage / sessionStorage** – Client‑side data persistence.
- **OpenWeatherMap API** – Live weather data.
- **Figma** – Wireframe design (see Portfolio for screenshots).

---

## 📝 Future Improvements

- **Backend database** – Replace localStorage with a real database (e.g., MongoDB + Node.js) for multi‑user data sharing.
- **Payment integration** – Add Stripe or PayPal for real transactions.
- **Order history** – Allow customers to view past orders.
- **Email notifications** – Send order confirmations and support responses via email.
- **Unit testing** – Add Jest tests for critical functions (cart logic, form validation).

---

## 📄 License

This project was created for **ICTWEB441 Produce basic client‑side script** – a vocational education and training (VET) assessment. All rights reserved by the student.

---

## 👤 Author

**Student Name:** Ellison  
**Student ID:** 243190737  
**Class:** IT1  
**Date:** June 2026

---

> ⚡ *This prototype is for educational purposes only. Not intended for production use.*
