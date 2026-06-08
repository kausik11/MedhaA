import medhaLogoUrl from "../assets/MDB_logo.png";

const SERVICE_DESK_ADDRESS =
  "49/5, SH 1, Dunlop, Nagendra Nagar, Beehive Garden, Belghoria, Kolkata, WB-700056";
const GSTIN = "19AAKCD8456G1Z6";

const escapeHtml = (value) =>
  `${value ?? ""}`
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatAmount = (value) => {
  const numberValue = Number(value);
  const safeValue = Number.isFinite(numberValue) ? numberValue : 0;

  return safeValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatCurrency = (value) => `Rs. ${formatAmount(value)}`;

const formatInvoiceDate = (value) => {
  const date = value ? new Date(value) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const day = `${safeDate.getDate()}`.padStart(2, "0");
  const month = `${safeDate.getMonth() + 1}`.padStart(2, "0");
  const year = `${safeDate.getFullYear()}`.slice(-2);

  return `${day}.${month}.${year}`;
};

const formatStatus = (value) =>
  `${value || "pending"}`
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const safeFileName = (value) =>
  `${value || "order"}`.replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "");

const blobToDataUri = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(`${reader.result}`);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

const getImageDataUri = async (src) => {
  try {
    const response = await fetch(src);
    const blob = await response.blob();

    return blobToDataUri(blob);
  } catch {
    return src;
  }
};

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

const getPaymentLabel = (paymentMethod) =>
  paymentMethod === "RAZORPAY" ? "Pay Online" : "Cash On Delivery";

