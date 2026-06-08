const LOGO_SRC = "/favicon.svg";
const SERVICE_DESK_ADDRESS =
  "49/5, SH 1, Dunlop, Narendra Nagar, Beehive Garden, Belghoria, Kolkata, West Bengal 700056";

const escapeHtml = (value) =>
  `${value ?? ""}`
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatCurrency = (value) => {
  const numberValue = Number(value);
  const safeValue = Number.isFinite(numberValue) ? numberValue : 0;

  return `Rs. ${safeValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value) => {
  if (!value) return new Date().toLocaleDateString("en-IN");

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toLocaleDateString("en-IN");

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatStatus = (value) =>
  `${value || "confirmed"}`
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const safeFileName = (value) =>
  `${value || "order"}`.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "");

const getCustomerName = (order) => {
  const userName = [order.user?.firstName, order.user?.lastName].filter(Boolean).join(" ").trim();
  return order.shippingDetails?.fullName || userName || order.user?.email || "Customer";
};

const getAddressLine = (address) => {
  if (!address) return "Address not available";

  return [
    address.houseNo,
    address.street,
    address.landmark,
    address.city,
    address.state,
    address.pincode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
};

const getItemName = (item, index) => item.productId?.title || `Product ${index + 1}`;

const getInvoiceHtml = (order) => {
  const orderId = order.orderId || order._id || "ORDER";
  const items = Array.isArray(order.orderItems) ? order.orderItems : [];
  const customerName = getCustomerName(order);
  const shippingAddress = order.shippingDetails;
  const billingAddress = order.isSameAsShipping ? order.shippingDetails : order.billingAddress;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invoice ${escapeHtml(orderId)}</title>
  <style>
    :root { color: #0f172a; font-family: Inter, Arial, sans-serif; }
    body { margin: 0; background: #f4faff; padding: 32px; }
    .invoice { max-width: 920px; margin: 0 auto; overflow: hidden; border: 1px solid #cfe7ff; border-radius: 20px; background: #fff; box-shadow: 0 24px 70px rgba(25, 84, 145, 0.12); }
    .hero { display: flex; justify-content: space-between; gap: 24px; padding: 30px; color: #fff; background: linear-gradient(135deg, #10213c 0%, #246cf0 100%); }
    .brand { margin: 0; font-size: 30px; font-weight: 800; }
    .company-block { max-width: 330px; text-align: right; }
    .company-logo { height: 56px; max-width: 190px; object-fit: contain; object-position: right center; border-radius: 10px; background: rgba(255,255,255,.92); padding: 7px 10px; }
    .company-name { margin-top: 10px; font-size: 18px; font-weight: 900; }
    .service-address { margin-top: 6px; font-size: 12px; line-height: 1.5; color: rgba(255,255,255,.82); }
    .muted { color: #64748b; }
    .hero .muted { color: rgba(255,255,255,.78); }
    .pill { display: inline-flex; border-radius: 999px; background: rgba(255,255,255,.14); padding: 8px 12px; font-size: 13px; font-weight: 800; }
    .section { padding: 24px 30px; border-top: 1px solid #dbeafe; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
    h2 { margin: 0 0 10px; font-size: 16px; }
    p { margin: 4px 0; line-height: 1.55; }
    table { width: 100%; border-collapse: collapse; }
    th { color: #246cf0; font-size: 12px; text-align: left; text-transform: uppercase; }
    th, td { padding: 12px 10px; border-bottom: 1px solid #e5f2ff; vertical-align: top; }
    td:last-child, th:last-child { text-align: right; }
    .total-box { margin-left: auto; width: min(360px, 100%); }
    .row { display: flex; justify-content: space-between; gap: 20px; padding: 8px 0; }
    .grand { margin-top: 10px; border-top: 1px solid #cfe7ff; padding-top: 14px; font-size: 20px; font-weight: 800; }
    @media print { body { background: #fff; padding: 0; } .invoice { border-radius: 0; box-shadow: none; } }
  </style>
</head>
<body>
  <main class="invoice">
    <section class="hero">
      <div>
        <p class="pill">Tax Invoice</p>
        <h1 class="brand">Invoice</h1>
        <p class="muted">Premium botanics and wellness essentials</p>
        <p><strong>Invoice:</strong> ${escapeHtml(orderId)}</p>
        <p><strong>Date:</strong> ${escapeHtml(formatDate(order.createdAt))}</p>
        <p><strong>Status:</strong> ${escapeHtml(formatStatus(order.orderStatus))}</p>
      </div>
      <div class="company-block">
        <img class="company-logo" src="${escapeHtml(LOGO_SRC)}" alt="Medha Botanics logo" />
        <div class="company-name">Medha Botanics</div>
        <p class="service-address"><strong>MedhaBotanics Service Desk</strong><br />${escapeHtml(SERVICE_DESK_ADDRESS)}</p>
      </div>
    </section>

    <section class="section grid">
      <div>
        <h2>Billed To</h2>
        <p><strong>${escapeHtml(customerName)}</strong></p>
        <p>${escapeHtml(getAddressLine(billingAddress))}</p>
        <p>${escapeHtml(order.user?.email || "")}</p>
      </div>
      <div>
        <h2>Ship To</h2>
        <p><strong>${escapeHtml(shippingAddress?.fullName || customerName)}</strong></p>
        <p>${escapeHtml(getAddressLine(shippingAddress))}</p>
        <p>Mobile: ${escapeHtml(shippingAddress?.mobileNumber || order.user?.phoneNumber || "-")}</p>
      </div>
    </section>

    <section class="section">
      <table>
        <thead><tr><th>Product</th><th>Pack</th><th>Qty</th><th>Amount</th></tr></thead>
        <tbody>
          ${
            items
              .map(
                (item, index) => `<tr>
                  <td><strong>${escapeHtml(getItemName(item, index))}</strong><br><span class="muted">${escapeHtml(item.category || "Product")}</span></td>
                  <td>${escapeHtml(item.selectedQuantity ? `${item.selectedQuantity} capsules` : "-")}</td>
                  <td>${escapeHtml(item.quantity || 0)}</td>
                  <td>${escapeHtml(formatCurrency(item.finalPrice))}</td>
                </tr>`,
              )
              .join("") || '<tr><td colspan="4">No order items available.</td></tr>'
          }
        </tbody>
      </table>
    </section>

    <section class="section">
      <div class="total-box">
        <div class="row"><span>Subtotal</span><strong>${escapeHtml(formatCurrency(order.subtotal))}</strong></div>
        <div class="row"><span>Product discount</span><strong>- ${escapeHtml(formatCurrency(order.productDiscountTotal))}</strong></div>
        <div class="row"><span>Promo discount ${escapeHtml(order.promoCode ? `(${order.promoCode})` : "")}</span><strong>- ${escapeHtml(formatCurrency(order.promoDiscountAmount))}</strong></div>
        <div class="row"><span>GST</span><strong>${escapeHtml(formatCurrency(order.gst))}</strong></div>
        <div class="row"><span>Shipping</span><strong>${escapeHtml(formatCurrency(order.shippingCharges))}</strong></div>
        <div class="row grand"><span>Total</span><strong>${escapeHtml(formatCurrency(order.totalAmount))}</strong></div>
        <p class="muted">Payment: ${escapeHtml(order.paymentMethod || "COD")} ${order.paymentStatus ? `(${escapeHtml(order.paymentStatus)})` : ""}</p>
      </div>
    </section>
  </main>
</body>
</html>`;
};

