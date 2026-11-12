import { useState } from "react";
import {
  Eye,
  EyeOff,
  CarFront,
  ShieldCheck,
} from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const isValidLogin =
      email.trim().toLowerCase() === "admin@driveflow.com" &&
      password === "admin123";

    if (isValidLogin) {
      window.location.href = "/dashboard";
      return;
    }

    setLoading(false);
    setErrors({
      general: "Invalid email or password. Please try again.",
    });
  };

  const inputStyle = {
    display: "block",
    visibility: "visible",
    width: "100%",
    height: "46px",
    boxSizing: "border-box",
    border: "1px solid #dbe2ea",
    borderRadius: "9px",
    backgroundColor: "#ffffff",
    color: "#1e293b",
    padding: "0 14px",
    fontFamily: "Montserrat, sans-serif",
    fontSize: "13px",
    outline: "none",
    opacity: 1,
  };

  const labelStyle = {
    display: "block",
    visibility: "visible",
    marginBottom: "9px",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 600,
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f1f4f9] px-4 py-8 font-['Montserrat']">

      {/* MAIN CENTERED CARD */}
      <div className="grid min-h-[620px] w-full max-w-[1100px] grid-cols-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_25px_70px_rgba(15,23,42,0.12)] md:grid-cols-2">

        {/* LEFT BRANDING PANEL */}
        <section className="flex flex-col justify-between bg-[#101827] px-8 py-9 text-white sm:px-11 sm:py-11 lg:px-14">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
              <CarFront size={24} />
            </div>

            <h2 className="text-[23px] font-bold tracking-tight">
              DriveFlow
            </h2>
          </div>

          {/* Branding Content */}
          <div className="my-10 md:my-0">

            <span className="text-[10px] font-bold tracking-[0.2em] text-blue-400">
              VEHICLE RENTAL MANAGEMENT
            </span>

            <h1 className="mt-5 text-[29px] font-bold leading-[1.4] tracking-tight lg:text-[32px]">
              Manage your fleet.
              <br />
              Drive your business
              <br />
              forward.
            </h1>

            <p className="mt-5 max-w-[390px] text-[12px] leading-6 text-slate-300">
              A smarter way to manage vehicles, bookings, customers and your entire rental operation.
            </p>

            <div className="mt-7 flex items-center gap-3 text-[11px] text-slate-300">
              <ShieldCheck
                size={19}
                className="shrink-0 text-blue-400"
              />

              <span>
                Secure and centralized fleet management
              </span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-[10px] text-slate-500">
            © 2026 DriveFlow. All rights reserved.
          </p>
        </section>

        {/* RIGHT LOGIN PANEL */}
        <section className="flex items-center justify-center bg-white px-7 py-10 sm:px-12 lg:px-16">

          <div className="w-full max-w-[390px]">

            {/* Login Heading */}
            <div className="mb-8">

              <span className="text-[10px] font-bold tracking-[0.2em] text-blue-600">
                WELCOME BACK
              </span>

              <h2 className="mt-3 text-[23px] font-bold tracking-tight text-[#17243b]">
                Sign in to your account
              </h2>

              <p className="mt-2 text-[12px] leading-6 text-slate-500">
                Enter your credentials to access DriveFlow.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-6"
            >

              {/* EMAIL FIELD */}
              <div>
<label
htmlFor="email"
style={labelStyle}
>
Email Address
<span className="ml-1 text-red-500"></span>
</label>

<input
id="email"
name="email"
type="email"
value={email}
onChange={(e) => {
setEmail(e.target.value);
setErrors((prev) => ({
...prev,
email: "",
general: "",
}));
}}
placeholder="name@company.com"
autoComplete="username"
style={inputStyle}
aria-invalid={Boolean(errors.email)}
onFocus={(e) => {
e.currentTarget.style.borderColor = "#2563eb";
}}
onBlur={(e) => {
e.currentTarget.style.borderColor =
errors.email ? "#ef4444" : "#dbe2ea";
}}
/>

{errors.email && (
<p className="mt-2 text-[11px] text-red-600">
{errors.email}
</p>
)}
</div>

{/* PASSWORD FIELD */}
<div>
<label
htmlFor="password"
style={labelStyle}
>
Password
<span className="ml-1 text-red-500"></span>
</label>

<div className="relative">
<input
id="password"
name="password"
type={showPassword ? "text" : "password"}
value={password}
onChange={(e) => {
setPassword(e.target.value);
setErrors((prev) => ({
...prev,
password: "",
general: "",
}));
}}
placeholder="Enter your password"
autoComplete="current-password"
style={{
...inputStyle,
paddingRight: "46px",
}}
aria-invalid={Boolean(errors.password)}
onFocus={(e) => {
e.currentTarget.style.borderColor = "#2563eb";
}}
onBlur={(e) => {
e.currentTarget.style.borderColor =
errors.password ? "#ef4444" : "#dbe2ea";
}}
/>

<button
type="button"
onClick={() => setShowPassword((prev) => !prev)}
aria-label={showPassword ? "Hide password" : "Show password"}
className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
>
{showPassword ? (
<EyeOff size={18} />
) : (
<Eye size={18} />
)}
</button>
</div>

{errors.password && (
<p className="mt-2 text-[11px] text-red-600">
{errors.password}
</p>
)}
</div>

{/* REMEMBER ME AND FORGOT PASSWORD */}
              <div className="flex items-center justify-between gap-3">

                <label className="flex cursor-pointer items-center gap-2 text-[11px] text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 accent-blue-600"
                  />

                  Remember me
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setErrors((prev) => ({
                      ...prev,
                      general: "Forgot password will be available later.",
                    }))
                  }
                  className="text-[11px] font-semibold text-blue-600 transition hover:text-blue-800"
                >
                  Forgot password?
                </button>
              </div>

              {/* ERROR MESSAGE */}
              {errors.general && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-[11px] text-red-600"
                >
                  {errors.general}
                </p>
              )}

              {/* SIGN IN BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-600 text-[13px] font-semibold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>

            </form>

            {/* SECURITY FOOTER */}
            <div className="mt-8 flex items-center justify-center gap-2 border-t border-slate-100 pt-6 text-center text-[10px] text-slate-400">
              <ShieldCheck size={15} className="shrink-0" />

              <span>
                Your account is protected with secure authentication.
              </span>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;