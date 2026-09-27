const API_BASE = "http://localhost:8080";

const state = {
  token: localStorage.getItem("token") || null,
  email: localStorage.getItem("email") || null,
  role: localStorage.getItem("role") || null,
  cart: [], // [{id, name, price_cents, stock, quantity}]
  products: [],
  currentRoute: "products",
  currentOrderId: null,
};

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers["Authorization"] = "Bearer " + state.token;

  const res = await fetch(API_BASE + path, { ...options, headers });
  const isJSON = res.headers.get("content-type")?.includes("application/json");
  const body = isJSON ? await res.json() : null;

  // A 401 here means the token is missing/expired/invalid — not that this
  // particular screen did anything wrong. Bounce back to login instead of
  // surfacing a confusing raw error on whatever screen triggered it.
  if (res.status === 401 && state.token) {
    clearAuth();
    state.cart = [];
    showAuth();
    const errEl = document.getElementById("auth-error");
    errEl.textContent = "Your session expired — please log in again.";
    errEl.classList.remove("hidden");
    throw new Error("session expired");
  }

  if (!res.ok) {
    throw new Error(body?.error || `Request failed (${res.status})`);
  }
  return body;
}

function setAuth(token, email, role) {
  state.token = token;
  state.email = email;
  state.role = role;
  localStorage.setItem("token", token);
  localStorage.setItem("email", email);
  localStorage.setItem("role", role);
}

function clearAuth() {
  state.token = state.email = state.role = null;
  localStorage.clear();
}

function decodeJwtRole(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || "customer";
  } catch {
    return "customer";
  }
}

// ---- routing between screens ----

function navigateTo(route, param) {
  state.currentRoute = route;
  if (route === "order-detail") state.currentOrderId = param;

  document.querySelectorAll(".screen").forEach((s) => s.classList.add("hidden"));
  document.getElementById("screen-" + route).classList.remove("hidden");

  document.querySelectorAll(".tab-nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.route === route);
  });

  renderCurrentScreen();
}

function renderCurrentScreen() {
  switch (state.currentRoute) {
    case "products":
      loadProducts();
      break;
    case "orders":
      loadMyOrders();
      break;
    case "order-detail":
      loadOrderDetail(state.currentOrderId);
      break;
    case "billing":
      renderBilling();
      break;
    case "profile":
      loadProfile();
      break;
  }
}

document.querySelectorAll(".tab-nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => navigateTo(btn.dataset.route));
});

document.getElementById("order-detail-back").addEventListener("click", () => navigateTo("orders"));
document.getElementById("cart-bar-btn").addEventListener("click", () => navigateTo("billing"));
document.getElementById("billing-browse-btn").addEventListener("click", () => navigateTo("products"));

// ---- language switch ----

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => setLang(btn.dataset.lang));
});
document.addEventListener("langchange", () => {
  if (state.token) renderCurrentScreen();
});

// ---- view switching (auth vs app) ----

function showApp() {
  document.getElementById("auth-view").classList.add("hidden");
  document.getElementById("tab-nav").classList.remove("hidden");
  document.getElementById("user-info").classList.remove("hidden");
  document.getElementById("user-email").textContent = state.email;
  const canManageProducts = state.role === "admin" || state.role === "product_owner";
  document.getElementById("admin-panel").classList.toggle("hidden", !canManageProducts);
  document.getElementById("admin-panel-role-badge").textContent = state.role;
  navigateTo("products");
  renderCartBar();
}

function showAuth() {
  document.getElementById("auth-view").classList.remove("hidden");
  document.getElementById("tab-nav").classList.add("hidden");
  document.getElementById("user-info").classList.add("hidden");
  document.querySelectorAll(".screen").forEach((s) => s.classList.add("hidden"));
  document.getElementById("cart-bar").classList.add("hidden");
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab + "-form").classList.add("active");
  });
});

// ---- auth ----

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errEl = document.getElementById("auth-error");
  errEl.classList.add("hidden");

  try {
    const { token } = await api("/users/login", { method: "POST", body: JSON.stringify({ email, password }) });
    setAuth(token, email, decodeJwtRole(token));
    showApp();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  }
});

document.getElementById("register-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("register-email").value;
  const password = document.getElementById("register-password").value;
  const role = document.getElementById("register-role").value;
  const errEl = document.getElementById("auth-error");
  errEl.classList.add("hidden");

  try {
    await api("/users/register", { method: "POST", body: JSON.stringify({ email, password, role }) });
    const { token } = await api("/users/login", { method: "POST", body: JSON.stringify({ email, password }) });
    setAuth(token, email, decodeJwtRole(token));
    showApp();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  clearAuth();
  state.cart = [];
  showAuth();
});

