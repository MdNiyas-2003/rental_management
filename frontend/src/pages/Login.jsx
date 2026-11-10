import { useState } from "react";
import { Eye, EyeOff, CarFront, ShieldCheck } from "lucide-react";

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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    // Temporary UI testing only. Real authentication will be connected to the Express API later.
    setTimeout(() => {
      setLoading(false);
      alert(
        `Login form validated successfully!\nEmail: ${email}\nRemember me: ${rememberMe}`
      );
    }, 1000);
  };

  const inputClass =
    "h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="grid min-h-screen grid-cols-1 bg-white font-sans md:grid-cols-2">
      {/* Left branding section */}
      <section className="hidden flex-col justify-between bg-[#101d35] px-10 py-10 text-white lg:flex xl:px-14">
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-blue-600 p-2.5">
            <CarFront size={28} />
          </div>
          <h2 className="text-2xl font-bold tracking-wide">DriveFlow</h2>
        </div>

        <div className="max-w-xl">
          <span className="text-xs font-bold tracking-[0.2em] text-blue-300">
            VEHICLE RENTAL MANAGEMENT
          </span>

          <h1 className="my-6 text-4xl font-bold leading-tight xl:text-5xl">
            Manage your fleet.
            <br />
            Drive your business
            <br />
            forward.
          </h1>

          <p className="max-w-md text-[15px] leading-8 text-slate-300">
            A smarter way to manage vehicles, bookings, customers and your entire rental operation.
          </p>

          <div className="mt-9 flex items-center gap-3 text-sm text-slate-200">
            <ShieldCheck size={20} className="shrink-0" />
            <span>Secure and centralized fleet management</span>
          </div>
        </div>

        <p className="text-xs text-slate-400">
          © 2026 DriveFlow. All rights reserved.
        </p>
      </section>

      {/* Right login section */}
      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-12">
        <div className="w-full max-w-[420px]">
          {/* Mobile branding */}
          <div className="mb-12 flex items-center gap-2.5 text-[#17243b] lg:hidden">
            <CarFront size={29} className="text-blue-600" />
            <h2 className="text-2xl font-bold">DriveFlow</h2>
          </div>

          <div className="mb-8">
            <span className="text-xs font-bold tracking-[0.15em] text-blue-600">
              WELCOME BACK
            </span>
            <h1 className="mt-3 text-2xl font-bold text-[#17243b] sm:text-[28px]">
              Sign in to your account
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Enter your credentials to access DriveFlow.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-[13px] font-semibold text-slate-700">
                Email Address <span className="ml-1 text-red-600">*</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="name@company.com"
                autoComplete="email"
                className={`${inputClass} ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1.5 text-xs text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-2 block text-[13px] font-semibold text-slate-700">
                Password <span className="ml-1 text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`${inputClass} pr-12 ${errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-100" : ""}`}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="mt-1.5 text-xs text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Options */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-[13px] text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert("Forgot password screen coming soon")}
                className="text-[13px] font-semibold text-blue-600 transition hover:text-blue-800"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
            <ShieldCheck size={17} className="shrink-0" />
            <span>Your account is protected with secure authentication.</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Login;