const getInvoiceHtml = (order, logoSrc) => {
  const orderId = order.orderId || order._id || "ORDER";
  const items = Array.isArray(order.orderItems) ? order.orderItems : [];
  const customerName = getCustomerName(order);
  const shippingAddress = order.shippingDetails;
  const billingAddress = order.isSameAsShipping ? order.shippingDetails : order.billingAddress;
  const paymentMethod = order.paymentMethod || "COD";
  const paymentStatus = order.paymentStatus || "pending";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Invoice ${escapeHtml(orderId)}</title>
  <style>
    :root { color: #070d22; font-family: Inter, Arial, sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #eef6ff; padding: 28px; }
    .invoice { position: relative; max-width: 980px; min-height: 1280px; margin: 0 auto; overflow: hidden; border-radius: 0 0 20px 20px; background: #fff; box-shadow: 0 28px 70px rgba(15, 23, 42, 0.12); }
    .content { position: relative; z-index: 1; padding: 58px 74px 150px; }
    .watermark { position: absolute; left: 50%; top: 50%; width: min(680px, 72%); opacity: .045; transform: translate(-50%, -38%); text-align: center; color: #2f73e8; font-size: 78px; font-weight: 900; line-height: .98; letter-spacing: 0; }
    .top { display: grid; grid-template-columns: minmax(0, .95fr) minmax(300px, .78fr); gap: 64px; align-items: start; }
    .brand-logo { display: block; width: 236px; max-width: 100%; height: auto; object-fit: contain; }
    .company-address { margin-top: 42px; max-width: 430px; font-size: 22px; font-weight: 700; line-height: 1.45; color: #111827; }
    .gstin { margin-top: 16px; color: #111827; font-size: 18px; font-weight: 800; letter-spacing: .02em; }
    .invoice-card { margin-left: auto; overflow: hidden; border-radius: 12px; background: linear-gradient(135deg, #2f78f4 0%, #073b9e 100%); padding: 28px 42px; color: #fff; text-align: center; }
    .invoice-card h1 { margin: 0; font-size: 40px; font-weight: 700; line-height: 1.1; }
    .invoice-card p { margin: 12px 0 0; font-size: 21px; line-height: 1.3; }
    .meta { margin-top: 38px; display: grid; grid-template-columns: 1fr 12px 1fr; gap: 26px; align-items: start; font-size: 22px; line-height: 1.45; }
    .meta strong { display: block; font-weight: 700; }
    .meta-line { width: 4px; height: 54px; border-radius: 99px; background: #2f78f4; }
    .address-grid { margin-top: 78px; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 86px; }
    .address-title { border-radius: 0 6px 6px 0; background: #2f73e8; padding: 13px 28px; color: #fff; font-size: 22px; font-weight: 700; }
    .address-card:last-child .address-title { border-radius: 6px 0 0 6px; text-align: right; }
    .address-body { padding: 34px 0 0; font-size: 21px; font-weight: 500; line-height: 1.45; }
    .address-body strong { display: block; margin-bottom: 18px; font-size: 22px; font-weight: 800; }
    .address-card:last-child .address-body { text-align: right; }
    .table-wrap { margin-top: 58px; }
    table { width: 100%; border-collapse: collapse; font-size: 20px; }
    thead { border-bottom: 2px solid #2f73e8; border-top: 2px solid #2f73e8; color: #2f73e8; }
    th { padding: 20px 18px; text-align: left; font-size: 20px; font-weight: 800; }
    th:nth-child(2), th:nth-child(3), td:nth-child(2), td:nth-child(3) { text-align: center; }
    th:last-child, td:last-child { text-align: right; }
    td { padding: 20px 18px; font-size: 20px; font-weight: 600; vertical-align: top; }
    .divider { margin-top: 22px; height: 3px; border-radius: 99px; background: #2f73e8; }
    .bottom { margin-top: 34px; display: grid; grid-template-columns: minmax(240px, .8fr) minmax(360px, 1fr); gap: 60px; align-items: start; }
    .payment-method { margin-top: 78px; font-size: 20px; line-height: 1.5; }
    .payment-method em { display: block; margin-bottom: 24px; font-size: 20px; font-weight: 700; }
    .payment-method strong { font-size: 22px; }
    .thanks { margin-top: 88px; color: #2f73e8; font-size: 22px; font-weight: 800; }
    .totals { font-size: 20px; font-weight: 700; }
    .total-row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 32px; padding: 10px 0; }
    .total-row span:last-child { text-align: right; }
    .total-rule { margin: 16px 0 12px; height: 3px; border-radius: 99px; background: #2f73e8; }
    .grand { font-size: 28px; font-weight: 900; }
    .payment-under-total { margin-top: 12px; text-align: right; color: #111827; font-size: 18px; font-weight: 700; }
    .footer { position: absolute; inset-inline: 0; bottom: 0; display: flex; align-items: center; justify-content: center; gap: 70px; background: #2f73e8; padding: 34px 40px; color: #fff; font-size: 22px; font-weight: 700; }
    .footer-item { display: inline-flex; align-items: center; gap: 14px; line-height: 1; }
    .footer-icon { display: inline-grid; width: 42px; height: 42px; place-items: center; flex: 0 0 42px; border: 1px solid rgba(255,255,255,.9); border-radius: 999px; font-size: 20px; line-height: 1; }
    @media print { body { background: #fff; padding: 0; } .invoice { box-shadow: none; max-width: none; min-height: 100vh; } }
    @media (max-width: 760px) { body { padding: 12px; } .content { padding: 34px 24px 170px; } .top, .address-grid, .bottom { grid-template-columns: 1fr; gap: 28px; } .invoice-card { margin-left: 0; } .address-card:last-child .address-title, .address-card:last-child .address-body { text-align: left; } .footer { flex-direction: column; gap: 14px; align-items: center; font-size: 16px; } table { font-size: 15px; } th, td { padding: 14px 8px; font-size: 15px; } }
  </style>
</head>
<body>
  <main class="invoice">
    <div class="watermark" aria-hidden="true">Medha<br />Botanics</div>
    <div class="content">
      <section class="top">
        <div>
          <img class="brand-logo" src="${escapeHtml(logoSrc)}" alt="Medha Botanics logo" />
          <p class="company-address">${escapeHtml(SERVICE_DESK_ADDRESS)}</p>
          <p class="gstin">GSTIN - ${escapeHtml(GSTIN)}</p>
        </div>
        <div>
          <div class="invoice-card">
            <h1>Tax Invoice</h1>
            <p>${escapeHtml(orderId)}</p>
          </div>
          <div class="meta">
            <div><strong>Invoice Date</strong>${escapeHtml(formatInvoiceDate(order.createdAt))}</div>
            <div class="meta-line"></div>
            <div><strong>Status</strong>${escapeHtml(formatStatus(order.orderStatus))}</div>
          </div>
        </div>
      </section>

      <section class="address-grid">
        <div class="address-card">
          <div class="address-title">Billed to</div>
          <div class="address-body">
            <strong>${escapeHtml(customerName)}</strong>
            <p>${escapeHtml(getAddressLine(billingAddress))}</p>
            <p>Mob - ${escapeHtml(billingAddress?.mobileNumber || shippingAddress?.mobileNumber || order.user?.phoneNumber || "-")}</p>
          </div>
        </div>
        <div class="address-card">
          <div class="address-title">Shipped to</div>
          <div class="address-body">
            <strong>${escapeHtml(shippingAddress?.fullName || customerName)}</strong>
            <p>${escapeHtml(getAddressLine(shippingAddress))}</p>
            <p>Mob - ${escapeHtml(shippingAddress?.mobileNumber || order.user?.phoneNumber || "-")}</p>
          </div>
        </div>
      </section>

      <section class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Pack</th>
              <th>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${
              items
                .map(
                  (item, index) => `<tr>
                    <td>${escapeHtml(getItemName(item, index))}</td>
                    <td>${escapeHtml(item.selectedQuantity ? `${item.selectedQuantity} Capsules` : "-")}</td>
                    <td>${escapeHtml(item.quantity || 0)}</td>
                    <td>${escapeHtml(formatAmount(item.finalPrice))}</td>
                  </tr>`,
                )
                .join("") || '<tr><td colspan="4">No order items available.</td></tr>'
            }
          </tbody>
        </table>
        <div class="divider"></div>
      </section>

      <section class="bottom">
        <div>
          <div class="payment-method">
            <em>Payment Method:</em>
            <strong>&#128666;&nbsp; ${escapeHtml(getPaymentLabel(paymentMethod))}</strong>
          </div>
          <p class="thanks">Thank you for your business</p>
        </div>
        <div class="totals">
          <div class="total-row"><span>Sub Total</span><span>${escapeHtml(formatAmount(order.subtotal))}</span></div>
          <div class="total-row"><span>Product discount</span><span>- ${escapeHtml(formatCurrency(order.productDiscountTotal))}</span></div>
          <div class="total-row"><span>Promo discount</span><span>- ${escapeHtml(formatCurrency(order.promoDiscountAmount))}</span></div>
          <div class="total-row"><span>GST</span><span>${escapeHtml(formatCurrency(order.gst))}</span></div>
          <div class="total-row"><span>Shipping</span><span>${escapeHtml(formatCurrency(order.shippingCharges))}</span></div>
          <div class="total-rule"></div>
          <div class="total-row grand"><span>Total</span><span>${escapeHtml(formatCurrency(order.totalAmount))}</span></div>
          <p class="payment-under-total">Payment: ${escapeHtml(paymentMethod)} (${escapeHtml(paymentStatus)})</p>
        </div>
      </section>
    </div>

    <footer class="footer">
      <span class="footer-item"><span class="footer-icon">&#9993;</span> Info@medha.care</span>
      <span class="footer-item"><span class="footer-icon">&#9678;</span> www.medha.care</span>
    </footer>
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
        <img class="logo" src="${escapeHtml(medhaLogoUrl)}" alt="Medha Botanics logo" />
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

export const downloadOrderInvoice = async (order) => {
  const orderId = safeFileName(order.orderId || order._id || "order");
  const logoSrc = await getImageDataUri(medhaLogoUrl);
  const blob = new Blob([getInvoiceHtml(order, logoSrc)], { type: "text/html;charset=utf-8" });
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
