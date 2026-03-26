import { useState } from "react";

export function LoginScreen({
  credentials,
  isSubmitting,
  onChange,
  onResetForgotPassword,
  onSendForgotPasswordOtp,
  onSubmit,
  onVerifyForgotPasswordOtp,
}) {
  const [mode, setMode] = useState("login");
  const [forgotPasswordState, setForgotPasswordState] = useState({
    email: "",
    otp: "",
    newPassword: "",
    passwordResetOtpToken: "",
    passwordResetToken: "",
  });

  const updateForgotPasswordField = (field, value) => {
    setForgotPasswordState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSendForgotPasswordOtp = async (event) => {
    event.preventDefault();
    const response = await onSendForgotPasswordOtp({
      email: forgotPasswordState.email,
    });

    setForgotPasswordState((current) => ({
      ...current,
      passwordResetOtpToken: response.passwordResetOtpToken || "",
      passwordResetToken: "",
      otp: "",
      newPassword: "",
    }));
  };

  const handleVerifyForgotPasswordOtp = async (event) => {
    event.preventDefault();
    const response = await onVerifyForgotPasswordOtp({
      email: forgotPasswordState.email,
      otp: forgotPasswordState.otp,
      passwordResetOtpToken: forgotPasswordState.passwordResetOtpToken,
    });

    setForgotPasswordState((current) => ({
      ...current,
      passwordResetToken: response.passwordResetToken || "",
    }));
  };

  const handleResetForgotPassword = async (event) => {
    event.preventDefault();
    await onResetForgotPassword({
      email: forgotPasswordState.email,
      newPassword: forgotPasswordState.newPassword,
      passwordResetToken: forgotPasswordState.passwordResetToken,
    });

    setForgotPasswordState({
      email: "",
      otp: "",
      newPassword: "",
      passwordResetOtpToken: "",
      passwordResetToken: "",
    });
    setMode("login");
  };

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

        <div className="login-form-card">
          <div className="login-form-header">
            <h2>{mode === "login" ? "Sign in" : "Forgot password"}</h2>
            <p>
              {mode === "login"
                ? "Use the same credentials you created through the backend admin user API."
                : "Reset the password with the email OTP flow configured in the backend."}
            </p>
          </div>

          <div className="auth-mode-switch">
            <button
              type="button"
              className={mode === "login" ? "primary-button" : "ghost-button"}
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === "forgot" ? "primary-button" : "ghost-button"}
              onClick={() => setMode("forgot")}
            >
              Forgot password
            </button>
          </div>

          {mode === "login" ? (
            <form onSubmit={onSubmit}>
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
          ) : (
            <div className="forgot-password-flow">
              <form onSubmit={handleSendForgotPasswordOtp}>
                <label className="field-shell">
                  <span>Email</span>
                  <input
                    autoComplete="email"
                    type="email"
                    placeholder="admin@example.com"
                    required
                    value={forgotPasswordState.email}
                    onChange={(event) =>
                      updateForgotPasswordField("email", event.target.value)
                    }
                  />
                </label>
                <button className="ghost-button login-submit" disabled={isSubmitting} type="submit">
                  {isSubmitting ? "Sending..." : "Send OTP"}
                </button>
              </form>

              {forgotPasswordState.passwordResetOtpToken ? (
                <form onSubmit={handleVerifyForgotPasswordOtp}>
                  <label className="field-shell">
                    <span>OTP</span>
                    <input
                      type="text"
                      required
                      value={forgotPasswordState.otp}
                      onChange={(event) =>
                        updateForgotPasswordField("otp", event.target.value)
                      }
                    />
                  </label>
                  <button className="ghost-button login-submit" disabled={isSubmitting} type="submit">
                    {isSubmitting ? "Verifying..." : "Verify OTP"}
                  </button>
                </form>
              ) : null}

              {forgotPasswordState.passwordResetToken ? (
                <form onSubmit={handleResetForgotPassword}>
                  <label className="field-shell">
                    <span>New password</span>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={forgotPasswordState.newPassword}
                      onChange={(event) =>
                        updateForgotPasswordField("newPassword", event.target.value)
                      }
                    />
                  </label>
                  <button className="primary-button login-submit" disabled={isSubmitting} type="submit">
                    {isSubmitting ? "Resetting..." : "Reset password"}
                  </button>
                </form>
              ) : null}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
