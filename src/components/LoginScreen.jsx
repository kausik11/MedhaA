export function LoginScreen({
  credentials,
  isSubmitting,
  onChange,
  onSubmit,
}) {
  return (
    <div className="login-shell">
      <section className="login-panel">
        <div className="login-copy">
          <p className="eyebrow">Medha Botanics</p>
          <h1>Admin panel access</h1>
          <p>
            Sign in with an <strong>administrator</strong> or <strong>superadmin</strong>
            {" "}account. Normal users are blocked by the backend.
          </p>
        </div>

        <form className="login-form-card" onSubmit={onSubmit}>
          <div className="login-form-header">
            <h2>Sign in</h2>
            <p>Use the same credentials you created through the backend admin user API.</p>
          </div>

          <label className="field-shell">
            <span>Email</span>
            <input
              autoComplete="email"
              name="email"
              onChange={onChange}
              placeholder="admin@example.com"
              required
              type="email"
              value={credentials.email}
            />
          </label>

          <label className="field-shell">
            <span>Password</span>
            <input
              autoComplete="current-password"
              name="password"
              onChange={onChange}
              placeholder="Enter your password"
              required
              type="password"
              value={credentials.password}
            />
          </label>

          <button className="primary-button login-submit" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Signing in..." : "Enter admin panel"}
          </button>
        </form>
      </section>
    </div>
  );
}
