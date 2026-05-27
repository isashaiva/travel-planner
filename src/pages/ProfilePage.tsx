import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";
import { useAuth } from "../app/AuthContext";
import {
  updateDisplayName,
  changePassword,
  deleteAccount,
  logout,
} from "../features/auth/authService";
import { getRoutes } from "../features/dashboard/dashboardService";

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [routes, setRoutes] = useState<any[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  // Edit name
  const [displayName, setDisplayName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameSuccess, setNameSuccess] = useState(false);
  const [nameError, setNameError] = useState("");

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Delete account
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const isEmailProvider = user?.providerData.some(
    (p) => p.providerId === "password",
  );
  const isGoogleProvider = user?.providerData.some(
    (p) => p.providerId === "google.com",
  );

  useEffect(() => {
    if (user) setDisplayName(user.displayName || "");
  }, [user]);

  useEffect(() => {
    getRoutes().then((data) => {
      setRoutes(data);
      setLoadingRoutes(false);
    });
  }, []);

  // Stats
  const visitedCount = (() => {
    const visited = new Set(
      JSON.parse(localStorage.getItem("visitedPlaces") || "[]"),
    );
    return visited.size;
  })();

  const favoriteType = (() => {
    if (!routes.length) return "—";
    const counts: Record<string, number> = {};
    routes.forEach((r) => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
  })();

  const totalBudget = routes.reduce(
    (sum, r) => sum + (r.budget?.total || 0),
    0,
  );

  const handleUpdateName = async () => {
    if (!displayName.trim()) return setNameError("Ім'я не може бути порожнім");
    setNameLoading(true);
    setNameError("");
    try {
      await updateDisplayName(displayName.trim());
      setNameSuccess(true);
      setTimeout(() => setNameSuccess(false), 3000);
    } catch {
      setNameError("Помилка оновлення імені");
    } finally {
      setNameLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    if (!currentPassword) return setPasswordError("Введіть поточний пароль");
    if (!newPassword) return setPasswordError("Введіть новий пароль");
    if (newPassword.length < 6) return setPasswordError("Мінімум 6 символів");
    if (newPassword !== confirmPassword)
      return setPasswordError("Паролі не співпадають");
    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (e: any) {
      if (
        e?.code === "auth/wrong-password" ||
        e?.code === "auth/invalid-credential"
      ) {
        setPasswordError("Невірний поточний пароль");
      } else {
        setPasswordError("Помилка зміни пароля");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    setDeleteLoading(true);
    try {
      await deleteAccount(isEmailProvider ? deletePassword : undefined);
      await logout();
      navigate("/");
    } catch (e: any) {
      if (
        e?.code === "auth/wrong-password" ||
        e?.code === "auth/invalid-credential"
      ) {
        setDeleteError("Невірний пароль");
      } else {
        setDeleteError("Помилка видалення акаунту");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) return null;

  const avatar = user.photoURL;
  const initials = (user.displayName || user.email || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100">
      {/* BUBBLES */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="absolute top-[20%] right-[-100px] w-[400px] h-[400px] rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute bottom-[-120px] left-[20%] w-[350px] h-[350px] rounded-full bg-white/60 blur-3xl" />
        <div className="absolute bottom-[10%] right-[10%] w-[220px] h-[220px] rounded-full bg-cyan-200/50 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
          {/* PROFILE HEADER */}
          <div className="backdrop-blur-3xl bg-white/40 border border-white/50 rounded-[32px] p-8 shadow-xl flex items-center gap-6">
            <div className="w-24 h-24 rounded-[24px] overflow-hidden shrink-0 shadow-lg">
              {avatar ? (
                <img src={avatar} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-4xl font-black">
                  {initials}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800">
                {user.displayName || "Без імені"}
              </h1>
              <p className="text-slate-500 mt-1">{user.email}</p>
              <div className="flex gap-2 mt-3">
                {isGoogleProvider && (
                  <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl text-xs font-bold text-slate-600 flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24">
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
                    Google
                  </span>
                )}
                {isEmailProvider && (
                  <span className="bg-white border border-slate-200 px-3 py-1 rounded-xl text-xs font-bold text-slate-600">
                    ✉️ Email
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Маршрутів",
                value: loadingRoutes ? "..." : routes.length,
                color: "text-sky-500",
              },
              {
                label: "Відвідано",
                value: visitedCount,
                color: "text-green-500",
              },
              {
                label: "Тип маршруту",
                value: favoriteType,
                color: "text-blue-500",
              },
              {
                label: "Загальний бюджет",
                value: `${totalBudget} ₴`,
                color: "text-slate-800",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="backdrop-blur-3xl bg-white/40 border border-white/50 rounded-[24px] p-5 shadow-lg"
              >
                <div className="text-slate-400 text-sm mb-2">{stat.label}</div>
                <div className={`text-2xl font-black ${stat.color} capitalize`}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* RECENT ROUTES */}
          <div className="backdrop-blur-3xl bg-white/40 border border-white/50 rounded-[32px] p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-800">
                Останні маршрути
              </h2>
              <button
                onClick={() => navigate("/dashboard")}
                className="text-sky-500 font-bold text-sm hover:underline"
              >
                Всі маршрути →
              </button>
            </div>
            {loadingRoutes ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-white/50 rounded-2xl" />
                ))}
              </div>
            ) : routes.length === 0 ? (
              <p className="text-slate-400">Маршрутів ще немає</p>
            ) : (
              <div className="space-y-3">
                {routes.slice(0, 5).map((route) => (
                  <div
                    key={route.id}
                    onClick={() => navigate("/dashboard")}
                    className="bg-white/60 hover:bg-white/80 border border-white/60 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={
                          route.places?.[0]?.photo ||
                          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=200"
                        }
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=200";
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-black text-slate-800 truncate">
                        {route.title}
                      </div>
                      <div className="text-slate-500 text-sm">
                        {route.places?.length || 0} локацій ·{" "}
                        {route.budget?.total || 0} ₴
                      </div>
                    </div>
                    <div className="bg-sky-100 text-sky-600 px-3 py-1 rounded-xl text-xs font-bold capitalize shrink-0">
                      {route.type}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EDIT NAME */}
          <div className="backdrop-blur-3xl bg-white/40 border border-white/50 rounded-[32px] p-8 shadow-xl">
            <h2 className="text-2xl font-black text-slate-800 mb-6">
              Редагувати профіль
            </h2>
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-600 mb-2">
                  Відображуване ім'я
                </label>
                <input
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    setNameError("");
                  }}
                  placeholder="Твоє ім'я"
                  className="w-full bg-white/60 border border-white/60 rounded-2xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-300"
                />
                {nameError && (
                  <p className="text-red-500 text-xs mt-1">{nameError}</p>
                )}
              </div>
              {nameSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-green-600 text-sm font-medium">
                  ✅ Ім'я оновлено
                </div>
              )}
              <button
                onClick={handleUpdateName}
                disabled={nameLoading}
                className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-3 rounded-2xl font-black transition hover:shadow-lg disabled:opacity-60 flex items-center gap-2"
              >
                {nameLoading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  "Зберегти"
                )}
              </button>
            </div>
          </div>

          {/* CHANGE PASSWORD — тільки для email провайдера */}
          {isEmailProvider && (
            <div className="backdrop-blur-3xl bg-white/40 border border-white/50 rounded-[32px] p-8 shadow-xl">
              <h2 className="text-2xl font-black text-slate-800 mb-6">
                Змінити пароль
              </h2>
              <div className="max-w-md space-y-4">
                {[
                  {
                    label: "Поточний пароль",
                    value: currentPassword,
                    setter: setCurrentPassword,
                  },
                  {
                    label: "Новий пароль",
                    value: newPassword,
                    setter: setNewPassword,
                  },
                  {
                    label: "Підтвердити новий пароль",
                    value: confirmPassword,
                    setter: setConfirmPassword,
                  },
                ].map(({ label, value, setter }) => (
                  <div key={label}>
                    <label className="block text-sm font-bold text-slate-600 mb-2">
                      {label}
                    </label>
                    <input
                      type="password"
                      value={value}
                      onChange={(e) => {
                        setter(e.target.value);
                        setPasswordError("");
                      }}
                      placeholder="••••••••"
                      className="w-full bg-white/60 border border-white/60 rounded-2xl px-4 py-3 text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-300"
                    />
                  </div>
                ))}
                {passwordError && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-red-600 text-sm">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 text-green-600 text-sm font-medium">
                    ✅ Пароль змінено
                  </div>
                )}
                <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white px-6 py-3 rounded-2xl font-black transition hover:shadow-lg disabled:opacity-60 flex items-center gap-2"
                >
                  {passwordLoading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Змінити пароль"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* DANGER ZONE */}
          <div className="backdrop-blur-3xl bg-white/40 border border-red-200/50 rounded-[32px] p-8 shadow-xl">
            <h2 className="text-2xl font-black text-red-500 mb-2">
              Небезпечна зона
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Видалення акаунту незворотнє. Всі твої маршрути залишаться в базі
              даних.
            </p>
            <button
              onClick={() => {
                setDeleteOpen(true);
                setDeleteError("");
                setDeletePassword("");
              }}
              className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-500 px-6 py-3 rounded-2xl font-black transition"
            >
              🗑️ Видалити акаунт
            </button>
          </div>
        </div>

        <Footer />
      </div>

      {/* DELETE MODAL */}
      {deleteOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-[28px] p-8 w-full max-w-sm shadow-2xl">
            <div className="text-4xl mb-4 text-center">⚠️</div>
            <h3 className="text-xl font-black text-slate-800 mb-2 text-center">
              Видалити акаунт?
            </h3>
            <p className="text-slate-500 text-sm text-center mb-6">
              Цю дію не можна скасувати. Акаунт буде видалено назавжди.
            </p>
            {isEmailProvider && (
              <div className="mb-4">
                <label className="block text-sm font-bold text-slate-600 mb-2">
                  Підтвердіть пароль
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    setDeleteError("");
                  }}
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-red-300"
                />
              </div>
            )}
            {deleteError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 mb-4 text-red-600 text-sm">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteOpen(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl py-3 font-bold transition"
              >
                Скасувати
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-2xl py-3 font-black transition disabled:opacity-60 flex items-center justify-center"
              >
                {deleteLoading ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  "Видалити"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
