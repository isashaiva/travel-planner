import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";
import { useAuth } from "../app/AuthContext";
import {
  getPublicRoutes,
  toggleLike,
  getUserLikes,
  getComments,
  addComment,
  deleteComment,
  copyRoute,
} from "../features/dashboard/dashboardService";

export default function ExplorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedRoutes, setLikedRoutes] = useState<Set<string>>(new Set());
  const [openedRoute, setOpenedRoute] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    setLoading(true);
    const data = await getPublicRoutes();
    setRoutes(data);
    if (user) {
      const liked = await getUserLikes(data.map((r: any) => r.id));
      setLikedRoutes(liked);
    }
    setLoading(false);
  };

  const handleLike = async (routeId: string) => {
    if (!user) return navigate("/login");
    const wasLiked = likedRoutes.has(routeId);
    // Optimistic update
    setLikedRoutes((prev) => {
      const next = new Set(prev);
      wasLiked ? next.delete(routeId) : next.add(routeId);
      return next;
    });
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === routeId
          ? { ...r, likesCount: r.likesCount + (wasLiked ? -1 : 1) }
          : r,
      ),
    );
    await toggleLike(routeId);
  };

  const handleOpenComments = async (route: any) => {
    setOpenedRoute(route);
    setCommentText("");
    const data = await getComments(route.id);
    setComments(data);
  };

  const handleAddComment = async () => {
    if (!user) return navigate("/login");
    if (!commentText.trim()) return;
    setCommentLoading(true);
    await addComment(openedRoute.id, commentText.trim());
    setCommentText("");
    const data = await getComments(openedRoute.id);
    setComments(data);
    setCommentLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  };

  const handleCopy = async (route: any) => {
    if (!user) return navigate("/login");
    await copyRoute(route);
    setCopiedId(route.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const types = ["all", ...Array.from(new Set(routes.map((r) => r.type)))];
  const filtered =
    filterType === "all" ? routes : routes.filter((r) => r.type === filterType);

  const getPhoto = (route: any) =>
    route.places?.find((p: any) => p.photo)?.photo ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800";

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-[320px] h-[320px] rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="absolute top-[20%] right-[-100px] w-[400px] h-[400px] rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute bottom-[-120px] left-[20%] w-[350px] h-[350px] rounded-full bg-white/60 blur-3xl" />
        <div className="absolute bottom-[10%] right-[10%] w-[220px] h-[220px] rounded-full bg-cyan-200/50 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <div className="max-w-7xl mx-auto px-6 py-10">
          {/* HEADER */}
          <div className="mb-10">
            <h1 className="text-5xl font-black text-slate-800">🌍 Explore</h1>
            <p className="text-slate-500 mt-2">
              Публічні маршрути від спільноти
            </p>
          </div>

          {/* FILTERS */}
          <div className="flex gap-3 flex-wrap mb-8">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-5 py-2 rounded-2xl font-bold text-sm transition capitalize
                  ${
                    filterType === type
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-200"
                      : "bg-white/60 border border-white/60 text-slate-600 hover:bg-white"
                  }`}
              >
                {type === "all" ? "🗺️ Всі" : type}
              </button>
            ))}
          </div>

          {/* TOAST */}
          {copiedId && (
            <div className="fixed top-6 right-6 z-50">
              <div className="bg-white border border-sky-100 shadow-2xl rounded-3xl px-6 py-4 flex items-center gap-3">
                <div className="text-2xl">✅</div>
                <div>
                  <div className="font-black text-slate-800">Збережено!</div>
                  <div className="text-slate-500 text-sm">
                    Маршрут додано до вашого Dashboard
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ROUTES */}
          {loading ? (
            <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white/60 rounded-[34px] h-96 animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="text-7xl mb-6">🌐</div>
              <h2 className="text-3xl font-black text-slate-800 mb-3">
                Поки що порожньо
              </h2>
              <p className="text-slate-500 max-w-md">
                Будьте першим хто поділиться маршрутом — зробіть будь-який
                маршрут публічним у Dashboard.
              </p>
            </div>
          ) : (
            <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-6">
              {filtered.map((route) => (
                <div
                  key={route.id}
                  className="group bg-white rounded-[34px] overflow-hidden border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  {/* IMAGE */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={getPhoto(route)}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-4 left-4 bg-sky-500/95 backdrop-blur text-white px-4 py-2 rounded-2xl text-sm font-black capitalize shadow-lg">
                      {route.type}
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* AUTHOR */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0">
                        {route.userPhoto ? (
                          <img
                            src={route.userPhoto}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-black">
                            {(route.userName || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-slate-500 text-sm font-medium truncate">
                        {route.userName || "Анонім"}
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-slate-800 mb-2 line-clamp-1">
                      {route.title}
                    </h2>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 min-h-[40px]">
                      {route.description}
                    </p>

                    {/* STATS */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                        <div className="text-slate-400 text-xs mb-1">
                          Локацій
                        </div>
                        <div className="text-2xl font-black text-sky-500">
                          {route.places?.length || 0}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 border border-slate-100 p-3">
                        <div className="text-slate-400 text-xs mb-1">
                          Бюджет
                        </div>
                        <div className="text-2xl font-black text-slate-800">
                          {route.budget?.total || 0} ₴
                        </div>
                      </div>
                    </div>

                    {/* PLACES preview */}
                    <div className="space-y-2 mb-4">
                      {route.places
                        ?.slice(0, 3)
                        .map((place: any, index: number) => (
                          <div
                            key={place.place_id}
                            onClick={() =>
                              navigate("/location/" + place.place_id, {
                                state: { place },
                              })
                            }
                            className="bg-slate-50 hover:bg-sky-50 hover:border-sky-200 border border-slate-100 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition"
                          >
                            <div className="w-7 h-7 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                              {index + 1}
                            </div>
                            <span className="text-slate-700 font-medium text-sm truncate">
                              {place.name}
                            </span>
                          </div>
                        ))}
                      {route.places?.length > 3 && (
                        <div className="text-slate-400 text-xs text-center">
                          +{route.places.length - 3} локацій
                        </div>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex gap-2 mt-auto">
                      {/* LIKE */}
                      <button
                        onClick={() => handleLike(route.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition
                          ${
                            likedRoutes.has(route.id)
                              ? "bg-red-50 text-red-500 border border-red-200"
                              : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500"
                          }`}
                      >
                        {likedRoutes.has(route.id) ? "❤️" : "🤍"}{" "}
                        {route.likesCount || 0}
                      </button>

                      {/* COMMENTS */}
                      <button
                        onClick={() => handleOpenComments(route)}
                        className="flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-500 transition"
                      >
                        💬
                      </button>

                      {/* COPY */}
                      {user && route.userId !== user.uid && (
                        <button
                          onClick={() => handleCopy(route)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm bg-gradient-to-r from-cyan-400 to-blue-500 text-white transition hover:shadow-lg"
                        >
                          {copiedId === route.id
                            ? "✅ Збережено"
                            : "⬇️ Зберегти"}
                        </button>
                      )}

                      {/* Own route badge */}
                      {user && route.userId === user.uid && (
                        <div className="flex-1 flex items-center justify-center px-4 py-3 rounded-2xl text-sm bg-slate-50 text-slate-400 font-bold">
                          Ваш маршрут
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>

      {/* COMMENTS MODAL */}
      {openedRoute && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
            {/* HEADER */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-black text-slate-800">
                  💬 Коментарі
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  {openedRoute.title}
                </p>
              </div>
              <button
                onClick={() => setOpenedRoute(null)}
                className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-2xl font-bold text-sm"
              >
                Закрити
              </button>
            </div>

            {/* COMMENTS LIST */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <div className="text-4xl mb-3">💬</div>
                  Коментарів ще немає. Будьте першим!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
                      {comment.userPhoto ? (
                        <img
                          src={comment.userPhoto}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-xs font-black">
                          {(comment.userName || "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-slate-800 text-sm">
                          {comment.userName}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-xs">
                            {new Date(comment.createdAt).toLocaleDateString(
                              "uk-UA",
                            )}
                          </span>
                          {user?.uid === comment.userId && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="text-slate-300 hover:text-red-400 transition text-xs"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {comment.text}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* INPUT */}
            {user ? (
              <div className="p-4 border-t flex gap-3">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Написати коментар..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-sky-300"
                />
                <button
                  onClick={handleAddComment}
                  disabled={commentLoading || !commentText.trim()}
                  className="bg-sky-500 hover:bg-sky-600 text-white px-5 py-3 rounded-2xl font-black text-sm transition disabled:opacity-50"
                >
                  {commentLoading ? (
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    "➤"
                  )}
                </button>
              </div>
            ) : (
              <div className="p-4 border-t text-center">
                <button
                  onClick={() => navigate("/login")}
                  className="text-sky-500 font-bold text-sm hover:underline"
                >
                  Увійдіть щоб залишити коментар
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
