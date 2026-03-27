import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GodRays, MeshGradient } from "@paper-design/shaders-react"
import Icon from "@/components/ui/icon"

// ─── Данные ───────────────────────────────────────────────
const REGION_COLORS: Record<string, string> = {
  ЦФО: "#E57373",
  СЗФО: "#64B5F6",
  ЮФО: "#FFB74D",
  СКФО: "#81C784",
  ПФО: "#BA68C8",
  УФО: "#4DB6AC",
  СФО: "#F06292",
  ДФО: "#4DD0E1",
}

const TOURNAMENTS = [
  { id: 1, title: "Кубок Волги 2026", date: "12–14 апр", place: "Нижний Новгород", type: "Спиннинг", region: "ПФО" },
  { id: 2, title: "Чемпионат ЦФО", date: "20 апр", place: "Рыбинское вдхр.", type: "Поплавок", region: "ЦФО" },
  { id: 3, title: "Северная рыбалка", date: "3–5 мая", place: "Ладожское озеро", type: "Нахлыст", region: "СЗФО" },
  { id: 4, title: "Байкал Опен", date: "17 мая", place: "Байкал", type: "Спиннинг", region: "СФО" },
  { id: 5, title: "Кубок Дона", date: "24 мая", place: "Ростов-на-Дону", type: "Фидер", region: "ЮФО" },
  { id: 6, title: "Уральский трофей", date: "7–8 июн", place: "Екатеринбург", type: "Поплавок", region: "УФО" },
]

const NEWS_POSTS = [
  {
    id: 1,
    author: "Алексей Рыбников",
    region: "ПФО",
    time: "2 ч назад",
    text: "Отличная рыбалка на Волге! Поймал судака на 4.2 кг — личный рекорд. Спиннинг + воблер на глубине 3–5 м.",
    likes: 47,
    comments: 12,
    photos: ["🎣", "🐟", "🏆"],
  },
  {
    id: 2,
    author: "Мария Озёрная",
    region: "СЗФО",
    time: "5 ч назад",
    text: "Утренний клёв на Ладоге — словами не передать. Туман, тишина и щука на 6 кг 😍 Рекомендую точку у северного берега!",
    likes: 83,
    comments: 31,
    photos: ["🌅", "🎣"],
  },
  {
    id: 3,
    author: "Сергей Таёжный",
    region: "СФО",
    time: "вчера",
    text: "Готовлюсь к Байкал Опен 2026. Тренировочные выезды каждые выходные, результаты радуют. Кто едет — пишите!",
    likes: 29,
    comments: 8,
    photos: ["🏔️"],
  },
]

const TYPE_ICONS: Record<string, string> = {
  Спиннинг: "Zap",
  Поплавок: "Circle",
  Нахлыст: "Wind",
  Фидер: "Anchor",
}

