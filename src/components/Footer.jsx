export function Footer({ apiBaseUrl }) {
  return (
    <footer className="dashboard-footer">
      <p>
        Admin panel connected to <code>{apiBaseUrl}</code>
      </p>
      <p>Products and categories are managed through the backend REST routes.</p>
    </footer>
  );
}
