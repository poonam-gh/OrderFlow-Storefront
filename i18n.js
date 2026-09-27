const translations = {
  en: {
    logout: "Log out",
    nav_products: "Products",
    nav_orders: "Orders",
    nav_billing: "Billing",
    nav_profile: "Profile",

    auth_login_tab: "Log in",
    auth_register_tab: "Register",
    auth_email: "Email",
    auth_password: "Password",
    auth_login_btn: "Log in",
    auth_register_btn: "Create account",
    auth_role: "Account type",
    auth_role_customer: "Customer",
    auth_role_product_owner: "Product owner (CMS)",
    auth_hint: "Register a new account, or log in if you already have one.",

    products_heading: "Products",
    products_add_to_cart: "Add to cart",
    products_in_stock: "in stock",
    products_out_of_stock: "Out of stock",

    admin_add_product: "Add a product",
    admin_name_en: "Name (English)",
    admin_desc_en: "Description (English)",
    admin_name_hi: "Name (Hindi, optional)",
    admin_desc_hi: "Description (Hindi, optional)",
    admin_price: "Price (₹)",
    admin_stock: "Stock",
    admin_add_btn: "Add product",

    cart_bar_view: "View cart",
    cart_bar_items: "items",

    billing_heading: "Billing",
    billing_empty: "Your cart is empty.",
    billing_subtotal: "Subtotal",
    billing_total: "Total",
    billing_pay_btn: "Proceed to payment",
    billing_out_of_stock: "Not enough stock",
    billing_back_to_products: "Browse products",

    orders_heading: "Your orders",
    orders_empty: "No orders yet.",
    orders_view: "View",

    order_detail_heading: "Order details",
    order_detail_back: "Back to orders",
    order_detail_items: "Items",
    order_detail_total: "Total",
    order_detail_placed: "Placed",

    status_pending: "Pending",
    status_paid: "Paid",
    status_payment_failed: "Payment failed",

    profile_heading: "Profile",
    profile_email: "Email",
    profile_name: "Name",
    profile_phone: "Phone",
    profile_address: "Address",
    profile_save_btn: "Save changes",
    profile_saved: "Saved!",

    rzp_hint: 'Use 4111 1111 1111 1111 for a successful test payment, or any other card number to simulate a decline.',
    rzp_card_number: "Card number",
    rzp_expiry: "Expiry",
    rzp_cvv: "CVV",
    rzp_name: "Name on card",
    rzp_pay: "Pay",
    rzp_processing: "Processing payment…",
    rzp_confirming: "Confirming with merchant…",
  },
  hi: {
    logout: "लॉग आउट",
    nav_products: "उत्पाद",
    nav_orders: "ऑर्डर",
    nav_billing: "बिलिंग",
    nav_profile: "प्रोफ़ाइल",

    auth_login_tab: "लॉग इन",
    auth_register_tab: "रजिस्टर करें",
    auth_email: "ईमेल",
    auth_password: "पासवर्ड",
    auth_login_btn: "लॉग इन करें",
    auth_register_btn: "खाता बनाएं",
    auth_role: "खाता प्रकार",
    auth_role_customer: "ग्राहक",
    auth_role_product_owner: "प्रोडक्ट ओनर (सीएमएस)",
    auth_hint: "नया खाता बनाएं, या पहले से खाता है तो लॉग इन करें।",

    products_heading: "उत्पाद",
    products_add_to_cart: "कार्ट में डालें",
    products_in_stock: "स्टॉक में",
    products_out_of_stock: "स्टॉक ख़त्म",

    admin_add_product: "उत्पाद जोड़ें",
    admin_name_en: "नाम (अंग्रेज़ी)",
    admin_desc_en: "विवरण (अंग्रेज़ी)",
    admin_name_hi: "नाम (हिन्दी, वैकल्पिक)",
    admin_desc_hi: "विवरण (हिन्दी, वैकल्पिक)",
    admin_price: "कीमत (₹)",
    admin_stock: "स्टॉक",
    admin_add_btn: "उत्पाद जोड़ें",

    cart_bar_view: "कार्ट देखें",
    cart_bar_items: "वस्तुएं",

    billing_heading: "बिलिंग",
    billing_empty: "आपका कार्ट खाली है।",
    billing_subtotal: "उप-योग",
    billing_total: "कुल",
    billing_pay_btn: "भुगतान करें",
    billing_out_of_stock: "पर्याप्त स्टॉक नहीं",
    billing_back_to_products: "उत्पाद देखें",

    orders_heading: "आपके ऑर्डर",
    orders_empty: "अभी तक कोई ऑर्डर नहीं।",
    orders_view: "देखें",

    order_detail_heading: "ऑर्डर विवरण",
    order_detail_back: "ऑर्डर पर वापस जाएं",
    order_detail_items: "वस्तुएं",
    order_detail_total: "कुल",
    order_detail_placed: "दिनांक",

    status_pending: "लंबित",
    status_paid: "भुगतान हो गया",
    status_payment_failed: "भुगतान विफल",

    profile_heading: "प्रोफ़ाइल",
    profile_email: "ईमेल",
    profile_name: "नाम",
    profile_phone: "फ़ोन",
    profile_address: "पता",
    profile_save_btn: "बदलाव सहेजें",
    profile_saved: "सहेजा गया!",

    rzp_hint: "सफल टेस्ट भुगतान के लिए 4111 1111 1111 1111 का उपयोग करें, या असफल भुगतान दिखाने के लिए कोई भी अन्य कार्ड नंबर डालें।",
    rzp_card_number: "कार्ड नंबर",
    rzp_expiry: "समाप्ति तिथि",
    rzp_cvv: "सीवीवी",
    rzp_name: "कार्ड पर नाम",
    rzp_pay: "भुगतान करें",
    rzp_processing: "भुगतान प्रक्रिया में…",
    rzp_confirming: "व्यापारी से पुष्टि हो रही है…",
  },
};

let currentLang = localStorage.getItem("lang") || "en";

function t(key) {
  return (translations[currentLang] && translations[currentLang][key]) || translations.en[key] || key;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  applyTranslations();
  document.dispatchEvent(new CustomEvent("langchange"));
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
  });
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });
}
