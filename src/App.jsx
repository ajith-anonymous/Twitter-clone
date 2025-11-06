import React, { useState, useMemo } from "react";
import { Sun, Moon, Search, Heart, Repeat, MessageCircle, MoreHorizontal, ChevronLeft, User, Feather } from "lucide-react";

// Tailwind + shadcn/ui + lucide-react assumed available in host project.
// Default export a single React component that renders a full single-file app.

export default function TwitterClone() {
  const [theme, setTheme] = useState("dark");
  const [tweets, setTweets] = useState(initialTweets());
  const [query, setQuery] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [composeText, setComposeText] = useState("");
  const [activeTweet, setActiveTweet] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tweets;
    return tweets.filter(
      (t) => t.content.toLowerCase().includes(q) || t.author.name.toLowerCase().includes(q)
    );
  }, [tweets, query]);

  function toggleTheme() {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }

  function postTweet() {
    if (!composeText.trim()) return;
    const newTweet = {
      id: Date.now(),
      author: defaultProfiles()[Math.floor(Math.random() * 4)],
      content: composeText.trim(),
      liked: false,
      likes: 0,
      retweets: 0,
      replies: [],
      timestamp: new Date().toISOString(),
    };
    setTweets((s) => [newTweet, ...s]);
    setComposeText("");
    setShowCompose(false);
  }

  function toggleLike(id) {
    setTweets((s) => s.map((t) => (t.id === id ? { ...t, liked: !t.liked, likes: t.liked ? t.likes - 1 : t.likes + 1 } : t)));
  }

  function doRetweet(id) {
    setTweets((s) => s.map((t) => (t.id === id ? { ...t, retweets: t.retweets + 1 } : t)));
  }

  function replyTo(id, text) {
    if (!text.trim()) return;
    setTweets((s) =>
      s.map((t) => (t.id === id ? { ...t, replies: [{ id: Date.now(), text }, ...t.replies] } : t))
    );
    setActiveTweet(null);
  }

  return (
    <div className={theme === "dark" ? "min-h-screen bg-black text-white" : "min-h-screen bg-white text-black"}>
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6 p-6">
        {/* LEFT - Profile / Nav */}
        <aside className="col-span-3 sticky top-6 hidden lg:block">
          <div className="p-4 rounded-2xl border border-zinc-700/30 dark:border-zinc-300/10">
            <div className="flex items-center gap-3">
              <PrettyAvatar profile={defaultProfiles()[0]} large />
              <div>
                <div className="font-bold">{defaultProfiles()[0].name}</div>
                <div className="text-sm opacity-70">@{defaultProfiles()[0].handle}</div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <NavButton label="Profile" icon={<User size={18} />} />
              <NavButton label="Explore" icon={<Search size={18} />} active />
              <NavButton label="Messages" icon={<MessageCircle size={18} />} />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setShowCompose(true)}
                  className="flex-1 rounded-xl border px-4 py-2 font-semibold"
                >
                  Compose
                </button>
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="rounded-xl border p-2"
                >
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl border border-zinc-700/30 dark:border-zinc-300/10">
            <h4 className="font-semibold">Who to follow</h4>
            <div className="mt-4 space-y-3">
              {defaultProfiles().slice(1).map((p) => (
                <FollowRow key={p.handle} profile={p} />
              ))}
            </div>
          </div>
        </aside>

        {/* MAIN - Feed */}
        <main className="col-span-12 lg:col-span-6">
          <div className="sticky top-6 bg-transparent z-10">
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center gap-3">
                <button className="p-2 rounded-full bg-zinc-800/30">
                  <ChevronLeft size={18} />
                </button>
                <h2 className="text-xl font-bold">Explore</h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search tweets or people"
                    className="rounded-full border px-3 py-2 pl-10 w-56 focus:outline-none"
                  />
                  <div className="absolute left-3 top-2.5 opacity-60">
                    <Search size={16} />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b pb-3 mb-4">
              <div className="flex items-center gap-3">
                <PrettyAvatar profile={defaultProfiles()[2]} />
                <button onClick={() => setShowCompose(true)} className="flex-1 rounded-full border px-4 py-2 text-left">
                  What's happening?
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {filtered.map((t) => (
              <TweetCard
                key={t.id}
                tweet={t}
                onLike={() => toggleLike(t.id)}
                onRetweet={() => doRetweet(t.id)}
                onReply={() => setActiveTweet(t)}
              />
            ))}
          </div>
        </main>

        {/* RIGHT - Trends / extra */}
        <aside className="col-span-3 hidden lg:block">
          <div className="p-4 rounded-2xl border border-zinc-700/30 dark:border-zinc-300/10">
            <h4 className="font-semibold">Trends</h4>
            <div className="mt-3 space-y-2">
              <TrendRow tag="#Design" tweets={3456} />
              <TrendRow tag="#AI" tweets={28900} />
              <TrendRow tag="#CollegeLife" tweets={612} />
              <TrendRow tag="#OpenSource" tweets={1200} />
            </div>
          </div>

          <div className="mt-6 p-4 rounded-2xl border border-zinc-700/30 dark:border-zinc-300/10">
            <h4 className="font-semibold">Tips</h4>
            <p className="mt-2 text-sm opacity-80">Click Compose to create a tweet. Use the buttons on each tweet to like / retweet / reply.</p>
          </div>
        </aside>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCompose(false)}></div>
          <div className="relative w-full max-w-2xl p-6 rounded-2xl bg-white text-black">
            <div className="flex items-start gap-4">
              <PrettyAvatar profile={defaultProfiles()[0]} />
              <div className="flex-1">
                <textarea
                  value={composeText}
                  onChange={(e) => setComposeText(e.target.value)}
                  placeholder="What's happening?"
                  className="w-full min-h-[120px] p-3 rounded-lg border resize-none"
                />
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-3">
                    <button className="rounded-full border p-2" title="Add image">
                      <Feather size={16} />
                    </button>
                    <button className="rounded-full border p-2" title="More">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-sm opacity-70">{composeText.length}/280</div>
                    <button className="rounded-xl px-4 py-2 bg-black text-white" onClick={postTweet}>
                      Tweet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {activeTweet && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setActiveTweet(null)}></div>
          <div className="relative w-full max-w-2xl p-6 rounded-2xl bg-white text-black">
            <div className="flex gap-4">
              <PrettyAvatar profile={activeTweet.author} />
              <div className="flex-1">
                <div className="text-sm opacity-80">Replying to @{activeTweet.author.handle}</div>
                <div className="mt-3 p-3 rounded-lg border">{activeTweet.content}</div>

                <ReplyBox onSend={(text) => replyTo(activeTweet.id, text)} />

                <div className="mt-3">
                  <h5 className="font-semibold">Replies</h5>
                  <div className="mt-2 space-y-2">
                    {activeTweet.replies.length === 0 && <div className="text-sm opacity-70">No replies yet</div>}
                    {activeTweet.replies.map((r) => (
                      <div key={r.id} className="p-3 rounded-lg border">
                        {r.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------- Small components ----------------- */

function NavButton({ label, icon, active }) {
  return (
    <button className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-800/20 ${active ? "font-semibold" : ""}`}>
      <div className="opacity-80">{icon}</div>
      <div>{label}</div>
    </button>
  );
}

function TrendRow({ tag, tweets }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="font-semibold">{tag}</div>
        <div className="text-sm opacity-70">{Number(tweets).toLocaleString()} Tweets</div>
      </div>
      <div className="rounded-full border px-3 py-1">Follow</div>
    </div>
  );
}

function FollowRow({ profile }) {
  const [following, setFollowing] = useState(false);
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <PrettyAvatar profile={profile} />
        <div>
          <div className="font-semibold">{profile.name}</div>
          <div className="text-sm opacity-70">@{profile.handle}</div>
        </div>
      </div>
      <button onClick={() => setFollowing((s) => !s)} className={`rounded-xl px-3 py-1 ${following ? "bg-white text-black" : "border"}`}>
        {following ? "Following" : "Follow"}
      </button>
    </div>
  );
}

function TweetCard({ tweet, onLike, onRetweet, onReply }) {
  return (
    <article className="p-4 rounded-2xl border">
      <div className="flex gap-3">
        <PrettyAvatar profile={tweet.author} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="font-semibold">{tweet.author.name}</div>
                <div className="text-sm opacity-70">@{tweet.author.handle}</div>
                <div className="text-sm opacity-50">· {timeAgo(tweet.timestamp)}</div>
              </div>
            </div>
            <button className="p-2 rounded-full">
              <MoreHorizontal size={16} />
            </button>
          </div>

          <div className="mt-3 text-sm leading-6">{tweet.content}</div>

          <div className="mt-4 flex items-center gap-6 text-sm opacity-80">
            <button onClick={onReply} className="flex items-center gap-2">
              <MessageCircle size={16} /> <span>{tweet.replies.length}</span>
            </button>
            <button onClick={onRetweet} className="flex items-center gap-2">
              <Repeat size={16} /> <span>{tweet.retweets}</span>
            </button>
            <button onClick={onLike} className={`flex items-center gap-2 ${tweet.liked ? "text-red-400" : ""}`}>
              <Heart size={16} /> <span>{tweet.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ReplyBox({ onSend }) {
  const [txt, setTxt] = useState("");
  return (
    <div className="mt-4">
      <textarea value={txt} onChange={(e) => setTxt(e.target.value)} className="w-full p-3 rounded-lg border" placeholder="Write a reply" />
      <div className="mt-2 flex justify-end">
        <button onClick={() => { onSend(txt); setTxt(""); }} className="rounded-xl px-4 py-2 bg-black text-white">Reply</button>
      </div>
    </div>
  );
}

function PrettyAvatar({ profile, large }) {
  const sizeClass = large ? "w-16 h-16" : "w-10 h-10";
  return (
    <div className={`flex-shrink-0 ${sizeClass} rounded-full overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-600 flex items-center justify-center`}> 
      {/* decorative 'pretty' icon-based avatar */}
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`g-${profile.handle}`} x1="0" x2="1">
            <stop offset="0%" stopColor={profile.colors[0]} />
            <stop offset="100%" stopColor={profile.colors[1]} />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#g-${profile.handle})`} />
        <g transform="translate(50 50)">
          <text x="0" y="10" textAnchor="middle" fontSize="36" fontWeight="700" fill="white">{profile.initials}</text>
        </g>
      </svg>
    </div>
  );
}

/* ----------------- Helpers and seeded data ----------------- */

function initialTweets() {
  const p = defaultProfiles();
  return [
    {
      id: 1,
      author: p[1],
      content: "Design is intelligence made visible. Sharing my top 5 tips for clean UI.",
      liked: false,
      likes: 12,
      retweets: 3,
      replies: [],
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: 2,
      author: p[2],
      content: "Just finished a small React project: modern Twitter clone UI — love how Tailwind makes things fast.",
      liked: true,
      likes: 45,
      retweets: 8,
      replies: [{ id: 21, text: "Share the repo plz" }],
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    },
    {
      id: 3,
      author: p[3],
      content: "College life hack: use small, consistent goals to build momentum. #StudentLife",
      liked: false,
      likes: 3,
      retweets: 0,
      replies: [],
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
  ];
}

function defaultProfiles() {
  return [
    { name: "You", handle: "you", initials: "Y", colors: ["#111827", "#374151"] },
    { name: "Maya Rao", handle: "maya", initials: "M", colors: ["#0ea5a4", "#7c3aed"] },
    { name: "Arjun K.", handle: "arjun", initials: "A", colors: ["#ef4444", "#f97316"] },
    { name: "Neha S.", handle: "neha", initials: "N", colors: ["#10b981", "#06b6d4"] },
  ];
}

function timeAgo(iso) {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

// End of file