export const ADMIN_DEFAULT_ROUTE = "/products";

export const ADMIN_ROUTES = [
  {
    id: "products",
    path: "/products",
    label: "Products",
    eyebrow: "Catalog",
    description: "Add products and manage the visible inventory.",
    headerTitle: "Products workspace",
    headerSubtitle:
      "Open the add-product modal, upload images, and review the live catalog below.",
    statKey: "products",
  },
  {
    id: "categories",
    path: "/categories",
    label: "Categories",
    eyebrow: "Structure",
    description: "Maintain product categories used across the catalog.",
    headerTitle: "Product categories workspace",
    headerSubtitle:
      "Add, rename, or remove categories used by the backend product routes.",
    statKey: "categories",
  },
  {
    id: "offers",
    path: "/offers",
    label: "Offers",
    eyebrow: "Checkout",
    description: "Manage promo codes and percentage discounts for orders.",
    headerTitle: "Offers workspace",
    headerSubtitle:
      "Create promo codes, adjust discount percentages, and keep checkout incentives current.",
    statKey: "offers",
  },
  {
    id: "addresses",
    path: "/addresses",
    label: "Addresses",
    eyebrow: "Delivery",
    description: "Manage delivery addresses used across orders.",
    headerTitle: "Addresses workspace",
    headerSubtitle:
      "Review delivery addresses, update contact details, and keep shipping destinations organized.",
    statKey: "addresses",
  },
  {
    id: "orders",
    path: "/orders",
    label: "Orders",
    eyebrow: "Fulfillment",
    description: "Review orders and update their fulfillment status.",
    headerTitle: "Orders workspace",
    headerSubtitle:
      "Review incoming orders, inspect totals, and push each order through the fulfillment pipeline.",
    statKey: "orders",
  },
  {
    id: "orderStatus",
    path: "/orders/status",
    label: "Track order",
    eyebrow: "Support",
    description: "Fetch the latest status timeline for a specific order ID.",
    headerTitle: "Order status workspace",
    headerSubtitle:
      "Look up a single order by order ID and review the latest status history without opening the full orders workspace.",
    statKey: "orders",
  },
];

export function getAdminRoute(pathname) {
  return ADMIN_ROUTES.find((route) => route.path === pathname) || null;
}
