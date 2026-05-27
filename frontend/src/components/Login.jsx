import { useState } from "react";
import {
  signIn as authSignIn,
  signUp as authSignUp,
  confirmSignUp as authConfirmSignUp,
} from "@aws-amplify/auth";

export default function Login({ onSignIn }) {
  const [mode, setMode] = useState("signIn"); // 'signIn' | 'signUp' | 'confirm'
  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    code: "",
  });
  const [status, setStatus] = useState({ message: "", type: "info" });

  const setLoginStatus = (message, type = "info") =>
    setStatus({ message, type });
  const clearLoginStatus = () => setStatus({ message: "", type: "info" });

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoginStatus("Signing in...", "info");
    if (!form.username && !form.email) {
      setLoginStatus('Please enter a username', 'error');
      return;
    }
    if (!form.password) {
      setLoginStatus('Please enter your password', 'error');
      return;
    }
    try {
      const username = form.username || form.email;
      console.log("Attempting sign in with", { username });
      const user = await authSignIn({ username, password: form.password });
      setLoginStatus("Signed in", "success");
      onSignIn(user);
    } catch (err) {
      console.error("SignIn error", err);
      setLoginStatus(err.message || "Sign in failed", 'error');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoginStatus("Signing up...", "info");
    if (!form.email) {
      setLoginStatus('Please enter your email', 'error');
      return;
    }
    if (!form.username) {
      setLoginStatus('Please enter a username', 'error');
      return;
    }
    if (!form.password) {
      setLoginStatus('Please enter a password', 'error');
      return;
    }
    try {
      await authSignUp({
        username: form.username,
        password: form.password,
        options: {
          userAttributes: {
            email: form.email,
          },
        },
      });
      setLoginStatus("Sign up successful. Enter confirmation code.", "success");
      setMode("confirm");
    } catch (err) {
      console.error("SignUp error", err);
      setLoginStatus(err.message || "Sign up failed", 'error');
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoginStatus("Confirming...", "info");
    try {
      const username = form.username || form.email;
      await authConfirmSignUp({ username, confirmationCode: form.code });
      setLoginStatus("Confirmed. Please sign in.", "success");
      setMode("signIn");
    } catch (err) {
      console.error("Confirm error", err);
      setLoginStatus(err.message || "Confirmation failed", 'error');
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card auth-grid">
        <div className="auth-left">
          <div className="brand">
            <h1>User Profile</h1>
            <p className="lead">
              Securely manage your personal profile and settings.
            </p>
          </div>
          <div className="illustration" aria-hidden="true" />
        </div>

        <div className="auth-right">
          <h2 className="form-title">
            {mode === "signIn"
              ? "Welcome back"
              : mode === "signUp"
                ? "Create account"
                : "Confirm account"}
          </h2>
          <p className="form-sub">
            {mode === "signIn"
              ? "Sign in to continue"
              : mode === "signUp"
                ? "Enter your details to create an account"
                : "Enter the confirmation code sent to your email"}
          </p>

          {mode === "signIn" && (
            <form onSubmit={handleSignIn} className="auth-form">
              <label className="form-label">
                <span>Username</span>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="username"
                  className="form-input"
                />
              </label>

              <label className="form-label">
                <span>Password</span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-input"
                />
              </label>

              <button type="submit" className="primary">
                Sign In
              </button>

              <div className="links">
                <button
                  type="button"
                  className="link"
                  onClick={() => {
                    clearLoginStatus();
                    setMode("signUp");
                  }}
                >
                  Create account
                </button>
              </div>
            </form>
          )}

          {mode === "signUp" && (
            <form onSubmit={handleSignUp} className="auth-form">
              <label className="form-label">
                <span>Email</span>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </label>

              <label className="form-label">
                <span>Username</span>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="form-input"
                />
              </label>

              <label className="form-label">
                <span>Password</span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  className="form-input"
                />
              </label>

              <button type="submit" className="primary">
                Sign Up
              </button>

              <div className="links">
                <button
                  type="button"
                  className="link"
                  onClick={() => {
                    clearLoginStatus();
                    setMode("signIn");
                  }}
                >
                  Back to sign in
                </button>
              </div>
            </form>
          )}

          {mode === "confirm" && (
            <form onSubmit={handleConfirm} className="auth-form">
              <label className="form-label">
                <span>Confirmation Code</span>
                <input
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  className="form-input"
                />
              </label>
              <button type="submit" className="primary">
                Confirm
              </button>
            </form>
          )}

          {status.message && (
            <div className={`status ${status.type ? `status-${status.type}` : ""}`}>
              {status.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