// ---- products screen ----

async function loadProducts() {
  const { products } = await api(`/products?limit=50&lang=${currentLang}`);
  state.products = products || [];
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = "";
  state.products.forEach((p) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <div class="product-name">${p.name}</div>
      <div class="product-price">₹${(p.price_cents / 100).toFixed(2)}</div>
      <div class="product-stock ${p.stock === 0 ? "low" : ""}">${p.stock === 0 ? t("products_out_of_stock") : p.stock + " " + t("products_in_stock")}</div>
      <button class="btn btn-secondary" ${p.stock === 0 ? "disabled" : ""}>${t("products_add_to_cart")}</button>
    `;
    card.querySelector("button").addEventListener("click", () => addToCart(p));
    grid.appendChild(card);
  });
}

function addToCart(product) {
  const existing = state.cart.find((i) => i.id === product.id);
  if (existing) {
    if (existing.quantity < product.stock) existing.quantity++;
  } else {
    state.cart.push({ id: product.id, name: product.name, price_cents: product.price_cents, stock: product.stock, quantity: 1 });
  }
  renderCartBar();
  if (state.currentRoute === "billing") renderBilling();
}

function changeQty(id, delta) {
  const item = state.cart.find((i) => i.id === id);
  if (!item) return;
  item.quantity = Math.min(item.stock, Math.max(0, item.quantity + delta));
  state.cart = state.cart.filter((i) => i.quantity > 0);
  renderCartBar();
  renderBilling();
}

// ---- bottom cart bar ----

function renderCartBar() {
  const bar = document.getElementById("cart-bar");
  if (!state.token || state.cart.length === 0) {
    bar.classList.add("hidden");
    return;
  }
  bar.classList.remove("hidden");
  const count = state.cart.reduce((sum, i) => sum + i.quantity, 0);
  const total = state.cart.reduce((sum, i) => sum + i.price_cents * i.quantity, 0);
  document.getElementById("cart-bar-summary").textContent = `${count} ${t("cart_bar_items")} · ₹${(total / 100).toFixed(2)}`;
}

// ---- billing screen (cart review -> pay) ----

async function renderBilling() {
  const itemsEl = document.getElementById("billing-items");
  const emptyEl = document.getElementById("billing-empty");
  const totalsEl = document.getElementById("billing-totals");
  const payBtn = document.getElementById("billing-pay-btn");
  const browseBtn = document.getElementById("billing-browse-btn");
  const errEl = document.getElementById("billing-error");
  errEl.classList.add("hidden");
  document.getElementById("order-status-card").classList.add("hidden");

  if (state.cart.length === 0) {
    itemsEl.innerHTML = "";
    emptyEl.classList.remove("hidden");
    totalsEl.classList.add("hidden");
    payBtn.classList.add("hidden");
    browseBtn.classList.remove("hidden");
    return;
  }
  emptyEl.classList.add("hidden");
  browseBtn.classList.add("hidden");

  // Server-priced quote — authoritative stock/price, not just client math.
  let quote;
  try {
    quote = await api("/billing/quote", {
      method: "POST",
      body: JSON.stringify({
        items: state.cart.map((i) => ({ product_id: i.id, quantity: i.quantity })),
        language: currentLang,
      }),
    });
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
    return;
  }

  itemsEl.innerHTML = "";
  let allInStock = true;
  quote.items.forEach((line) => {
    if (!line.in_stock) allInStock = false;
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <span>${line.name}</span>
      <div class="cart-item-controls">
        <button class="qty-btn">−</button>
        <span>${line.quantity}</span>
        <button class="qty-btn">+</button>
      </div>
      <span>₹${(line.line_total_cents / 100).toFixed(2)}</span>
      ${!line.in_stock ? `<span class="billing-item-warning">${t("billing_out_of_stock")}</span>` : ""}
    `;
    row.querySelectorAll(".qty-btn")[0].addEventListener("click", () => changeQty(line.product_id, -1));
    row.querySelectorAll(".qty-btn")[1].addEventListener("click", () => changeQty(line.product_id, 1));
    itemsEl.appendChild(row);
  });

  document.getElementById("billing-subtotal").textContent = "₹" + (quote.subtotal_cents / 100).toFixed(2);
  document.getElementById("billing-total").textContent = "₹" + (quote.total_cents / 100).toFixed(2);
  totalsEl.classList.remove("hidden");
  payBtn.classList.remove("hidden");
  payBtn.disabled = !allInStock;
}

