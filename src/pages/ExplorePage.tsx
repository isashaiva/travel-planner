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
  toggleCommentReaction,
  getUserCommentReactions,
} from "../features/dashboard/dashboardService";

function RouteCardSkeleton() {
  return (
    <div className="bg-white rounded-[24px] sm:rounded-[34px] overflow-hidden border border-slate-200 shadow-lg flex flex-col animate-pulse">
      <div className="h-40 sm:h-52 bg-slate-200" />
      <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200" />
          <div className="h-3 sm:h-4 w-20 sm:w-24 bg-slate-200 rounded-full" />
        </div>
        <div className="h-6 sm:h-7 bg-slate-200 rounded-2xl w-3/4" />
        <div className="h-3 sm:h-4 bg-slate-100 rounded-full w-full" />
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="h-14 sm:h-16 bg-slate-100 rounded-xl sm:rounded-2xl" />
          <div className="h-14 sm:h-16 bg-slate-100 rounded-xl sm:rounded-2xl" />
        </div>
        <div className="space-y-2">
          <div className="h-9 sm:h-10 bg-slate-100 rounded-xl" />
          <div className="h-9 sm:h-10 bg-slate-100 rounded-xl" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 sm:h-12 w-14 sm:w-16 bg-slate-100 rounded-xl sm:rounded-2xl" />
          <div className="h-10 sm:h-12 w-10 sm:w-12 bg-slate-100 rounded-xl sm:rounded-2xl" />
          <div className="flex-1 h-10 sm:h-12 bg-slate-100 rounded-xl sm:rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function CommentSkeleton() {
  return (
    <div className="flex gap-2 sm:gap-3 animate-pulse">
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200 shrink-0" />
      <div className="flex-1 bg-slate-100 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-2">
        <div className="h-3 bg-slate-200 rounded-full w-1/3" />
        <div className="h-3 bg-slate-200 rounded-full w-full" />
        <div className="h-3 bg-slate-200 rounded-full w-2/3" />
      </div>
    </div>
  );
}

function UserAvatar({
  photo,
  name,
  size = "sm",
}: {
  photo?: string | null;
  name: string;
  size?: "sm" | "md";
}) {
  const cls =
    size === "sm"
      ? "w-8 h-8 sm:w-9 sm:h-9 text-xs"
      : "w-7 h-7 sm:w-8 sm:h-8 text-xs";
  return (
    <div className={`${cls} rounded-full overflow-hidden shrink-0`}>
      {photo ? (
        <img
          src={photo}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-black">
          {(name || "?").charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}

export default function ExplorePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedRoutes, setLikedRoutes] = useState<Set<string>>(new Set());
  const [likingId, setLikingId] = useState<string | null>(null);
  const [openedRoute, setOpenedRoute] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [replyTo, setReplyTo] = useState<{
    id: string;
    userName: string;
  } | null>(null);
  const [commentReactions, setCommentReactions] = useState<
    Record<string, "like" | "dislike">
  >({});
  const [reactingId, setReactingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyingId, setCopyingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");

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
    setLikingId(routeId);
    const wasLiked = likedRoutes.has(routeId);
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
    setLikingId(null);
  };

  const handleOpenComments = async (route: any) => {
    setOpenedRoute(route);
    setCommentText("");
    setReplyTo(null);
    setCommentsLoading(true);
    const data = await getComments(route.id);
    setComments(data);
    if (user && data.length > 0) {
      const reactions = await getUserCommentReactions(
        data.map((c: any) => c.id),
      );
      setCommentReactions(reactions);
    }
    setCommentsLoading(false);
  };

  const handleAddComment = async () => {
    if (!user) return navigate("/login");
    if (!commentText.trim()) return;
    setCommentLoading(true);
    await addComment(openedRoute.id, commentText.trim(), replyTo);
    setCommentText("");
    setReplyTo(null);
    const data = await getComments(openedRoute.id);
    setComments(data);
    if (data.length > 0) {
      const reactions = await getUserCommentReactions(
        data.map((c: any) => c.id),
      );
      setCommentReactions(reactions);
    }
    setCommentLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
    setComments((prev) =>
      prev.filter((c) => c.id !== commentId && c.replyTo?.id !== commentId),
    );
  };

  const handleReaction = async (
    commentId: string,
    reaction: "like" | "dislike",
  ) => {
    if (!user) return navigate("/login");
    setReactingId(commentId);
    const prev = commentReactions[commentId];
    const result = await toggleCommentReaction(commentId, reaction);
    setCommentReactions((prev_r) => {
      const next = { ...prev_r };
      result === null ? delete next[commentId] : (next[commentId] = result);
      return next;
    });
    setComments((prev_c) =>
      prev_c.map((c) => {
        if (c.id !== commentId) return c;
        const u = { ...c };
        if (prev === reaction) {
          u[reaction === "like" ? "likes" : "dislikes"] = Math.max(
            0,
            (u[reaction === "like" ? "likes" : "dislikes"] || 0) - 1,
          );
        } else {
          if (prev)
            u[prev === "like" ? "likes" : "dislikes"] = Math.max(
              0,
              (u[prev === "like" ? "likes" : "dislikes"] || 0) - 1,
            );
          u[reaction === "like" ? "likes" : "dislikes"] =
            (u[reaction === "like" ? "likes" : "dislikes"] || 0) + 1;
        }
        return u;
      }),
    );
    setReactingId(null);
  };

  const handleCopy = async (route: any) => {
    if (!user) return navigate("/login");
    setCopyingId(route.id);
    await copyRoute(route);
    setCopyingId(null);
    setCopiedId(route.id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const types = ["all", "history", "city", "nature"];
  const filtered = routes.filter((r) => {
    const matchesType = filterType === "all" || r.type === filterType;
    const matchesSearch =
      search.trim() === "" ||
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.city?.toLowerCase().includes(search.toLowerCase()) ||
      r.places?.some((p: any) =>
        p.name?.toLowerCase().includes(search.toLowerCase()),
      );
    return matchesType && matchesSearch;
  });

  const getPhoto = (route: any) =>
    route.places?.find((p: any) => p.photo)?.photo ||
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800";

  const rootComments = comments.filter((c) => !c.replyTo);
  const getReplies = (commentId: string) =>
    comments.filter((c) => c.replyTo?.id === commentId);

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-sky-100 via-cyan-50 to-blue-100">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-80px] left-[-80px] w-[220px] sm:w-[320px] h-[220px] sm:h-[320px] rounded-full bg-cyan-300/40 blur-3xl" />
        <div className="absolute top-[20%] right-[-60px] sm:right-[-100px] w-[280px] sm:w-[400px] h-[280px] sm:h-[400px] rounded-full bg-blue-300/30 blur-3xl" />
        <div className="absolute bottom-[-80px] left-[10%] sm:left-[20%] w-[250px] sm:w-[350px] h-[250px] sm:h-[350px] rounded-full bg-white/60 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <div className="mb-6 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-800">
              🌍 Explore
            </h1>
            <p className="text-slate-500 mt-1 sm:mt-2 text-sm sm:text-base">
              Публічні маршрути від спільноти
            </p>
          </div>

          {!loading && (
            <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-3 sm:left-4 flex items-center pointer-events-none text-slate-400 text-sm">
                  🔍
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Пошук маршрутів, міст, локацій..."
                  className="w-full bg-white/60 backdrop-blur border border-white/60 rounded-xl sm:rounded-2xl pl-9 sm:pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-sky-300 shadow-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute inset-y-0 right-3 sm:right-4 flex items-center text-slate-400 hover:text-slate-600 text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="flex gap-2 sm:gap-3 flex-wrap">
                {types.map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition capitalize
                      ${filterType === type ? "bg-sky-500 text-white shadow-lg shadow-sky-200" : "bg-white/60 border border-white/60 text-slate-600 hover:bg-white"}`}
                  >
                    {type === "all"
                      ? "🗺️ Всі"
                      : type === "history"
                        ? "🏛️ History"
                        : type === "city"
                          ? "🌆 City"
                          : "🌿 Nature"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {copiedId && (
            <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
              <div className="bg-white border border-sky-100 shadow-2xl rounded-2xl sm:rounded-3xl px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3">
                <div className="text-xl sm:text-2xl">✅</div>
                <div>
                  <div className="font-black text-slate-800 text-sm sm:text-base">
                    Збережено!
                  </div>
                  <div className="text-slate-500 text-xs sm:text-sm">
                    Маршрут додано до вашого Dashboard
                  </div>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <RouteCardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 sm:py-32 text-center px-4">
              <div className="text-5xl sm:text-7xl mb-4 sm:mb-6">🌐</div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 mb-2 sm:mb-3">
                Поки що порожньо
              </h2>
              <p className="text-slate-500 max-w-md text-sm sm:text-base">
                Будьте першим хто поділиться маршрутом — зробіть будь-який
                маршрут публічним у Dashboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filtered.map((route) => (
                <div
                  key={route.id}
                  className="group bg-white rounded-[24px] sm:rounded-[34px] overflow-hidden border border-slate-200 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
                >
                  <div className="relative h-40 sm:h-52 overflow-hidden">
                    <img
                      src={getPhoto(route)}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-sky-500/95 backdrop-blur text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black capitalize shadow-lg">
                      {route.type}
                    </div>
                    {route.city && (
                      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 bg-black/40 backdrop-blur text-white px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl text-xs font-bold">
                        📍 {route.city}
                      </div>
                    )}
                  </div>

                  <div className="p-4 sm:p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <UserAvatar
                        photo={route.userPhoto}
                        name={route.userName || "?"}
                        size="md"
                      />
                      <span className="text-slate-500 text-xs sm:text-sm font-medium truncate">
                        {route.userName || "Анонім"}
                      </span>
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black text-slate-800 mb-1 sm:mb-2 line-clamp-1">
                      {route.title}
                    </h2>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-3 sm:mb-4 min-h-[32px] sm:min-h-[40px]">
                      {route.description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                      <div className="rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 p-2.5 sm:p-3">
                        <div className="text-slate-400 text-xs mb-1">
                          Локацій
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-sky-500">
                          {route.places?.length || 0}
                        </div>
                      </div>
                      <div className="rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 p-2.5 sm:p-3">
                        <div className="text-slate-400 text-xs mb-1">
                          Бюджет
                        </div>
                        <div className="text-xl sm:text-2xl font-black text-slate-800">
                          {route.budget?.total || 0} ₴
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
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
                            className="bg-slate-50 hover:bg-sky-50 hover:border-sky-200 border border-slate-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3 flex items-center gap-2 sm:gap-3 cursor-pointer transition"
                          >
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl bg-sky-500 text-white flex items-center justify-center font-black text-xs shrink-0">
                              {index + 1}
                            </div>
                            <span className="text-slate-700 font-medium text-xs sm:text-sm truncate">
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

                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleLike(route.id)}
                        className={`flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition min-w-[56px] sm:min-w-[64px]
                          ${likedRoutes.has(route.id) ? "bg-red-50 text-red-500 border border-red-200" : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500"}`}
                      >
                        {likingId === route.id ? (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            {likedRoutes.has(route.id) ? "❤️" : "🤍"}{" "}
                            {route.likesCount || 0}
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenComments(route)}
                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-500 transition"
                      >
                        💬
                      </button>

                      {user && route.userId !== user.uid && (
                        <button
                          onClick={() => handleCopy(route)}
                          disabled={copyingId === route.id}
                          className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-cyan-400 to-blue-500 text-white transition hover:shadow-lg disabled:opacity-70"
                        >
                          {copyingId === route.id ? (
                            <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          ) : copiedId === route.id ? (
                            "✅"
                          ) : (
                            "⬇️ Зберегти"
                          )}
                        </button>
                      )}
                      {user && route.userId === user.uid && (
                        <div className="flex-1 flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm bg-slate-50 text-slate-400 font-bold">
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
          <div className="bg-white rounded-t-[28px] sm:rounded-[32px] w-full sm:max-w-lg shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-800">
                  💬 Коментарі
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-0.5 sm:mt-1">
                  {openedRoute.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setOpenedRoute(null);
                  setReplyTo(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm"
              >
                Закрити
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
              {commentsLoading ? (
                <>
                  <CommentSkeleton />
                  <CommentSkeleton />
                  <CommentSkeleton />
                </>
              ) : rootComments.length === 0 ? (
                <div className="text-center py-8 sm:py-10 text-slate-400">
                  <div className="text-3xl sm:text-4xl mb-2 sm:mb-3">💬</div>
                  <p className="text-sm sm:text-base">
                    Коментарів ще немає. Будьте першим!
                  </p>
                </div>
              ) : (
                rootComments.map((comment) => (
                  <div key={comment.id}>
                    <div className="flex gap-2 sm:gap-3">
                      <UserAvatar
                        photo={comment.userPhoto}
                        name={comment.userName}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-slate-800 text-xs sm:text-sm">
                              {comment.userName}
                            </span>
                            <div className="flex items-center gap-1 sm:gap-2">
                              <span className="text-slate-400 text-xs">
                                {new Date(comment.createdAt).toLocaleDateString(
                                  "uk-UA",
                                )}
                              </span>
                              {user?.uid === comment.userId && (
                                <button
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                  className="text-slate-300 hover:text-red-400 transition text-xs"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                            {comment.text}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 px-1">
                          <button
                            onClick={() => handleReaction(comment.id, "like")}
                            disabled={reactingId === comment.id}
                            className={`flex items-center gap-1 text-xs font-bold transition ${commentReactions[comment.id] === "like" ? "text-sky-500" : "text-slate-400 hover:text-sky-500"}`}
                          >
                            👍 {comment.likes || 0}
                          </button>
                          <button
                            onClick={() =>
                              handleReaction(comment.id, "dislike")
                            }
                            disabled={reactingId === comment.id}
                            className={`flex items-center gap-1 text-xs font-bold transition ${commentReactions[comment.id] === "dislike" ? "text-red-500" : "text-slate-400 hover:text-red-500"}`}
                          >
                            👎 {comment.dislikes || 0}
                          </button>
                          {user && (
                            <button
                              onClick={() =>
                                setReplyTo(
                                  replyTo?.id === comment.id
                                    ? null
                                    : {
                                        id: comment.id,
                                        userName: comment.userName,
                                      },
                                )
                              }
                              className={`text-xs font-bold transition ${replyTo?.id === comment.id ? "text-sky-500" : "text-slate-400 hover:text-sky-500"}`}
                            >
                              ↩ Відповісти
                            </button>
                          )}
                        </div>
                        {getReplies(comment.id).length > 0 && (
                          <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3 pl-3 sm:pl-4 border-l-2 border-slate-100">
                            {getReplies(comment.id).map((reply) => (
                              <div
                                key={reply.id}
                                className="flex gap-2 sm:gap-3"
                              >
                                <UserAvatar
                                  photo={reply.userPhoto}
                                  name={reply.userName}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="bg-slate-50 rounded-xl p-2.5 sm:p-3">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center gap-1 sm:gap-2">
                                        <span className="font-black text-slate-800 text-xs">
                                          {reply.userName}
                                        </span>
                                        <span className="text-sky-500 text-xs">
                                          @{reply.replyTo?.userName}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 sm:gap-2">
                                        <span className="text-slate-400 text-xs">
                                          {new Date(
                                            reply.createdAt,
                                          ).toLocaleDateString("uk-UA")}
                                        </span>
                                        {user?.uid === reply.userId && (
                                          <button
                                            onClick={() =>
                                              handleDeleteComment(reply.id)
                                            }
                                            className="text-slate-300 hover:text-red-400 transition text-xs"
                                          >
                                            ✕
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                                      {reply.text}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1 px-1">
                                    <button
                                      onClick={() =>
                                        handleReaction(reply.id, "like")
                                      }
                                      disabled={reactingId === reply.id}
                                      className={`flex items-center gap-1 text-xs font-bold transition ${commentReactions[reply.id] === "like" ? "text-sky-500" : "text-slate-400 hover:text-sky-500"}`}
                                    >
                                      👍 {reply.likes || 0}
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleReaction(reply.id, "dislike")
                                      }
                                      disabled={reactingId === reply.id}
                                      className={`flex items-center gap-1 text-xs font-bold transition ${commentReactions[reply.id] === "dislike" ? "text-red-500" : "text-slate-400 hover:text-red-500"}`}
                                    >
                                      👎 {reply.dislikes || 0}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {user ? (
              <div className="p-3 sm:p-4 border-t space-y-2">
                {replyTo && (
                  <div className="flex items-center justify-between bg-sky-50 border border-sky-200 rounded-lg sm:rounded-xl px-3 py-1.5 sm:py-2">
                    <span className="text-sky-600 text-xs font-bold">
                      ↩ Відповідь для @{replyTo.userName}
                    </span>
                    <button
                      onClick={() => setReplyTo(null)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <div className="flex gap-2 sm:gap-3">
                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && handleAddComment()
                    }
                    placeholder={
                      replyTo
                        ? `Відповідь для @${replyTo.userName}...`
                        : "Написати коментар..."
                    }
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-sky-300"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={commentLoading || !commentText.trim()}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-sm transition disabled:opacity-50 flex items-center justify-center"
                  >
                    {commentLoading ? (
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      "➤"
                    )}
                  </button>
                </div>
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