// ─── Экраны ───────────────────────────────────────────────
function CalendarScreen() {
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  const [viewGrid, setViewGrid] = useState(false)

  const filtered = activeRegion
    ? TOURNAMENTS.filter((t) => t.region === activeRegion)
    : TOURNAMENTS

  return (
    <div className="flex flex-col h-full bg-[var(--kl-bg)] text-[var(--kl-text)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-3">
        <h1 className="text-xl font-bold tracking-tight">Соревнования</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewGrid(!viewGrid)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--kl-card)] shadow-sm"
          >
            <Icon name={viewGrid ? "List" : "LayoutGrid"} size={16} />
          </button>
          <div className="w-8 h-8 rounded-full bg-[var(--kl-blue)] flex items-center justify-center">
            <Icon name="User" size={15} className="text-white" />
          </div>
        </div>
      </div>

      {/* Region chips */}
      <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-none">
        {Object.entries(REGION_COLORS).map(([reg, color]) => (
          <button
            key={reg}
            onClick={() => setActiveRegion(activeRegion === reg ? null : reg)}
            className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold text-white transition-all"
            style={{
              background: color,
              opacity: activeRegion && activeRegion !== reg ? 0.45 : 1,
              outline: activeRegion === reg ? `2px solid ${color}` : "none",
              outlineOffset: "2px",
            }}
          >
            {reg}
          </button>
        ))}
      </div>

      {/* Tournaments */}
      <div className={`flex-1 overflow-y-auto px-4 pb-4 ${viewGrid ? "grid grid-cols-2 gap-3 content-start" : "flex flex-col gap-3"}`}>
        {filtered.map((t) => (
          <div
            key={t.id}
            className="bg-[var(--kl-card)] rounded-2xl p-4 shadow-sm border border-[var(--kl-border)] relative overflow-hidden"
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
              style={{ background: REGION_COLORS[t.region] }}
            />
            <div className="pl-2">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm leading-tight">{t.title}</p>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0"
                  style={{ background: REGION_COLORS[t.region] }}
                >
                  {t.region}
                </span>
              </div>
              <div className="flex items-center gap-1 mt-1.5 text-xs text-[var(--kl-muted)]">
                <Icon name="Calendar" size={11} />
                <span>{t.date}</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-xs text-[var(--kl-muted)]">
                <Icon name="MapPin" size={11} />
                <span>{t.place}</span>
              </div>
              <div className="flex items-center gap-1 mt-2">
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white"
                  style={{ background: "#1A5F8C" }}
                >
                  <Icon name={TYPE_ICONS[t.type] ?? "Fish"} size={11} className="text-white" />
                  <span>{t.type}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function NewsScreen() {
  return (
    <div className="flex flex-col h-full bg-[var(--kl-bg)] text-[var(--kl-text)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold tracking-tight">Лента</h1>
        <button className="w-8 h-8 rounded-full bg-[var(--kl-blue)] flex items-center justify-center">
          <Icon name="Bell" size={15} className="text-white" />
        </button>
      </div>

      {/* Posts */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-4">
        {NEWS_POSTS.map((post) => (
          <div key={post.id} className="bg-[var(--kl-card)] rounded-2xl p-4 shadow-sm border border-[var(--kl-border)]">
            {/* Author */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                style={{
                  background: REGION_COLORS[post.region],
                  boxShadow: `0 0 0 2px ${REGION_COLORS[post.region]}55`,
                }}
              >
                {post.author[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{post.author}</p>
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: REGION_COLORS[post.region] }}
                  >
                    {post.region}
                  </span>
                  <span className="text-[11px] text-[var(--kl-muted)]">{post.time}</span>
                </div>
              </div>
            </div>

            {/* Text */}
            <p className="text-sm leading-relaxed mb-3">{post.text}</p>

            {/* Photos */}
            {post.photos && (
              <div className="flex gap-2 mb-3">
                {post.photos.map((ph, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 rounded-xl bg-[var(--kl-bg)] flex items-center justify-center text-2xl"
                  >
                    {ph}
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 pt-2 border-t border-[var(--kl-border)]">
              <button className="flex items-center gap-1.5 text-xs text-[var(--kl-muted)] hover:text-red-400 transition-colors">
                <Icon name="Heart" size={14} />
                <span>{post.likes}</span>
              </button>
              <button className="flex items-center gap-1.5 text-xs text-[var(--kl-muted)] hover:text-[var(--kl-blue)] transition-colors">
                <Icon name="MessageCircle" size={14} />
                <span>{post.comments}</span>
              </button>
              <button className="flex items-center gap-1.5 text-xs text-[var(--kl-muted)] hover:text-[var(--kl-sand)] transition-colors ml-auto">
                <Icon name="Share2" size={14} />
                <span>Репост</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<"reports" | "registrations">("reports")

  const reports = [
    { title: "Рыбалка на Оке", date: "10 апр 2026", fish: "Судак 3.1 кг" },
    { title: "Утренний выезд, Волга", date: "28 мар 2026", fish: "Щука 4.8 кг" },
    { title: "Ночная рыбалка", date: "15 мар 2026", fish: "Карп 2.5 кг" },
  ]
  const registrations = [
    { title: "Кубок Волги 2026", date: "12–14 апр", status: "Подтверждено" },
    { title: "Чемпионат ЦФО", date: "20 апр", status: "Ожидание" },
  ]

  return (
    <div className="flex flex-col h-full bg-[var(--kl-bg)] text-[var(--kl-text)]">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold tracking-tight mb-4">Профиль</h1>

        {/* Avatar + Info */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #1A5F8C, #2A8FC0)" }}
          >
            А
          </div>
          <div>
            <p className="font-bold text-base">Алексей Рыбников</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Icon name="MapPin" size={12} className="text-[var(--kl-muted)]" />
              <span className="text-xs text-[var(--kl-muted)]">Приволжский ФО</span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white ml-1"
                style={{ background: REGION_COLORS["ПФО"] }}
              >
                ПФО
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-[var(--kl-card)] rounded-2xl p-3 border border-[var(--kl-border)] text-center">
            <p className="text-2xl font-bold text-[var(--kl-blue)]">24</p>
            <p className="text-xs text-[var(--kl-muted)] mt-0.5">Отчётов</p>
          </div>
          <div className="bg-[var(--kl-card)] rounded-2xl p-3 border border-[var(--kl-border)] text-center">
            <p className="text-2xl font-bold text-[var(--kl-blue)]">7</p>
            <p className="text-xs text-[var(--kl-muted)] mt-0.5">Турниров</p>
          </div>
        </div>

        {/* Premium */}
        <button
          className="w-full mt-3 py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 text-[#4A3000]"
          style={{ background: "linear-gradient(90deg, #D9B48B, #E8C99A)" }}
        >
          <Icon name="Crown" size={16} />
          Получить Клёв Премиум
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 mb-3">
        {(["reports", "registrations"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === tab
                ? "bg-[var(--kl-blue)] text-white"
                : "bg-[var(--kl-card)] text-[var(--kl-muted)] border border-[var(--kl-border)]"
            }`}
          >
            {tab === "reports" ? "Мои отчёты" : "Мои регистрации"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-2">
        {activeTab === "reports"
          ? reports.map((r, i) => (
              <div
                key={i}
                className="bg-[var(--kl-card)] rounded-xl p-3 border border-[var(--kl-border)] flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--kl-blue)]/10 flex items-center justify-center flex-shrink-0">
                  <Icon name="FileText" size={16} className="text-[var(--kl-blue)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.title}</p>
                  <p className="text-[11px] text-[var(--kl-muted)]">{r.date} · {r.fish}</p>
                </div>
                <Icon name="ChevronRight" size={14} className="text-[var(--kl-muted)]" />
              </div>
            ))
          : registrations.map((r, i) => (
              <div
                key={i}
                className="bg-[var(--kl-card)] rounded-xl p-3 border border-[var(--kl-border)] flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--kl-sand)]/20 flex items-center justify-center flex-shrink-0">
                  <Icon name="Trophy" size={16} className="text-[var(--kl-sand)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.title}</p>
                  <p className="text-[11px] text-[var(--kl-muted)]">{r.date}</p>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    r.status === "Подтверждено"
                      ? "bg-green-500/15 text-green-600"
                      : "bg-orange-400/15 text-orange-500"
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
      </div>
    </div>
  )
}

// ─── Bottom Navigation ─────────────────────────────────────
function BottomNav({ active, onChange }: { active: string; onChange: (s: string) => void }) {
  const tabs = [
    { id: "news", label: "Лента", icon: "Newspaper" },
    { id: "calendar", label: "Календарь", icon: "CalendarDays" },
    { id: "profile", label: "Профиль", icon: "User" },
  ]
  return (
    <div
      className="flex items-center border-t border-[var(--kl-border)] bg-[var(--kl-card)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all"
        >
          <Icon
            name={t.icon}
            size={22}
            className={active === t.id ? "text-[var(--kl-blue)]" : "text-[var(--kl-muted)]"}
          />
          <span
            className={`text-[10px] font-medium ${
              active === t.id ? "text-[var(--kl-blue)]" : "text-[var(--kl-muted)]"
            }`}
          >
            {t.label}
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── Phone Frame ───────────────────────────────────────────
function PhoneFrame({
  label,
  dark,
  children,
}: {
  label: string
  dark?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-medium text-white/70 tracking-wide uppercase">{label}</p>
      <div
        className={`relative w-[280px] h-[580px] rounded-[44px] overflow-hidden shadow-2xl border-4 ${
          dark ? "border-gray-700" : "border-gray-200"
        }`}
        style={
          {
            "--kl-bg": dark ? "#121826" : "#F5F7FA",
            "--kl-card": dark ? "#1E2A3A" : "#FFFFFF",
            "--kl-text": dark ? "#F0F4FA" : "#1F2A3E",
            "--kl-muted": dark ? "#6B7E99" : "#7A8CA3",
            "--kl-border": dark ? "#2A3A4E" : "#E2E8F0",
            "--kl-blue": "#1A5F8C",
            "--kl-sand": "#D9B48B",
          } as React.CSSProperties
        }
      >
        {/* Status bar */}
        <div
          className="absolute top-0 left-0 right-0 h-11 z-20 flex items-center justify-between px-6 pt-2"
          style={{ background: dark ? "#121826" : "#F5F7FA" }}
        >
          <span className="text-[11px] font-semibold" style={{ color: dark ? "#F0F4FA" : "#1F2A3E" }}>
            9:41
          </span>
          <div className="flex items-center gap-1">
            <Icon name="Signal" size={12} style={{ color: dark ? "#F0F4FA" : "#1F2A3E" } as React.CSSProperties} />
            <Icon name="Wifi" size={12} style={{ color: dark ? "#F0F4FA" : "#1F2A3E" } as React.CSSProperties} />
            <Icon name="Battery" size={12} style={{ color: dark ? "#F0F4FA" : "#1F2A3E" } as React.CSSProperties} />
          </div>
        </div>
        <div className="pt-11 h-full flex flex-col">{children}</div>
      </div>
    </div>
  )
}

// ─── Main Hero ─────────────────────────────────────────────
export default function Hero() {
  const [screen, setScreen] = useState("news")

  const screenMap: Record<string, React.ReactNode> = {
    news: <NewsScreen />,
    calendar: <CalendarScreen />,
    profile: <ProfileScreen />,
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <GodRays
          colorBack="#00000000"
          colors={["#1A5F8C88", "#0E3A5A99", "#2A8FC060", "#D9B48B33"]}
          colorBloom="#1A5F8C"
          offsetX={0.7}
          offsetY={-0.8}
          intensity={0.9}
          spotty={0.4}
          midSize={8}
          midIntensity={0.1}
          density={0.1}
          bloom={0.12}
          speed={0.7}
          scale={1.8}
          style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0 }}
        />
      </div>

      {/* Hero text */}
      <div className="relative z-10 flex flex-col items-center gap-3 text-center px-4 pt-16 pb-12">
        <div className="flex flex-col items-center gap-3 mb-2">
          <img
            src="https://cdn.poehali.dev/projects/9e3df676-4573-415f-a58b-995e884ff7e5/bucket/423c6ded-6868-4e89-a3b4-670373c6795a.jpeg"
            alt="Логотип Клёв"
            className="w-24 h-24 object-contain drop-shadow-2xl rounded-2xl"
          />
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-none tracking-[-0.03em] text-white drop-shadow-lg">
            Клёв
          </h1>
        </div>
        <p className="text-base sm:text-lg text-white/80 max-w-md leading-relaxed">
          Мобильное приложение для рыболовов — соревнования, новости и сообщество в одном месте
        </p>
        <div className="flex flex-wrap gap-2 justify-center mt-1">
          {["Календарь турниров", "Лента рыболовов", "Регионы РФ", "Светлая и тёмная тема"].map((tag) => (
            <span
              key={tag}
              className="text-xs px-3 py-1 rounded-full text-white/90 border border-white/20"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Phone mockups */}
      <div className="relative z-10 flex flex-wrap justify-center gap-8 px-4 pb-16">
        {/* Light */}
        <PhoneFrame label="Светлая тема" dark={false}>
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-hidden">{screenMap[screen]}</div>
            <BottomNav active={screen} onChange={setScreen} />
          </div>
        </PhoneFrame>

        {/* Dark */}
        <PhoneFrame label="Тёмная тема" dark={true}>
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-hidden">{screenMap[screen]}</div>
            <BottomNav active={screen} onChange={setScreen} />
          </div>
        </PhoneFrame>
      </div>

      {/* Screen switcher */}
      <div className="relative z-10 flex gap-3 pb-12">
        {[
          { id: "news", label: "Лента", icon: "Newspaper" },
          { id: "calendar", label: "Календарь", icon: "CalendarDays" },
          { id: "profile", label: "Профиль", icon: "User" },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setScreen(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              screen === s.id
                ? "bg-white text-[#1A5F8C] shadow-lg"
                : "bg-white/15 text-white border border-white/20 hover:bg-white/25"
            }`}
          >
            <Icon name={s.icon} size={14} />
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}