document.getElementById("billing-pay-btn").addEventListener("click", async () => {
  const errEl = document.getElementById("billing-error");
  errEl.classList.add("hidden");

  const items = state.cart.map((i) => ({ product_id: i.id, quantity: i.quantity }));
  // A fresh key per checkout click — if this exact click's request is
  // retried (e.g. a flaky network), the backend recognizes it as the same
  // attempt and returns the original order instead of creating a duplicate.
  const idempotencyKey = crypto.randomUUID();

  try {
    const order = await api("/orders", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify({ items }),
    });
    state.cart = [];
    renderCartBar();
    showOrderStatus(order);
    await openRazorpayCheckout(order);
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  }
});

function statusBadgeHTML(status) {
  const key = status === "payment_failed" ? "status_payment_failed" : status === "paid" ? "status_paid" : "status_pending";
  const spinner = status === "pending" ? `<span class="spinner"></span>` : "";
  return `<span class="status-badge status-${status}">${spinner}${t(key)}</span>`;
}

function showOrderStatus(order) {
  const card = document.getElementById("order-status-card");
  const body = document.getElementById("order-status-body");
  card.classList.remove("hidden");
  body.innerHTML = `
    <p>Order <span class="order-row-id">${order.id}</span></p>
    <p>${t("order_detail_total")}: <strong>₹${(order.total_cents / 100).toFixed(2)}</strong></p>
    <p id="order-status-badge">${statusBadgeHTML(order.status)}</p>
  `;
}

function updateOrderStatusBadge(status) {
  const badge = document.getElementById("order-status-badge");
  if (badge) badge.innerHTML = statusBadgeHTML(status);
}

// ---- orders list + detail screens ----

async function loadMyOrders() {
  const { orders } = await api("/orders?limit=20");
  const list = document.getElementById("orders-list");
  list.innerHTML = "";
  if (!orders || orders.length === 0) {
    list.innerHTML = `<p class="cart-empty">${t("orders_empty")}</p>`;
    return;
  }
  orders.forEach((o) => {
    const row = document.createElement("div");
    row.className = "order-row";
    row.innerHTML = `
      <span class="order-row-id">${o.id.slice(0, 8)}…</span>
      <span>₹${(o.total_cents / 100).toFixed(2)}</span>
      ${statusBadgeHTML(o.status)}
    `;
    row.addEventListener("click", () => navigateTo("order-detail", o.id));
    list.appendChild(row);
  });
}

async function loadOrderDetail(orderId) {
  const body = document.getElementById("order-detail-body");
  body.innerHTML = "";
  try {
    const o = await api(`/orders/${orderId}`);
    const itemsHTML = (o.items || [])
      .map((it) => `<div class="order-row"><span>${it.product_id.slice(0, 8)}…</span><span>x${it.quantity}</span><span>₹${(it.unit_price_cents / 100).toFixed(2)}</span></div>`)
      .join("");
    body.innerHTML = `
      <p class="order-row-id">${o.id}</p>
      <p>${statusBadgeHTML(o.status)}</p>
      <p>${t("order_detail_placed")}: ${new Date(o.created_at).toLocaleString()}</p>
      <h3>${t("order_detail_items")}</h3>
      <div class="orders-list">${itemsHTML}</div>
      <p class="billing-total-row" style="margin-top:14px;">${t("order_detail_total")}: ₹${(o.total_cents / 100).toFixed(2)}</p>
    `;
  } catch (err) {
    body.innerHTML = `<p class="error">${err.message}</p>`;
  }
}

// ---- profile screen ----

async function loadProfile() {
  try {
    const u = await api("/users/me");
    document.getElementById("profile-email").value = u.email || "";
    document.getElementById("profile-name").value = u.name || "";
    document.getElementById("profile-phone").value = u.phone || "";
    document.getElementById("profile-address").value = u.address || "";
  } catch (err) {
    // ignore — form just stays empty
  }
}

document.getElementById("profile-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const savedMsg = document.getElementById("profile-saved");
  savedMsg.classList.add("hidden");

  try {
    await api("/users/me", {
      method: "PATCH",
      body: JSON.stringify({
        name: document.getElementById("profile-name").value,
        phone: document.getElementById("profile-phone").value,
        address: document.getElementById("profile-address").value,
      }),
    });
    savedMsg.classList.remove("hidden");
    setTimeout(() => savedMsg.classList.add("hidden"), 2000);
  } catch (err) {
    alert(err.message);
  }
});