const getShippingLabelHtml = (order) => {
  const orderId = order.orderId || order._id || "ORDER";
  const address = order.shippingDetails;
  const items = Array.isArray(order.orderItems) ? order.orderItems : [];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Shipping Label ${escapeHtml(orderId)}</title>
  <style>
    body { margin: 0; padding: 24px; color: #0f172a; font-family: Inter, Arial, sans-serif; background: #f8fafc; }
    .label { width: 420px; min-height: 560px; margin: 0 auto; border: 2px solid #0f172a; border-radius: 14px; background: #fff; padding: 22px; }
    .top { display: flex; justify-content: space-between; gap: 18px; border-bottom: 2px solid #0f172a; padding-bottom: 14px; }
    .brand-wrap { display: flex; align-items: flex-start; gap: 12px; }
    .logo { height: 44px; width: 44px; object-fit: contain; }
    .brand { font-size: 24px; font-weight: 900; }
    .chip { border: 1px solid #0f172a; border-radius: 999px; padding: 6px 10px; font-size: 12px; font-weight: 800; }
    h2 { margin: 18px 0 8px; font-size: 13px; text-transform: uppercase; letter-spacing: .12em; }
    p { margin: 6px 0; line-height: 1.5; }
    .name { font-size: 24px; font-weight: 900; }
    .order { margin-top: 18px; border-top: 1px dashed #94a3b8; border-bottom: 1px dashed #94a3b8; padding: 14px 0; }
    .barcode { margin-top: 18px; border: 1px solid #0f172a; padding: 12px; text-align: center; font-size: 26px; letter-spacing: .18em; }
    @media print { body { padding: 0; background: #fff; } .label { width: auto; min-height: auto; border-radius: 0; } }
  </style>
</head>
<body>
  <main class="label">
    <section class="top">
      <div class="brand-wrap">
        <img class="logo" src="${escapeHtml(LOGO_SRC)}" alt="Medha Botanics logo" />
        <div>
          <div class="brand">Medha Botanics</div>
          <p>MedhaBotanics Service Desk</p>
          <p>${escapeHtml(SERVICE_DESK_ADDRESS)}</p>
        </div>
      </div>
      <span class="chip">${escapeHtml(formatStatus(order.orderStatus))}</span>
    </section>

    <h2>Ship To</h2>
    <p class="name">${escapeHtml(address?.fullName || getCustomerName(order))}</p>
    <p>${escapeHtml(getAddressLine(address))}</p>
    <p><strong>Mobile:</strong> ${escapeHtml(address?.mobileNumber || order.user?.phoneNumber || "-")}</p>
    ${address?.alternateMobileNumber ? `<p><strong>Alternate:</strong> ${escapeHtml(address.alternateMobileNumber)}</p>` : ""}

    <section class="order">
      <p><strong>Order:</strong> ${escapeHtml(orderId)}</p>
      <p><strong>Payment:</strong> ${escapeHtml(order.paymentMethod || "COD")}</p>
      <p><strong>Items:</strong> ${escapeHtml(items.length)}</p>
      <p><strong>Total:</strong> ${escapeHtml(formatCurrency(order.totalAmount))}</p>
    </section>

    <h2>Contents</h2>
    <p>${escapeHtml(items.map((item, index) => getItemName(item, index)).join(", ") || "Wellness products")}</p>

    <div class="barcode">${escapeHtml(orderId)}</div>
  </main>
</body>
</html>`;
};

export const downloadOrderInvoice = (order) => {
  const orderId = safeFileName(order.orderId || order._id || "order");
  const blob = new Blob([getInvoiceHtml(order)], { type: "text/html;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `invoice-${orderId}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const printShippingLabel = (order) => {
  const printWindow = window.open("", "_blank", "width=640,height=760");

  if (!printWindow) return;

  printWindow.document.write(getShippingLabelHtml(order));
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};
