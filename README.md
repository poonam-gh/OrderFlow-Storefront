# OrderFlow Storefront

A plain HTML/CSS/JS frontend for [OrderFlow](https://github.com/poonam-gh/OrderFlow) — no framework, no build step, nothing to install. It exists to demo the backend end-to-end: register/login, browse products, add to cart, and pay through a Razorpay-style checkout modal.

## Features

- **Tabbed navigation** — Products, Orders, Billing, Profile
- **Bottom sticky cart bar** → Billing screen, which calls the backend's `/billing/quote` API for server-authoritative pricing before checkout
- **Razorpay-style checkout modal** — mocked gateway, real HMAC signature verification round-trip against the backend
- **Full English/Hindi UI translation** (`i18n.js`), including product content itself
- **Role-aware UI** — a `product_owner`/`admin` account sees an "Add product" panel (bilingual content: English required, Hindi optional)
- **Order detail screen**, **editable profile** (name/phone/address)

## Running it

This is entirely static — any web server works:

```bash
python3 -m http.server 5500
```

Then open `http://localhost:5500`.

## Requirements

The [OrderFlow](https://github.com/poonam-gh/OrderFlow) backend must be running locally on `localhost:8080` (see that repo for setup — Postgres/Redis via `podman-compose`, then `orderflow migrate up`, `orderflow server`, `orderflow worker`). CORS is already enabled on the backend for local cross-origin requests.

## Structure

- `index.html` — all five screens (auth, products, orders, order-detail, billing, profile) plus the checkout modal, shown/hidden by a small JS router in `app.js`
- `app.js` — API calls, routing, cart/billing logic, the Razorpay-style checkout flow
- `i18n.js` — the English/Hindi translation dictionary and `applyTranslations()`
- `style.css` — everything else, including the Razorpay-style modal styling