// ---- Razorpay-style checkout modal ----
// Real Razorpay flow: backend creates a gateway order -> frontend opens
// checkout.js with it -> gateway returns payment_id + signature -> we hand
// those to our backend, which independently re-verifies the signature.
// Everything below mimics that shape against our own mocked endpoints.

const rzpOverlay = document.getElementById("razorpay-overlay");
const rzpForm = document.getElementById("rzp-form");
let rzpCurrentOrderId = null;
let rzpCurrentRazorpayOrderId = null;

async function openRazorpayCheckout(order) {
  const errEl = document.getElementById("billing-error");

  let session;
  try {
    session = await api(`/orders/${order.id}/checkout`, { method: "POST" });
  } catch (err) {
    errEl.textContent = "Could not start checkout: " + err.message;
    errEl.classList.remove("hidden");
    return;
  }

  rzpCurrentOrderId = order.id;
  rzpCurrentRazorpayOrderId = session.razorpay_order_id;

  document.getElementById("rzp-amount").textContent = "₹" + (session.amount_cents / 100).toFixed(2);
  document.getElementById("rzp-order-id").textContent = session.razorpay_order_id;
  document.getElementById("rzp-pay-amount").textContent = "₹" + (session.amount_cents / 100).toFixed(2);
  document.getElementById("rzp-error").classList.add("hidden");
  rzpForm.classList.remove("hidden");
  document.getElementById("rzp-processing").classList.add("hidden");

  rzpOverlay.classList.remove("hidden");
}

function closeRazorpayCheckout() {
  rzpOverlay.classList.add("hidden");
  loadProducts();
  if (state.currentRoute === "orders") loadMyOrders();
}

document.getElementById("rzp-close").addEventListener("click", closeRazorpayCheckout);

rzpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("rzp-error");
  errEl.classList.add("hidden");

  const cardNumber = document.getElementById("rzp-card-number").value;

  rzpForm.classList.add("hidden");
  const processing = document.getElementById("rzp-processing");
  processing.classList.remove("hidden");
  document.getElementById("rzp-processing-label").textContent = t("rzp_processing");

  try {
    // Step 1: the gateway (simulated) processes the card and signs the result.
    // In real life this call goes to Razorpay's servers, never ours.
    const charge = await fetch("http://localhost:8080/razorpay-simulator/charge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ razorpay_order_id: rzpCurrentRazorpayOrderId, card_number: cardNumber }),
    }).then((r) => r.json());

    document.getElementById("rzp-processing-label").textContent = t("rzp_confirming");

    // Step 2: hand the gateway's response to OUR backend, which
    // independently re-verifies the signature before trusting it.
    const result = await api(`/orders/${rzpCurrentOrderId}/verify-payment`, {
      method: "POST",
      body: JSON.stringify({
        razorpay_order_id: charge.razorpay_order_id,
        razorpay_payment_id: charge.razorpay_payment_id,
        razorpay_signature: charge.razorpay_signature,
      }),
    }).catch((err) => ({ status: "payment_failed", error: err.message }));

    updateOrderStatusBadge(result.status);
    processing.classList.add("hidden");

    setTimeout(() => {
      rzpOverlay.classList.add("hidden");
      loadProducts();
      if (state.currentRoute === "orders") loadMyOrders();
    }, result.status === "paid" ? 900 : 1400);
  } catch (err) {
    processing.classList.add("hidden");
    rzpForm.classList.remove("hidden");
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  }
});

// ---- admin: add product (bilingual content) ----

document.getElementById("product-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("product-form-error");
  errEl.classList.add("hidden");

  const nameEn = document.getElementById("product-name-en").value;
  const descEn = document.getElementById("product-desc-en").value;
  const nameHi = document.getElementById("product-name-hi").value;
  const descHi = document.getElementById("product-desc-hi").value;
  const priceRupees = parseFloat(document.getElementById("product-price").value);
  const stock = parseInt(document.getElementById("product-stock").value, 10);

  const content = [{ language_code: "en", name: nameEn, description: descEn }];
  if (nameHi.trim()) content.push({ language_code: "hi", name: nameHi, description: descHi });

  try {
    await api("/products", {
      method: "POST",
      body: JSON.stringify({ price_cents: Math.round(priceRupees * 100), stock, content }),
    });
    e.target.reset();
    loadProducts();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove("hidden");
  }
});

// ---- boot ----

applyTranslations();
if (state.token) {
  showApp();
} else {
  showAuth();
}
