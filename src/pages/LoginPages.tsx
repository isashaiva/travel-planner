import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, loginWithGoogle } from "../features/auth/authService";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = "Email обов'язковий";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Невірний формат email";
    if (!password) newErrors.password = "Пароль обов'язковий";
    else if (password.length < 6) newErrors.password = "Мінімум 6 символів";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (e: any) {
      const code = e?.code;
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setErrors({ general: "Невірний email або пароль" });
      } else {
        setErrors({ general: "Помилка входу. Спробуйте ще раз." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
      navigate("/");
    } catch (e) {
      setErrors({ general: "Помилка входу через Google" });
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100 flex items-center justify-center px-4">
      {/* BACKGROUND BUBBLES */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="absolute top-[20%] right-[-100px] w-[400px] h-[400px] rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute bottom-[-120px] left-[20%] w-[350px] h-[350px] rounded-full bg-white/60 blur-3xl" />
        <div className="absolute bottom-[10%] right-[10%] w-[220px] h-[220px] rounded-full bg-cyan-200/50 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* LOGO */}
        <div className="text-center mb-8">
          <Link to="/">
            <h1 className="text-4xl font-black bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
              TravelUA
            </h1>
          </Link>
          <p className="text-slate-500 mt-2">Раді бачити тебе знову ✈️</p>
        </div>

        {/* CARD */}
        <div className="backdrop-blur-3xl bg-white/40 border border-white/50 rounded-[32px] p-8 shadow-[0_8px_32px_rgba(31,38,135,0.18)]">
          <h2 className="text-2xl font-black text-slate-800 mb-6">Вхід</h2>

          {/* GOOGLE */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl py-4 font-bold text-slate-700 transition hover:shadow-md mb-6 disabled:opacity-60"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            Продовжити з Google
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-400 text-sm">або</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* GENERAL ERROR */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4 text-red-600 text-sm font-medium">
              {errors.general}
            </div>
          )}

          {/* EMAIL */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-slate-600 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              placeholder="you@example.com"
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((p) => ({ ...p, email: undefined }));
              }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className={`w-full bg-white/60 backdrop-blur border rounded-2xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-sky-300
                ${errors.email ? "border-red-300 focus:ring-red-200" : "border-white/60 focus:border-sky-300"}`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-600 mb-2">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((p) => ({ ...p, password: undefined }));
              }}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className={`w-full bg-white/60 backdrop-blur border rounded-2xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-sky-300
                ${errors.password ? "border-red-300 focus:ring-red-200" : "border-white/60 focus:border-sky-300"}`}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>

          {/* FORGOT PASSWORD */}
          <ForgotPassword />

          {/* SUBMIT */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white rounded-2xl py-4 font-black text-lg transition hover:shadow-lg disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              "Увійти"
            )}
          </button>

          <p className="text-center text-slate-500 text-sm mt-6">
            Немає акаунту?{" "}
            <Link
              to="/register"
              className="text-sky-500 font-bold hover:underline"
            >
              Зареєструватись
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function ForgotPassword() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) return setError("Введіть email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Невірний формат email");
    setLoading(true);
    try {
      await import("../features/auth/authService").then(({ resetPassword }) =>
        resetPassword(email),
      );
      setSent(true);
      setError("");
    } catch (e: any) {
      if (e?.code === "auth/user-not-found")
        setError("Акаунт з таким email не знайдено");
      else setError("Помилка. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-right mb-6">
        <button
          onClick={() => {
            setOpen(true);
            setSent(false);
            setError("");
            setEmail("");
          }}
          className="text-sky-500 text-sm font-bold hover:underline"
        >
          Забули пароль?
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-[28px] p-8 w-full max-w-sm shadow-2xl">
            {sent ? (
              <div className="text-center">
                <div className="text-5xl mb-4">📬</div>
                <h3 className="text-xl font-black text-slate-800 mb-2">
                  Лист надіслано!
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                  Перевір пошту{" "}
                  <span className="font-bold text-slate-700">{email}</span> і
                  перейди по посиланню для скидання пароля.
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-2xl py-3 font-black transition"
                >
                  Закрити
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-black text-slate-800 mb-2">
                  Скинути пароль
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                  Введи свій email і ми надішлемо посилання для скидання пароля.
                </p>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4 text-red-600 text-sm">
                    {error}
                  </div>
                )}
                <input
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleReset()}
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-300 mb-4"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl py-3 font-bold transition"
                  >
                    Скасувати
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-2xl py-3 font-black transition disabled:opacity-60 flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Надіслати"
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
