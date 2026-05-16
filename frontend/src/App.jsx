import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Crown,
  Users,
  Shield,
  Upload,
  Gamepad2,
  Video,
  Lock,
  CheckCircle,
  Flame,
  Sword,
  Trophy,
  Star,
  Eye,
  Menu,
  X,
  Search,
  Calendar,
  Monitor,
  IdCard,
  MessageSquare,
  Trash2,
  UserPlus,
  ChevronDown,
  Medal,
} from "lucide-react";
import "./style.css";
import clanVideo1 from "./VID-1.mp4";
import clanVideo2 from "./VID-2.mp4";
import clanVideo3 from "./VID-3.mp4";
import logo from "./RNM.png";

const API = (import.meta.env.VITE_API_URL || "https://ranime-clan-site.onrender.com").replace(/\/+$/, "");
const MAX_CLAN_VIDEOS = 10;
const REQUEST_TIMEOUT_MS = 45000;
const MAX_REQUEST_RETRIES = 5;
const KEEP_ALIVE_INTERVAL_MS = 240000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBackoffMs(attempt) {
  return Math.min(1200 * Math.pow(1.8, attempt), 8500) + Math.floor(Math.random() * 450);
}

function readCachedArray(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCachedArray(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(Array.isArray(value) ? value : []));
  } catch {
    // تجاهل فشل التخزين المحلي
  }
}

async function requestJson(endpoint, options = {}, config = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API}${endpoint}`;
  const method = String(options.method || "GET").toUpperCase();
  const isReadRequest = method === "GET" || method === "HEAD";
  const retries = Number.isFinite(config.retries)
    ? config.retries
    : (isReadRequest ? MAX_REQUEST_RETRIES : 2);

  let lastError = null;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeout || REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        cache: "no-store",
        mode: "cors",
        credentials: "omit",
        ...options,
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          ...(options.headers || {}),
        },
      });

      const text = await res.text();
      let json = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        json = { raw: text };
      }

      if (!res.ok) {
        const retryable = [408, 425, 429, 500, 502, 503, 504].includes(res.status);
        if (retryable && attempt < retries - 1) {
          await sleep(getBackoffMs(attempt));
          continue;
        }
        throw new Error(json.detail || json.message || `HTTP ${res.status}`);
      }

      return json;
    } catch (error) {
      lastError = error;
      const isAbort = error?.name === "AbortError";
      const isNetwork = error instanceof TypeError || isAbort || /network|failed|fetch/i.test(String(error?.message || ""));
      if ((isNetwork || isAbort) && attempt < retries - 1) {
        await sleep(getBackoffMs(attempt));
        continue;
      }
      break;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError || new Error("Request failed");
}

async function fetchJson(endpoint, options = {}) {
  return requestJson(endpoint, options);
}

async function postFormJson(endpoint, formData, options = {}) {
  return requestJson(endpoint, { method: options.method || "POST", body: formData }, { retries: options.retries ?? 2, timeout: options.timeout || 60000 });
}

async function deleteJson(endpoint) {
  return requestJson(endpoint, { method: "DELETE" }, { retries: 3 });
}

function useBackendKeepAlive() {
  const [connectionState, setConnectionState] = useState("checking");

  useEffect(() => {
    let alive = true;
    let timer = null;

    async function ping() {
      try {
        await requestJson("/api/health", { method: "GET" }, { retries: 2, timeout: 18000 });
        if (alive) setConnectionState("online");
      } catch (error) {
        console.warn("Backend keep-alive failed:", error);
        if (alive) setConnectionState("offline");
      } finally {
        if (alive) timer = setTimeout(ping, KEEP_ALIVE_INTERVAL_MS);
      }
    }

    ping();

    const onOnline = () => {
      setConnectionState("checking");
      ping();
    };
    const onOffline = () => setConnectionState("offline");

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return connectionState;
}

function ConnectionBanner({ state }) {
  if (state !== "offline") return null;

  return (
    <div className="connectionBanner">
      الاتصال بالسيرفر ضعيف حالياً، سيتم استخدام آخر بيانات محفوظة وإعادة المحاولة تلقائياً.
    </div>
  );
}

function go(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("popstate"));
}

function scrollToHash(hash) {
  const id = String(hash || "").replace("#", "");
  if (!id) return;

  window.requestAnimationFrame(() => {
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function goHomeSection(hash = "#top") {
  const cleanHash = hash.startsWith("#") ? hash : `#${hash}`;
  go(`/${cleanHash}`);
  setTimeout(() => scrollToHash(cleanHash), 80);
}

function useRoute() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  return path;
}



function videoUrl(src) {
  if (!src) return "";
  return src.startsWith("http") ? src : `${API}${src}`;
}

function fallbackMainVideos() {
  return [
    { id: "fallback-1", title: "تحدي اداء الاعضاء", description: "مسابقة شهريه لافضل اداء داخل الكلان ", src: clanVideo1, label: "VIDEO 1", fallback: true },
    { id: "fallback-2", title: "تحدي اداء الاعضاء", description: "مسابقة شهريه لافضل اداء داخل الكلان ", src: clanVideo2, label: "VIDEO 2", fallback: true },
    { id: "fallback-3", title: "تحدي اداء الاعضاء", description: "مسابقة شهريه لافضل اداء داخل الكلان ", src: clanVideo3, label: "VIDEO 3", fallback: true },
  ];
}

function normalizeAssetUrl(src) {
  if (!src) return "";
  return String(src).startsWith("http") ? src : `${API}${src}`;
}

const PRIZE_MARKER = "__RNM_PRIZE__:";

function splitVideoDescription(rawDescription = "", directPrize = "") {
  const text = String(rawDescription || "");
  const markerIndex = text.lastIndexOf(PRIZE_MARKER);
  const prizeFromColumn = String(directPrize || "").trim();

  if (markerIndex >= 0) {
    return {
      description: text.slice(0, markerIndex).trim(),
      prize: prizeFromColumn || text.slice(markerIndex + PRIZE_MARKER.length).trim(),
    };
  }

  return { description: text.trim(), prize: prizeFromColumn };
}

function cleanVideoDescription(item) {
  return splitVideoDescription(item?.description, item?.prize).description;
}

function getVideoPrize(item) {
  return splitVideoDescription(item?.description, item?.prize).prize;
}

function mapSiteVideoItem(item, index = 0) {
  const parsed = splitVideoDescription(item?.description, item?.prize);
  return {
    id: item.id,
    title: item.title || "فيديو RNM",
    description: parsed.description || "فيديو من إدارة الكلان",
    prize: parsed.prize || "",
    src: videoUrl(item.video_url),
    video_url: item.video_url,
    label: item.slot && item.slot >= 99 ? "DESIGN" : `VIDEO ${item.slot || index + 1}`,
    slot: Number(item.slot || index + 1),
    fallback: false,
  };
}

function useSiteLogo() {
  const [siteLogoUrl, setSiteLogoUrl] = useState(logo);

  useEffect(() => {
    let alive = true;

    async function loadSiteLogo() {
      try {
        const json = await fetchJson("/api/site-settings");
        const nextLogo = normalizeAssetUrl(json.logo_url || json.site_logo_url || "");
        if (alive) setSiteLogoUrl(nextLogo || logo);
      } catch {
        if (alive) setSiteLogoUrl(logo);
      }
    }

    loadSiteLogo();
    const onUpdated = (event) => setSiteLogoUrl(normalizeAssetUrl(event.detail?.logoUrl || "") || logo);
    window.addEventListener("site-logo-updated", onUpdated);

    return () => {
      alive = false;
      window.removeEventListener("site-logo-updated", onUpdated);
    };
  }, []);

  return siteLogoUrl;
}

function BrandAssets({ logoUrl = logo }) {
  useEffect(() => {
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }
    favicon.type = "image/png";
    favicon.href = logoUrl || logo;

    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!appleIcon) {
      appleIcon = document.createElement("link");
      appleIcon.rel = "apple-touch-icon";
      document.head.appendChild(appleIcon);
    }
    appleIcon.href = logoUrl || logo;
  }, [logoUrl]);

  return (
    <style>{`
      @keyframes floatLogo {
        0%, 100% { transform: translateY(0) scale(1); }
        50% { transform: translateY(-12px) scale(1.03); }
      }

      .rnmLogoImg {
        display: block;
        object-fit: contain;
        user-select: none;
        pointer-events: none;
      }

      .brandLogoNav {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        object-fit: cover;
        border: 1px solid rgba(255, 0, 0, 0.35);
        box-shadow: 0 0 25px rgba(255, 0, 0, 0.45), inset 0 0 18px rgba(255, 0, 0, 0.2);
        background: #050505;
      }

      .brandTextStack {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        line-height: 1;
      }

      .heroLogoMain {
        width: min(520px, 92vw);
        max-height: 560px;
        filter: drop-shadow(0 0 35px rgba(255, 0, 0, 0.6));
        animation: floatLogo 4s ease-in-out infinite;
      }


      .heroArt {
        position: relative;
        min-height: 520px;
        display: flex;
        align-items: center;
        justify-content: center;
        isolation: isolate;
      }

      .heroArt::before {
        content: "";
        position: absolute;
        width: min(520px, 78vw);
        height: min(520px, 78vw);
        border-radius: 50%;
        border: 1px solid rgba(255, 0, 0, 0.22);
        background:
          radial-gradient(circle, rgba(255,0,0,0.32), transparent 58%),
          linear-gradient(135deg, rgba(255,0,0,0.16), rgba(0,0,0,0.08));
        box-shadow: 0 0 90px rgba(255,0,0,0.24), inset 0 0 75px rgba(255,0,0,0.16);
        animation: floatLogo 4s ease-in-out infinite;
        z-index: -1;
      }

      .heroOrb {
        width: 190px;
        height: 190px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        color: #ff1515;
        border: 1px solid rgba(255,0,0,0.4);
        background: rgba(5,0,0,0.72);
        box-shadow: 0 0 60px rgba(255,0,0,0.32), inset 0 0 38px rgba(255,0,0,0.18);
        backdrop-filter: blur(10px);
      }

      .heroBlade {
        position: absolute;
        width: 360px;
        height: 4px;
        border-radius: 999px;
        background: linear-gradient(90deg, transparent, rgba(255,0,0,0.95), transparent);
        box-shadow: 0 0 28px rgba(255,0,0,0.75);
      }

      .bladeOne { transform: rotate(35deg); }
      .bladeTwo { transform: rotate(-35deg); }

      .footerLogoImg {
        width: 54px;
        height: 54px;
        border-radius: 16px;
        object-fit: cover;
        border: 1px solid rgba(255,0,0,0.4);
        box-shadow: 0 0 28px rgba(255,0,0,0.45);
        background: #050505;
      }

      .adminLoginLogoImg {
        width: 78px;
        height: 78px;
        border-radius: 50%;
        object-fit: cover;
        display: block;
        filter: drop-shadow(0 0 22px rgba(255, 0, 0, 0.55));
      }

      .adminSideLogoImg {
        width: 96px;
        height: 96px;
        object-fit: contain;
        margin-bottom: 12px;
        filter: drop-shadow(0 0 24px rgba(255, 0, 0, 0.5));
      }

      @media (max-width: 700px) {
        .brandLogoNav { width: 46px; height: 46px; }
        .heroArt { min-height: 360px; }
        .heroOrb { width: 170px; height: 170px; }
        .rnmHeroLetters span { letter-spacing: -6px; }
        .rnmHeroSlash { width: 200px; }
        .heroBlade { width: 260px; }
        .footerLogoImg { width: 46px; height: 46px; border-radius: 14px; }
      }
    `}</style>
  );
}

function Home() {
  const siteLogoUrl = useSiteLogo();

  useEffect(() => {
    if (window.location.hash) {
      setTimeout(() => scrollToHash(window.location.hash), 120);
    }
  }, []);

  const [form, setForm] = useState({
    player_name: "",
    pubg_id: "",
    discord: "",
    device: "",
    fps: "",
    role: "",
    description: "",
  });

  const [video, setVideo] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();

    if (!video) {
      setMessage("ارفع فيديو أدائك أولاً");
      return;
    }

    if (!profileImage) {
      setMessage("ارفع صورة حسابك في ببجي أولاً");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append("video", video);
    data.append("profile_image", profileImage);

    setLoading(true);
    setMessage("جاري رفع الطلب...");

    try {
      const json = await postFormJson("/api/apply", data, { timeout: 90000 });
      setMessage(json.message || "تم إرسال الطلب بنجاح");

      if (json.success) {
        setForm({
          player_name: "",
          pubg_id: "",
          discord: "",
          device: "",
          fps: "",
          role: "",
          description: "",
        });
        setVideo(null);
        setProfileImage(null);
      }
    } catch {
      setMessage("حدث خطأ أثناء الرفع");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <BrandAssets logoUrl={siteLogoUrl} />
      <Navbar logoUrl={siteLogoUrl} />
      <Hero logoUrl={siteLogoUrl} />
      <ClanInfo />
      <Identity />
      <Videos />
      <VideoRequestSection />
      <ApplySection
        form={form}
        setForm={setForm}
        video={video}
        setVideo={setVideo}
        profileImage={profileImage}
        setProfileImage={setProfileImage}
        submit={submit}
        message={message}
        loading={loading}
      />
      <Footer logoUrl={siteLogoUrl} />
    </>
  );
}

function Navbar({ logoUrl = logo }) {
  const [open, setOpen] = useState(false);

  const links = [
    ["الرئيسية", "#top"],
    ["الكلان", "#clan"],
    ["أعضاء الكلان", "/members"],
    ["الفيديوهات", "#videos"],
    ["المسابقات", "#designs"],
    ["التقديم", "#apply"],
  ];

  function handleNav(href) {
    setOpen(false);

    if (href.startsWith("#")) {
      goHomeSection(href);
      return;
    }

    go(href);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 60);
  }

  return (
    <nav className="nav">
      <button className="brand" onClick={() => goHomeSection("#top")}>
        <img className="brandLogoNav" src={logoUrl || logo} alt="RNM ESPORTS" />
        <span className="brandTextStack">
          <span>RNM</span>
          <small>ESPORTS</small>
        </span>
      </button>

      <div className={`navLinks ${open ? "show" : ""}`}>
        {links.map(([label, href]) => (
          <button key={label} type="button" onClick={() => handleNav(href)}>
            {label}
          </button>
        ))}
      </div>

      <button className="menuBtn" onClick={() => setOpen(!open)}>
        {open ? <X /> : <Menu />}
      </button>
    </nav>
  );
}

function Hero({ logoUrl = logo }) {
  return (
    <section className="hero" id="top">
      <div className="heroGrid" />
      <div className="redSmoke one" />
      <div className="redSmoke two" />

      <div className="heroContent">
        <div className="heroBadge">
          <Crown size={22} />
          RANIME GAMING ESPORTS
        </div>

        <h1>
          RANIME
          <span>ESPORTS</span>
        </h1>

        <p>
          لسنا مجرد فريق، نحن عائلة تصنع الهيبة داخل ساحة PUBG.  
          قوة، ولاء، احترام، وتنظيم تحت راية واحدة.
        </p>

        <div className="heroStats">
          <div>
            <strong>60+</strong>
            <span>عضو</span>
          </div>
          <div>
            <strong>RNM</strong>
            <span>هوية</span>
          </div>
          <div>
            <strong>ONE</strong>
            <span>HEART</span>
          </div>
        </div>

        <div className="heroBtns">
          <a href="#apply" className="mainBtn">قدّم للكلان</a>
          <a href="#videos" className="ghostBtn">شاهد قوتنا</a>
        </div>
      </div>

      <div className="heroArt" aria-hidden="true">
        <div className="heroBlade bladeOne" />
        <div className="heroBlade bladeTwo" />
        <div className="heroOrb heroLogoOrb">
          <img className="heroOrbLogoImg" src={logoUrl || logo} alt="RNM ESPORTS" />
        </div>
      </div>
    </section>
  );
}

function ClanInfo() {
  const cards = [
    {
      icon: <Users />,
      title: "عائلة واحدة",
      text: "كل عضو داخل RNM جزء من كيان واحد، ننتصر معاً ونتطور معاً.",
    },
    {
      icon: <Shield />,
      title: "تنظيم وهيبة",
      text: "نظام واضح، إدارة قوية، واحترام يجعل اسم الكلان ثابتاً بين الجميع.",
    },
    {
      icon: <Sword />,
      title: "قوة داخل اللعب",
      text: "نبحث عن لاعبين يملكون أداء، ذكاء، هدوء، وروح فريق.",
    },
  ];

  return (
    <section className="section" id="clan">
      <div className="sectionHead">
        <span>CLAN PERSONALITY</span>
        <h2>شخصية الكلان</h2>
        <p>
          RNM ليس مجرد كلان قتالي، بل كيان يمتلك حضوراً وهيبة.  
          يجمع بين القوة، الهدوء، القيادة، والتنظيم.
        </p>
      </div>

      <div className="cards">
        {cards.map((c, i) => (
          <div className="luxCard" key={i}>
            <div className="cardNumber">0{i + 1}</div>
            <div className="iconBox">{c.icon}</div>
            <h3>{c.title}</h3>
            <p>{c.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Identity() {
  const values = [
    ["الاحترام", "Respect"],
    ["الولاء", "Loyalty"],
    ["التعاون", "Teamwork"],
    ["الانضباط", "Discipline"],
  ];

  return (
    <section className="identity">
      <div className="identityPanel">
        <div>
          <Flame className="bigIcon" />
          <h2>الشعار الرسمي</h2>
          <p>
            لسنا مجرد فريق… نحن اسم يصنع بالولاء والقوة.
          </p>
        </div>

        <div className="valuesGrid">
          {values.map(([ar, en]) => (
            <div className="value" key={ar}>
              <Star />
              <b>{ar}</b>
              <span>{en}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Videos() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videos, setVideos] = useState(
    fallbackMainVideos().map((item, index) => ({
      ...item,
      slot: index + 1,
      label: `المركز ${index + 1}`,
    }))
  );
  const [designs, setDesigns] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadSiteVideos() {
      try {
        const cachedSiteVideos = readCachedArray("rnm_cache_site_videos");
        const json = await fetchJson("/api/site-videos");

        if (!alive) return;
        writeCachedArray("rnm_cache_site_videos", Array.isArray(json) ? json : []);

        const mapped = (Array.isArray(json) ? json : []).map(mapSiteVideoItem);

        const sortedMapped = mapped.sort((a, b) => (a.slot || 1) - (b.slot || 1) || String(a.id).localeCompare(String(b.id)));
        const monthlyWinners = sortedMapped
          .filter((v) => [1, 2, 3].includes(Number(v.slot || 0)))
          .slice(0, 3)
          .map((v) => ({ ...v, label: `المركز ${v.slot}` }));
        const designVideos = sortedMapped.filter((v) => Number(v.slot || 1) >= 99);
        const fallbackWinners = fallbackMainVideos().map((item, index) => ({
          ...item,
          slot: index + 1,
          label: `المركز ${index + 1}`,
        }));

        setVideos(monthlyWinners.length ? monthlyWinners : fallbackWinners);
        setDesigns(designVideos);
        setUsingFallback(!monthlyWinners.length);
      } catch {
        if (!alive) return;
        const cachedSiteVideos = readCachedArray("rnm_cache_site_videos");
        if (cachedSiteVideos.length) {
          const mapped = cachedSiteVideos.map(mapSiteVideoItem);
          const sortedMapped = mapped.sort((a, b) => (a.slot || 1) - (b.slot || 1) || String(a.id).localeCompare(String(b.id)));
          setVideos(sortedMapped.filter((v) => [1, 2, 3].includes(Number(v.slot || 0))).slice(0, 3));
          setDesigns(sortedMapped.filter((v) => Number(v.slot || 1) >= 99));
          setUsingFallback(false);
          return;
        }
        setVideos(
          fallbackMainVideos().map((item, index) => ({
            ...item,
            slot: index + 1,
            label: `المركز ${index + 1}`,
          }))
        );
        setDesigns([]);
        setUsingFallback(true);
      }
    }

    loadSiteVideos();
    return () => {
      alive = false;
    };
  }, []);

  const podiumVideos = useMemo(() => {
    const bySlot = new Map(videos.map((item, index) => [Number(item.slot || index + 1), item]));
    return [2, 1, 3]
      .map((position) => bySlot.get(position) || videos[position - 1])
      .filter(Boolean);
  }, [videos]);

  function renderVideoCard(item, index) {
    return (
      <div className="mediaCard" key={`${item.id}-${index}`}>
        <div className="mediaVideoWrap">
          <video
            src={item.src}
            muted
            playsInline
            preload="metadata"
            onError={(e) => {
              if (!item.fallback) {
                e.currentTarget.src = fallbackMainVideos()[index % 3].src;
              }
            }}
          />

          <button className="mediaPlayLayer" onClick={() => setSelectedVideo(item)}>
            <span>
              <Video size={42} color="#fff" />
            </span>
          </button>

          <div className="mediaLabel">{item.label}</div>
        </div>

        <div className="mediaInfo">
          <h3>{item.title}</h3>
          <p>{item.description || "فيديو يوضح أداء وإبداع أعضاء الكلان."}</p>
        </div>
      </div>
    );
  }

  function renderPodiumCard(item, index) {
    const position = Number(item.slot || index + 1);
    const rankText = position === 1 ? "المركز الأول" : position === 2 ? "المركز الثاني" : "المركز الثالث";

    return (
      <div className={`winnerPodiumCard rank-${position}`} key={`winner-${item.id}-${position}`}>
        <div className="winnerVideoShell">
          <video
            src={item.src}
            muted
            playsInline
            preload="metadata"
            onError={(e) => {
              if (!item.fallback) {
                e.currentTarget.src = fallbackMainVideos()[(position - 1 + 3) % 3].src;
              }
            }}
          />

          <button className="winnerPlayLayer" onClick={() => setSelectedVideo(item)}>
            <span>
              <Video size={34} />
            </span>
          </button>

          <div className="winnerRankBadge">#{position}</div>
          {position === 1 && (
            <div className="winnerCrownBadge">
              <Crown size={24} />
            </div>
          )}
        </div>

        <div className="winnerInfo">
          <span>{rankText}</span>
          <h3>{item.title}</h3>
          <p>{item.description || "أفضل أداء تم اختياره من إدارة الكلان لهذا الشهر."}</p>
          {item.prize && (
            <div className="winnerPrizeBadge">
              <Trophy size={18} />
              <span>الجائزة</span>
              <b>{item.prize}</b>
            </div>
          )}
        </div>

        <div className="podiumBase">
          <div className="podiumNumber">{position}</div>
          <div className="podiumGlow" />
          <b>{rankText}</b>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="section monthlyWinnersSection" id="videos">
        <div className="sectionHead">
          <span>CLAN MEDIA</span>
          <h2>مسابقه شهريه لافضل اداء داخل الكلان</h2>
          <p>
           هنا يتم اختيار افضل اداء لكل شهر بنائا على قرار الاداره
          </p>
          {usingFallback && (
            <div className="fallbackNotice">
              يتم عرض الفيديوهات الاحتياطية حالياً.
            </div>
          )}
        </div>

        <div className="winnerPodiumStage">
          <div className="podiumBackGlow" />
          <div className="podiumHeaderMini">
            <Trophy size={24} />
            <span>أفضل 3 أداءات لهذا الشهر</span>
          </div>
          <div className="winnerPodiumGrid">
            {podiumVideos.map(renderPodiumCard)}
          </div>
        </div>
      </section>

      <section className="section" id="designs">
        <div className="sectionHead">
          <span>RNM DESIGNS</span>
          <h2>قسم المسابقات</h2>
          <p>
            الفيديوهات المقبولة من الإدارة تظهر هنا كتصاميم وإبداعات خاصة بالكلان.
          </p>
        </div>

        {designs.length ? (
          <div className={`mediaGrid compactMediaGrid clanVideosGrid count-${Math.min(designs.length, MAX_CLAN_VIDEOS)}`}>
            {designs.map(renderVideoCard)}
          </div>
        ) : (
          <div className="emptyState">لا توجد تصاميم منشورة حالياً.</div>
        )}
      </section>

      {selectedVideo && (
        <div className="videoModal" onClick={() => setSelectedVideo(null)}>
          <div className="videoModalBox" onClick={(e) => e.stopPropagation()}>
            <button className="modalCloseBtn" onClick={() => setSelectedVideo(null)}>
              ✕
            </button>

            <video src={selectedVideo.src} controls autoPlay />
          </div>
        </div>
      )}
    </>
  );
}

function VideoRequestSection() {
  const [form, setForm] = useState({
    visitor_name: "",
    contact: "",
    title: "",
    description: "",
  });
  const [videoFile, setVideoFile] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submitVideoRequest(e) {
    e.preventDefault();
    const formElement = e.currentTarget;

    if (!videoFile) {
      setMessage("اختر فيديو التصميم أولاً");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.append("video", videoFile);

    setSending(true);
    setMessage("جاري إرسال الفيديو للإدارة...");

    try {
      const json = await postFormJson("/api/video-requests", data, { timeout: 120000 });

      if (json.success === false) {
        setMessage(json.message || json.detail || "فشل إرسال الفيديو");
        return;
      }

      setMessage(json.message || "تم إرسال طلب الفيديو للإدارة بنجاح");
      setForm({ visitor_name: "", contact: "", title: "", description: "" });
      setVideoFile(null);
      if (formElement && typeof formElement.reset === "function") {
        formElement.reset();
      }
    } catch (error) {
      console.error("Video request submit error:", error);
      setMessage("تعذر الاتصال بالخادم، حاول مرة أخرى");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="section requestVideoSection" id="request-video">
      <div className="sectionHead">
        <span>SUBMIT DESIGN</span>
        <h2>ارفع تصميمك للإدارة</h2>
        <p>
          الزائر يقدر يرفع فيديو تصميم أو لقطة، وبعد قبول الإدارة يظهر في قسم التصاميم.
        </p>
      </div>

      <form className="form requestVideoForm" onSubmit={submitVideoRequest}>
        <div className="inputGroup">
          <input name="visitor_name" placeholder="اسمك" value={form.visitor_name} onChange={update} required />
        </div>

        <div className="inputGroup">
          <input name="contact" placeholder="وسيلة تواصل Discord / Instagram" value={form.contact} onChange={update} />
        </div>

        <div className="inputGroup">
          <input name="title" placeholder="عنوان الفيديو أو التصميم" value={form.title} onChange={update} required />
        </div>

        <textarea
          name="description"
          placeholder="وصف بسيط عن الفيديو"
          value={form.description}
          onChange={update}
        />

        <label className="uploadBox">
          <Upload />
          <b>{videoFile ? videoFile.name : "ارفع فيديو التصميم"}</b>
          <span>بعد القبول يظهر في قسم التصاميم</span>
          <input type="file" accept="video/*" hidden onChange={(e) => setVideoFile(e.target.files[0])} />
        </label>

        <button className="mainBtn submitBtn" type="submit" disabled={sending}>
          {sending ? "جاري الإرسال..." : "إرسال الفيديو للإدارة"}
        </button>

        {message && (
          <div className="successMsg">
            <CheckCircle size={20} />
            {message}
          </div>
        )}
      </form>
    </section>
  );
}

function ApplySection({ form, setForm, video, setVideo, profileImage, setProfileImage, submit, message, loading }) {
  function update(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <section className="section applySection" id="apply">
      <div className="sectionHead">
        <span>JOIN RNM</span>
        <h2>التقديم للكلان</h2>
        <p>
          ارفع فيديو أدائك، وضع بياناتك، وسيتم مراجعة طلبك من الإدارة.
        </p>
      </div>

      <div className="applyLayout">
        <div className="rulesPanel">
          <Crown />
          <h3>شروط القبول</h3>
          <ul>
            <li>احترام الإدارة وجميع الأعضاء.</li>
            <li>امتلاك أداء جيد في PUBG Mobile.</li>
            <li>رفع فيديو واضح يثبت مستواك.</li>
            <li>الالتزام بروح الفريق وعدم التخريب.</li>
            <li>التفاعل مع تدريبات وسكريمات الكلان.</li>
          </ul>
        </div>

        <form className="form" onSubmit={submit}>
          <div className="inputGroup">
            <input name="player_name" placeholder="اسم اللاعب" value={form.player_name} onChange={update} required />
          </div>

          <div className="inputGroup">
            <input name="pubg_id" placeholder="ID ببجي" value={form.pubg_id} onChange={update} required />
          </div>

          <div className="inputGroup">
            <input name="discord" placeholder="ديسكورد" value={form.discord} onChange={update} />
          </div>

          <div className="inputGroup">
            <input name="device" placeholder="الجهاز" value={form.device} onChange={update} />
          </div>

          <div className="inputGroup">
            <input name="fps" placeholder="الفريمات 60 / 90 / 120" value={form.fps} onChange={update} />
          </div>

          <div className="inputGroup">
            <input name="role" placeholder="الدور IGL / Assaulter / Supporter" value={form.role} onChange={update} />
          </div>

          <textarea
            name="description"
            placeholder="اكتب وصف بسيط عنك وعن مستواك"
            value={form.description}
            onChange={update}
          />

          <label className="uploadBox">
            <Upload />
            <b>{video ? video.name : "ارفع فيديو الأداء"}</b>
            <span>MP4 / WEBM / MOV</span>
            <input type="file" accept="video/*" hidden onChange={(e) => setVideo(e.target.files[0])} />
          </label>

          <label className="uploadBox profileUploadBox">
            <UserPlus />
            <b>{profileImage ? profileImage.name : "ارفع صورة حسابك في ببجي"}</b>
            <span>PNG / JPG / WEBP — تظهر في صفحة أعضاء الكلان بعد القبول</span>
            <input type="file" accept="image/*" hidden onChange={(e) => setProfileImage(e.target.files[0])} />
          </label>

          <button className="mainBtn submitBtn" type="submit" disabled={loading}>
            {loading ? "جاري الإرسال..." : "إرسال التقديم"}
          </button>

          {message && (
            <div className="successMsg">
              <CheckCircle size={20} />
              {message}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

function Admin() {
  const siteLogoUrl = useSiteLogo();
  const [apps, setApps] = useState([]);
  const [siteVideos, setSiteVideos] = useState([]);
  const [videoRequests, setVideoRequests] = useState([]);
  const [clanMembers, setClanMembers] = useState([]);
  const [password, setPassword] = useState("");
  const [allowed, setAllowed] = useState(false);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [videoForm, setVideoForm] = useState({
    id: null,
    title: "",
    description: "",
    slot: 1,
    file: null,
  });
  const [savingVideo, setSavingVideo] = useState(false);
  const [memberRanks, setMemberRanks] = useState({});
  const [adminTab, setAdminTab] = useState("applications");
  const [membersImportFile, setMembersImportFile] = useState(null);
  const [importingMembers, setImportingMembers] = useState(false);
  const [membersImportMessage, setMembersImportMessage] = useState("");
  const [manualMemberForm, setManualMemberForm] = useState({
    player_name: "",
    clan_rank: "member",
  });
  const [manualMemberImage, setManualMemberImage] = useState(null);
  const [manualMemberMessage, setManualMemberMessage] = useState("");
  const [savingManualMember, setSavingManualMember] = useState(false);
  const [memberImageFiles, setMemberImageFiles] = useState({});
  const [savingMemberImageId, setSavingMemberImageId] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoMessage, setLogoMessage] = useState("");
  const [savingLogo, setSavingLogo] = useState(false);
  const [adminApiStatus, setAdminApiStatus] = useState("");
  const [winnerModal, setWinnerModal] = useState({
    open: false,
    video: null,
    position: "1",
    prize: "",
    saving: false,
    message: "",
  });

  useEffect(() => {
    if (!allowed) return;

    let stopped = false;
    loadAdminData();

    const interval = setInterval(() => {
      if (!stopped) loadAdminData();
    }, 60000);

    const onFocus = () => loadAdminData();
    const onOnline = () => loadAdminData();
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onOnline);

    return () => {
      stopped = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onOnline);
    };
  }, [allowed]);

  async function loadCachedAdminArray(cacheKey, endpoint, setter, label) {
    const cached = readCachedArray(cacheKey);
    if (cached.length) setter(cached);

    try {
      const json = await fetchJson(endpoint);
      const list = Array.isArray(json) ? json : [];
      setter(list);
      writeCachedArray(cacheKey, list);
      return true;
    } catch (error) {
      console.error(`${label} load failed:`, error);
      setAdminApiStatus(
        `تعذر جلب ${label} من السيرفر. سيتم عرض آخر بيانات محفوظة وإعادة المحاولة تلقائياً.`
      );
      return false;
    }
  }

  async function loadAdminData() {
    setAdminApiStatus("جاري الاتصال بالسيرفر...");
    const results = await Promise.allSettled([
      loadApps(),
      loadSiteVideos(),
      loadVideoRequests(),
      loadClanMembers(),
    ]);

    const hasFail = results.some((item) => item.status === "rejected" || item.value === false);
    if (!hasFail) setAdminApiStatus("");
  }

  async function loadApps() {
    return loadCachedAdminArray("rnm_cache_applications", "/api/applications", setApps, "طلبات التقديم");
  }

  async function loadSiteVideos() {
    return loadCachedAdminArray("rnm_cache_site_videos", "/api/site-videos", setSiteVideos, "فيديوهات الموقع");
  }

  async function loadVideoRequests() {
    return loadCachedAdminArray("rnm_cache_video_requests", "/api/video-requests", setVideoRequests, "طلبات التصاميم");
  }

  async function loadClanMembers() {
    return loadCachedAdminArray("rnm_cache_clan_members", "/api/clan-members", setClanMembers, "أعضاء الكلان");
  }

  async function addManualClanMember(e) {
    e.preventDefault();

    const name = manualMemberForm.player_name.trim();
    if (!name) {
      setManualMemberMessage("اكتب اسم العضو أولاً");
      return;
    }

    const data = new FormData();
    data.append("player_name", name);
    data.append("clan_rank", manualMemberForm.clan_rank || "member");
    if (manualMemberImage) data.append("profile_image", manualMemberImage);

    setSavingManualMember(true);
    setManualMemberMessage("جاري إضافة العضو...");

    try {
      const json = await postFormJson("/api/clan-members", data, { timeout: 90000 });

      if (json.success === false) {
        setManualMemberMessage(json.message || json.detail || "فشل إضافة العضو");
        return;
      }

      setManualMemberMessage(json.message || "تم إضافة العضو بنجاح");
      setManualMemberForm({ player_name: "", clan_rank: "member" });
      setManualMemberImage(null);
      await loadClanMembers();
    } catch {
      setManualMemberMessage("حدث خطأ أثناء إضافة العضو");
    } finally {
      setSavingManualMember(false);
    }
  }

  async function saveSiteLogo(e) {
    e.preventDefault();

    if (!logoFile) {
      setLogoMessage("اختر صورة اللوجو أولاً");
      return;
    }

    const data = new FormData();
    data.append("logo", logoFile);

    setSavingLogo(true);
    setLogoMessage("جاري تغيير اللوجو...");

    try {
      const json = await postFormJson("/api/site-logo", data, { timeout: 90000 });
      if (json.success === false) {
        setLogoMessage(json.message || json.detail || "فشل تغيير اللوجو");
        return;
      }

      const nextLogo = normalizeAssetUrl(json.logo_url || "");
      if (nextLogo) window.dispatchEvent(new CustomEvent("site-logo-updated", { detail: { logoUrl: nextLogo } }));
      setLogoMessage(json.message || "تم تغيير لوجو الموقع بنجاح");
      setLogoFile(null);
    } catch {
      setLogoMessage("حدث خطأ أثناء تغيير اللوجو");
    } finally {
      setSavingLogo(false);
    }
  }

  async function importClanMembers(e) {
    e.preventDefault();

    if (!membersImportFile) {
      setMembersImportMessage("اختر ملف Excel أو CSV أولاً");
      return;
    }

    const data = new FormData();
    data.append("file", membersImportFile);

    setImportingMembers(true);
    setMembersImportMessage("جاري استيراد أعضاء الكلان...");

    try {
      const json = await postFormJson("/api/clan-members/import", data, { timeout: 90000 });
      if (json.success === false) {
        setMembersImportMessage(json.message || json.detail || "فشل استيراد الأعضاء");
        return;
      }

      setMembersImportMessage(json.message || `تم استيراد ${json.imported || 0} عضو بنجاح`);
      setMembersImportFile(null);
      await loadClanMembers();
    } catch {
      setMembersImportMessage("حدث خطأ أثناء استيراد الملف");
    } finally {
      setImportingMembers(false);
    }
  }

  async function approveApplication(id) {
    const rank = memberRanks[id] || "member";
    const data = new FormData();
    data.append("clan_rank", rank);

    try {
      const json = await postFormJson(`/api/applications/${id}/approve`, data, { timeout: 90000 });
      if (json.success === false) {
        alert(json.message || json.detail || "فشل قبول اللاعب");
        return;
      }
      await Promise.all([loadApps(), loadClanMembers()]);
      alert(json.message || "تم قبول اللاعب");
    } catch {
      alert("حدث خطأ أثناء قبول اللاعب");
    }
  }

  async function updateClanMemberRank(id, rank) {
    const data = new FormData();
    data.append("clan_rank", rank);
    try {
      const json = await postFormJson(`/api/clan-members/${id}`, data, { method: "PUT", timeout: 90000 });
      if (json.success === false) {
        alert(json.message || json.detail || "فشل تحديث العضو");
        return;
      }
      await loadClanMembers();
    } catch {
      alert("حدث خطأ أثناء تحديث العضو");
    }
  }

  async function updateClanMemberName(member, nextName) {
    const cleanName = String(nextName || "").trim();
    if (!cleanName) {
      alert("اكتب اسم العضو أولاً");
      return false;
    }

    const data = new FormData();
    data.append("player_name", cleanName);
    data.append("clan_rank", member.clan_rank || "member");

    try {
      const json = await postFormJson(`/api/clan-members/${member.id}`, data, { method: "PUT", timeout: 90000 });
      if (json.success === false) {
        alert(json.message || json.detail || "فشل تحديث اسم العضو");
        return false;
      }
      await loadClanMembers();
      return true;
    } catch {
      alert("حدث خطأ أثناء تحديث اسم العضو");
      return false;
    }
  }

  async function updateClanMemberImage(member) {
    const file = memberImageFiles[member.id];
    if (!file) {
      alert("اختر صورة العضو أولاً");
      return;
    }

    const data = new FormData();
    data.append("clan_rank", member.clan_rank || "member");
    data.append("profile_image", file);

    setSavingMemberImageId(member.id);
    try {
      const json = await postFormJson(`/api/clan-members/${member.id}`, data, { method: "PUT", timeout: 90000 });
      if (json.success === false) {
        alert(json.message || json.detail || "فشل تحديث صورة العضو");
        return;
      }
      setMemberImageFiles((prev) => {
        const next = { ...prev };
        delete next[member.id];
        return next;
      });
      await loadClanMembers();
    } catch {
      alert("حدث خطأ أثناء تحديث صورة العضو");
    } finally {
      setSavingMemberImageId(null);
    }
  }

  async function removeClanMember(id) {
    const ok = window.confirm("هل تريد إزالة هذا العضو من هرم الكلان؟");
    if (!ok) return;
    try {
      const json = await deleteJson(`/api/clan-members/${id}`);
      if (json.success === false) {
        alert(json.message || json.detail || "فشل إزالة العضو");
        return;
      }
      setClanMembers((prev) => prev.filter((m) => m.id !== id));
    } catch {
      alert("حدث خطأ أثناء إزالة العضو");
    }
  }

  async function deleteApplication(id, playerName) {
    const ok = window.confirm(`هل تريد حذف طلب ${playerName || "هذا اللاعب"} نهائياً؟`);
    if (!ok) return;

    setDeletingId(id);

    try {
      const json = await deleteJson(`/api/applications/${id}`);

      if (json.success === false) {
        alert(json.message || json.detail || "فشل حذف الطلب");
        return;
      }

      setApps((prev) => prev.filter((item) => item.id !== id));
    } catch {
      alert("حدث خطأ أثناء حذف الطلب");
    } finally {
      setDeletingId(null);
    }
  }

  async function saveSiteVideo(e) {
    e.preventDefault();

    if (!videoForm.id && !videoForm.file) {
      alert("اختر ملف فيديو أولاً");
      return;
    }

    const data = new FormData();
    data.append("title", videoForm.title || "فيديو RNM");
    data.append("description", videoForm.description || "");
    data.append("slot", String(videoForm.slot || 1));
    if (videoForm.file) data.append("video", videoForm.file);

    setSavingVideo(true);

    try {
      const url = videoForm.id
        ? `${API}/api/site-videos/${videoForm.id}`
        : `${API}/api/site-videos`;

      const json = await postFormJson(videoForm.id ? `/api/site-videos/${videoForm.id}` : "/api/site-videos", data, { method: videoForm.id ? "PUT" : "POST", timeout: 120000 });

      if (json.success === false) {
        alert(json.message || json.detail || "فشل حفظ الفيديو");
        return;
      }

      setVideoForm({ id: null, title: "", description: "", slot: 1, file: null });
      await loadSiteVideos();
      alert(json.message || "تم حفظ الفيديو");
    } catch {
      alert("حدث خطأ أثناء حفظ الفيديو");
    } finally {
      setSavingVideo(false);
    }
  }

  function editSiteVideo(item) {
    setAdminTab("videos");
    setVideoForm({
      id: item.id,
      title: item.title || "",
      description: cleanVideoDescription(item) || "",
      slot: item.slot || 1,
      file: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteSiteVideo(id) {
    const ok = window.confirm("هل تريد حذف هذا الفيديو من الموقع؟");
    if (!ok) return;

    try {
      const json = await deleteJson(`/api/site-videos/${id}`);

      if (json.success === false) {
        alert(json.message || json.detail || "فشل حذف الفيديو");
        return;
      }

      setSiteVideos((prev) => prev.filter((item) => item.id !== id));
    } catch {
      alert("حدث خطأ أثناء حذف الفيديو");
    }
  }

  function moveToMonthlyWinner(videoItem) {
    setWinnerModal({
      open: true,
      video: videoItem,
      position: String([1, 2, 3].includes(Number(videoItem.slot)) ? videoItem.slot : 1),
      prize: getVideoPrize(videoItem) || "",
      saving: false,
      message: "",
    });
  }

  async function confirmMonthlyWinner(e) {
    e.preventDefault();

    const videoItem = winnerModal.video;
    const position = Number(winnerModal.position);
    const prize = String(winnerModal.prize || "").trim();

    if (!videoItem) return;

    if (![1, 2, 3].includes(position)) {
      setWinnerModal((prev) => ({ ...prev, message: "المركز يجب أن يكون الأول أو الثاني أو الثالث فقط" }));
      return;
    }

    if (!prize) {
      setWinnerModal((prev) => ({ ...prev, message: "اكتب جائزة الفائز أولاً" }));
      return;
    }

    const data = new FormData();
    data.append("title", videoItem.title || "فيديو فائز");
    data.append("description", cleanVideoDescription(videoItem) || "");
    data.append("slot", String(position));
    data.append("prize", prize);

    setWinnerModal((prev) => ({ ...prev, saving: true, message: "جاري اعتماد الفائز..." }));

    try {
      const json = await postFormJson(`/api/site-videos/${videoItem.id}`, data, { method: "PUT", timeout: 90000 });

      if (json.success === false) {
        setWinnerModal((prev) => ({ ...prev, saving: false, message: json.message || json.detail || "فشل تحويل الفيديو للمسابقة الشهرية" }));
        return;
      }

      await loadSiteVideos();
      setWinnerModal({ open: false, video: null, position: "1", prize: "", saving: false, message: "" });
    } catch {
      setWinnerModal((prev) => ({ ...prev, saving: false, message: "حدث خطأ أثناء تحويل الفيديو" }));
    }
  }

  async function reviewVideoRequest(id, action) {
    const ok = window.confirm(action === "approve" ? "قبول الفيديو ونشره؟" : "رفض الفيديو؟");
    if (!ok) return;

    try {
      const json = await requestJson(`/api/video-requests/${id}/${action}`, { method: "POST" }, { retries: 3, timeout: 90000 });

      if (json.success === false) {
        alert(json.message || json.detail || "فشل تنفيذ العملية");
        return;
      }

      await Promise.all([loadVideoRequests(), loadSiteVideos()]);
      alert(json.message || "تم تنفيذ العملية");
    } catch {
      alert("حدث خطأ أثناء مراجعة الفيديو");
    }
  }

  async function deleteVideoRequest(id, status) {
    const ok = window.confirm(
      status === "approved"
        ? "حذف الطلب من قائمة المراجعة فقط؟ التصميم المنشور يبقى موجوداً في قسم التصاميم ويمكن حذفه من إدارة الفيديوهات."
        : "هل تريد حذف طلب التصميم نهائياً؟"
    );
    if (!ok) return;

    try {
      const json = await deleteJson(`/api/video-requests/${id}`);

      if (json.success === false) {
        alert(json.message || json.detail || "فشل حذف الطلب");
        return;
      }

      setVideoRequests((prev) => prev.filter((item) => item.id !== id));
      alert(json.message || "تم حذف الطلب");
    } catch {
      alert("حدث خطأ أثناء حذف طلب التصميم");
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return apps;
    return apps.filter((a) =>
      `${a.player_name} ${a.pubg_id} ${a.discord} ${a.device} ${a.fps} ${a.role}`
        .toLowerCase()
        .includes(q)
    );
  }, [apps, search]);

  if (!allowed) {
    return (
      <>
      <BrandAssets logoUrl={siteLogoUrl} />
      <main className="adminPage">
        <div className="adminLogin">
          <div className="adminLogo">
            <img className="rnmLogoImg adminLoginLogoImg" src={siteLogoUrl || logo} alt="RNM ADMIN" />
          </div>
          <h1>لوحة إدارة RNM</h1>
          <p>الدخول مخصص للإدارة فقط لمراجعة طلبات الانضمام وإدارة فيديوهات الموقع.</p>

          <input
            type="password"
            placeholder="كلمة مرور الإدارة"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            className="mainBtn"
            onClick={() => {
              if (password === "admin123") setAllowed(true);
              else alert("كلمة المرور خطأ");
            }}
          >
            دخول الإدارة
          </button>

          <button className="ghostBtn" onClick={() => go("/")}>
            رجوع للموقع
          </button>
        </div>
      </main>
      </>
    );
  }

  return (
    <>
    <BrandAssets logoUrl={siteLogoUrl} />
    <main className="adminDashboard">
      <aside className="adminSide">
        <div className="sideBrand">
          <img className="rnmLogoImg adminSideLogoImg" src={siteLogoUrl || logo} alt="RNM ADMIN" />
          <h2>RNM</h2>
          <span>ADMIN PANEL</span>
        </div>

        <button className={adminTab === "applications" ? "active" : ""} onClick={() => setAdminTab("applications")}>طلبات التقديم</button>
        <button className={adminTab === "members" ? "active" : ""} onClick={() => setAdminTab("members")}>التحكم بأعضاء الكلان</button>
        <button className={adminTab === "videos" ? "active" : ""} onClick={() => setAdminTab("videos")}>إدارة فيديوهات الموقع</button>
        <button className={adminTab === "competitionVideos" ? "active" : ""} onClick={() => setAdminTab("competitionVideos")}>فيديوهات المسابقات</button>
        <button className={adminTab === "requests" ? "active" : ""} onClick={() => setAdminTab("requests")}>طلبات التصاميم</button>
        <button className={adminTab === "branding" ? "active" : ""} onClick={() => setAdminTab("branding")}>لوجو الموقع</button>
        <button className="softAdminBtn" onClick={loadAdminData}>تحديث الكل</button>
        <button className="softAdminBtn" onClick={() => go("/")}>فتح الموقع</button>

        <div className="sideStat">
          <b>{apps.length}</b>
          <span>إجمالي طلبات الانضمام</span>
        </div>
        <div className="sideStat">
          <b>{clanMembers.length}</b>
          <span>أعضاء ظاهرين في هرم الكلان</span>
        </div>
        <div className="sideStat">
          <b>{videoRequests.filter((r) => r.status === "pending").length}</b>
          <span>طلبات فيديو بانتظار المراجعة</span>
        </div>
        <div className="sideStat">
          <b>{siteVideos.filter((v) => Number(v.slot || 0) >= 99).length}</b>
          <span>فيديوهات مسابقات منشورة</span>
        </div>
      </aside>

      <section className="adminContent">
        {adminApiStatus && <div className="adminApiNotice">{adminApiStatus}</div>}
        {adminTab === "applications" && (
          <>
            <div className="adminTop">
              <div>
                <h1>طلبات التقديم</h1>
                <p>كل اللاعبين الذين قدموا على الكلان مع فيديو الأداء.</p>
              </div>

              <div className="searchBox">
                <Search />
                <input
                  placeholder="بحث بالاسم أو ID أو الدور..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="adminList">
              {filtered.map((a) => (
                <div className="adminCard" key={a.id}>
                  <div className="adminCardHead">
                    <div>
                      <h3>{a.player_name}</h3>
                      <span>Application #{a.id}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button
                        type="button"
                        onClick={() => deleteApplication(a.id, a.player_name)}
                        disabled={deletingId === a.id}
                        title="حذف الطلب"
                        className="dangerIconBtn"
                      >
                        <Trash2 size={19} />
                      </button>
                      <Trophy />
                    </div>
                  </div>

                  <div className="applicationPreviewRow">
                    <img className="applicationProfileImg" src={videoUrl(a.profile_image_url)} alt={a.player_name} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    <div className="applicationApproveBox">
                      <select value={memberRanks[a.id] || "member"} onChange={(e) => setMemberRanks({ ...memberRanks, [a.id]: e.target.value })}>
                        <option value="member">لاعب عادي</option>
                        <option value="elite">لاعب نخبة</option>
                        <option value="co_leader">كو ليدر</option>
                        <option value="leader">قائد الكلان</option>
                      </select>
                      <button className="mainBtn" onClick={() => approveApplication(a.id)} disabled={a.status === "approved"}>
                        {a.status === "approved" ? "تمت إضافته" : "قبول وإظهاره بالهرم"}
                      </button>
                    </div>
                  </div>

                  <div className="infoGrid">
                    <p><IdCard size={16} /> <b>ID:</b> {a.pubg_id}</p>
                    <p><MessageSquare size={16} /> <b>Discord:</b> {a.discord || "غير محدد"}</p>
                    <p><Monitor size={16} /> <b>Device:</b> {a.device || "غير محدد"}</p>
                    <p><Eye size={16} /> <b>FPS:</b> {a.fps || "غير محدد"}</p>
                    <p><Sword size={16} /> <b>Role:</b> {a.role || "غير محدد"}</p>
                    <p><Calendar size={16} /> <b>Date:</b> {new Date(a.created_at).toLocaleString("ar")}</p>
                  </div>

                  <p className="desc">{a.description || "لا يوجد وصف"}</p>

                  <video controls src={a.video_url?.startsWith("http") ? a.video_url : `${API}${a.video_url}`} />
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="emptyState">
                  لا توجد طلبات مطابقة.
                </div>
              )}
            </div>
          </>
        )}

        {adminTab === "members" && (
          <>
            <div className="adminTop">
              <div>
                <h1>التحكم بأعضاء الكلان</h1>
                <p>الأعضاء المقبولين يظهرون في صفحة أعضاء الكلان على شكل هرم حسب الرتبة.</p>
              </div>
            </div>

            <form className="form manualMemberForm" onSubmit={addManualClanMember}>
              <div className="memberImportInfo">
                <UserPlus />
                <div>
                  <h3>إضافة عضو يدوي</h3>
                  <p>اكتب الاسم، اختر المنصب، ويمكنك إضافة صورة اختيارية للعضو.</p>
                </div>
              </div>

              <div className="inputGroup">
                <input
                  placeholder="اسم العضو"
                  value={manualMemberForm.player_name}
                  onChange={(e) => {
                    setManualMemberForm({ ...manualMemberForm, player_name: e.target.value });
                    setManualMemberMessage("");
                  }}
                />
              </div>

              <div className="inputGroup">
                <select
                  value={manualMemberForm.clan_rank}
                  onChange={(e) => setManualMemberForm({ ...manualMemberForm, clan_rank: e.target.value })}
                >
                  <option value="member">لاعب عادي</option>
                  <option value="elite">لاعب نخبة</option>
                  <option value="co_leader">كو ليدر</option>
                  <option value="leader">قائد الكلان </option>
                </select>
              </div>

              <label className="uploadBox compactUploadBox">
                <Upload />
                <b>{manualMemberImage ? manualMemberImage.name : "صورة العضو اختيارية"}</b>
                <span>PNG / JPG / WEBP</span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    setManualMemberImage(e.target.files[0] || null);
                    setManualMemberMessage("");
                  }}
                />
              </label>

              <button className="mainBtn submitBtn" type="submit" disabled={savingManualMember}>
                {savingManualMember ? "جاري الإضافة..." : "إضافة العضو"}
              </button>

              {manualMemberMessage && (
                <div className="successMsg">
                  <CheckCircle size={20} />
                  {manualMemberMessage}
                </div>
              )}
            </form>

            <form className="form memberImportForm" onSubmit={importClanMembers}>
              <div className="memberImportInfo">
                <Upload />
                <div>
                  <h3>استيراد أعضاء الكلان من Excel</h3>
                  <p>
                    ارفع ملف فيه عمودين فقط: <b>Pubg Name</b> و <b>Status</b>.
                    يدعم xlsx / xlsm / csv، ويتم ترتيب الأعضاء تلقائياً حسب الرتبة.
                  </p>
                </div>
              </div>

              <label className="uploadBox memberImportUpload">
                <Upload />
                <b>{membersImportFile ? membersImportFile.name : "اختر ملف الأعضاء"}</b>
                <span>XLSX / XLSM / CSV</span>
                <input
                  type="file"
                  accept=".xlsx,.xlsm,.csv"
                  hidden
                  onChange={(e) => {
                    setMembersImportFile(e.target.files[0] || null);
                    setMembersImportMessage("");
                  }}
                />
              </label>

              <button className="mainBtn submitBtn" type="submit" disabled={importingMembers}>
                {importingMembers ? "جاري الاستيراد..." : "استيراد الأعضاء"}
              </button>

              {membersImportMessage && (
                <div className="successMsg">
                  <CheckCircle size={20} />
                  {membersImportMessage}
                </div>
              )}
            </form>

            <ClanMembersHierarchy
              members={clanMembers}
              adminMode
              onRankChange={updateClanMemberRank}
              onRemove={removeClanMember}
              memberImageFiles={memberImageFiles}
              savingMemberImageId={savingMemberImageId}
              onImageSelect={(id, file) => setMemberImageFiles((prev) => ({ ...prev, [id]: file }))}
              onImageSave={updateClanMemberImage}
              onNameSave={updateClanMemberName}
            />
          </>
        )}

        {adminTab === "videos" && (
          <>
            <div className="adminTop">
              <div>
                <h1>إدارة الفيديوهات</h1>
                <p>غيّر فيديوهات قسم الكلان. استخدم Slot من 1 إلى 10 للفيديوهات الرئيسية بنفس ترتيب الظهور، واستخدم 99 للتصاميم.</p>
              </div>
            </div>

            <form className="form adminVideoForm" onSubmit={saveSiteVideo}>
              <div className="inputGroup">
                <input
                  placeholder="عنوان الفيديو"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="inputGroup">
                <input
                  type="number"
                  min="1"
                  max="99"
                  placeholder="Slot رقم الظهور 1-10 أو 99 للتصاميم"
                  value={videoForm.slot}
                  onChange={(e) => setVideoForm({ ...videoForm, slot: Number(e.target.value) })}
                />
              </div>

              <div className="adminFormHint">
                للفيديوهات الرئيسية استخدم الأرقام 1 إلى 10. الرقم 99 مخصص لقسم التصاميم.
              </div>

              <textarea
                placeholder="وصف الفيديو"
                value={videoForm.description}
                onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
              />

              <label className="uploadBox">
                <Upload />
                <b>{videoForm.file ? videoForm.file.name : videoForm.id ? "اختياري: اختر فيديو جديد للتبديل" : "اختر فيديو للموقع"}</b>
                <span>MP4 / WEBM / MOV</span>
                <input type="file" accept="video/*" hidden onChange={(e) => setVideoForm({ ...videoForm, file: e.target.files[0] })} />
              </label>

              <button className="mainBtn submitBtn" type="submit" disabled={savingVideo}>
                {savingVideo ? "جاري الحفظ..." : videoForm.id ? "تحديث الفيديو" : "إضافة فيديو"}
              </button>

              {videoForm.id && (
                <button
                  type="button"
                  className="ghostBtn submitBtn"
                  onClick={() => setVideoForm({ id: null, title: "", description: "", slot: 1, file: null })}
                >
                  إلغاء التعديل
                </button>
              )}
            </form>

            <div className="adminList adminMediaList">
              {siteVideos.map((v) => (
                <div className="adminCard" key={v.id}>
                  <div className="adminCardHead">
                    <div>
                      <h3>{v.title}</h3>
                      <span>{v.slot >= 99 ? "تصميم منشور" : `Slot #${v.slot}`}</span>
                    </div>
                    <Video />
                  </div>

                  <p className="desc">{cleanVideoDescription(v) || "لا يوجد وصف"}</p>
                  {getVideoPrize(v) && <div className="adminPrizeTag"><Trophy size={18} /> الجائزة: <b>{getVideoPrize(v)}</b></div>}
                  <video controls src={videoUrl(v.video_url)} />

                  <div className="adminActionsRow">
                    <button className="ghostBtn" onClick={() => editSiteVideo(v)}>تعديل</button>
                    <button className="dangerBtn" onClick={() => deleteSiteVideo(v.id)}>{v.slot >= 99 ? "حذف التصميم" : "حذف"}</button>
                  </div>
                </div>
              ))}

              {siteVideos.length === 0 && (
                <div className="emptyState">لا توجد فيديوهات من الباك اند. سيظهر الاحتياطي تلقائياً بالموقع.</div>
              )}
            </div>
          </>
        )}


        {adminTab === "competitionVideos" && (
          <>
            <div className="adminTop">
              <div>
                <h1>فيديوهات المسابقات</h1>
                <p>كل فيديو تم قبوله من طلبات "ارفع تصميمك" يظهر هنا. تقدر تحذفه أو تحوله لفائز بالمركز الأول أو الثاني أو الثالث.</p>
              </div>
            </div>

            <div className="adminList adminMediaList">
              {siteVideos.filter((v) => Number(v.slot || 0) >= 99).map((v) => (
                <div className="adminCard competitionVideoCard" key={v.id}>
                  <div className="adminCardHead">
                    <div>
                      <h3>{v.title}</h3>
                      <span>فيديو مسابقات منشور</span>
                    </div>
                    <Medal />
                  </div>

                  <p className="desc">{cleanVideoDescription(v) || "لا يوجد وصف"}</p>
                  {getVideoPrize(v) && <div className="adminPrizeTag"><Trophy size={18} /> الجائزة: <b>{getVideoPrize(v)}</b></div>}
                  <video controls src={videoUrl(v.video_url)} />

                  <div className="adminActionsRow">
                    <button className="mainBtn" onClick={() => moveToMonthlyWinner(v)}>تحويل للمسابقة الشهرية</button>
                    <button className="ghostBtn" onClick={() => editSiteVideo(v)}>تعديل</button>
                    <button className="dangerBtn" onClick={() => deleteSiteVideo(v.id)}>حذف الفيديو</button>
                  </div>
                </div>
              ))}

              {siteVideos.filter((v) => Number(v.slot || 0) >= 99).length === 0 && (
                <div className="emptyState">لا توجد فيديوهات مسابقات منشورة حالياً. اقبل طلباً من قسم طلبات التصاميم أولاً.</div>
              )}
            </div>
          </>
        )}

        {adminTab === "branding" && (
          <>
            <div className="adminTop">
              <div>
                <h1>التحكم في لوجو الموقع</h1>
                <p>غيّر لوجو الموقع من لوحة الإدارة، وسيتم تحديث لوجو الناف بار والفوتر وأيقونة المتصفح favicon تلقائياً.</p>
              </div>
            </div>

            <form className="form logoControlForm" onSubmit={saveSiteLogo}>
              <div className="memberImportInfo">
                <Crown />
                <div>
                  <h3>اللوجو الحالي</h3>
                  <p>اختر صورة جديدة بصيغة PNG / JPG / WEBP ثم اضغط حفظ.</p>
                </div>
              </div>

              <div className="logoPreviewBox">
                <img src={siteLogoUrl || logo} alt="Current Logo" />
                <span>المعاينة الحالية</span>
              </div>

              <label className="uploadBox logoUploadBox">
                <Upload />
                <b>{logoFile ? logoFile.name : "اختر لوجو جديد للموقع"}</b>
                <span>سيتم تحديث اللوجو والـ favicon مباشرة بعد الحفظ</span>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    setLogoFile(e.target.files[0] || null);
                    setLogoMessage("");
                  }}
                />
              </label>

              <button className="mainBtn submitBtn" type="submit" disabled={savingLogo}>
                {savingLogo ? "جاري الحفظ..." : "حفظ اللوجو الجديد"}
              </button>

              {logoMessage && (
                <div className="successMsg">
                  <CheckCircle size={20} />
                  {logoMessage}
                </div>
              )}
            </form>
          </>
        )}

        {adminTab === "requests" && (
          <>
            <div className="adminTop">
              <div>
                <h1>طلبات إضافة فيديو</h1>
                <p>اقبل الفيديو ليظهر تلقائياً في قسم التصاميم، أو ارفضه.</p>
              </div>
            </div>

            <div className="adminList adminMediaList">
              {videoRequests.map((r) => (
                <div className="adminCard" key={r.id}>
                  <div className="adminCardHead">
                    <div>
                      <h3>{r.title}</h3>
                      <span className={`statusPill ${r.status}`}>{r.status || "pending"}</span>
                    </div>
                    <Video />
                  </div>

                  <div className="infoGrid">
                    <p><Users size={16} /> <b>المرسل:</b> {r.visitor_name}</p>
                    <p><MessageSquare size={16} /> <b>تواصل:</b> {r.contact || "غير محدد"}</p>
                    <p><Calendar size={16} /> <b>Date:</b> {new Date(r.created_at).toLocaleString("ar")}</p>
                  </div>

                  <p className="desc">{r.description || "لا يوجد وصف"}</p>
                  <video controls src={videoUrl(r.video_url)} />

                  <div className="adminActionsRow">
                    {r.status === "pending" && (
                      <>
                        <button className="mainBtn" onClick={() => reviewVideoRequest(r.id, "approve")}>قبول ونشر</button>
                        <button className="dangerBtn" onClick={() => reviewVideoRequest(r.id, "reject")}>رفض</button>
                      </>
                    )}
                    <button className="dangerBtn" onClick={() => deleteVideoRequest(r.id, r.status)}>حذف الطلب</button>
                  </div>
                </div>
              ))}

              {videoRequests.length === 0 && (
                <div className="emptyState">لا توجد طلبات فيديو حالياً.</div>
              )}
            </div>
          </>
        )}

        {winnerModal.open && (
          <div className="siteModalOverlay" onClick={() => !winnerModal.saving && setWinnerModal({ open: false, video: null, position: "1", prize: "", saving: false, message: "" })}>
            <form className="siteModalBox winnerChoiceModal" onSubmit={confirmMonthlyWinner} onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="siteModalClose"
                onClick={() => !winnerModal.saving && setWinnerModal({ open: false, video: null, position: "1", prize: "", saving: false, message: "" })}
              >
                ✕
              </button>

              <div className="modalIconCircle"><Trophy /></div>
              <h2>اعتماد فائز المسابقة الشهرية</h2>
              <p>حدد المركز والجائزة، وبعد الضغط على تم سيظهر الفيديو في منصة الفائزين مع الجائزة.</p>

              {winnerModal.video && (
                <div className="modalVideoPreview">
                  <video src={videoUrl(winnerModal.video.video_url)} muted playsInline preload="metadata" />
                  <div>
                    <b>{winnerModal.video.title || "فيديو مسابقات"}</b>
                    <span>{cleanVideoDescription(winnerModal.video) || "بدون وصف"}</span>
                  </div>
                </div>
              )}

              <label className="modalFieldLabel">مركز الفائز</label>
              <div className="winnerRankChoices">
                {[1, 2, 3].map((rank) => (
                  <button
                    type="button"
                    key={rank}
                    className={Number(winnerModal.position) === rank ? "active" : ""}
                    onClick={() => setWinnerModal((prev) => ({ ...prev, position: String(rank), message: "" }))}
                  >
                    <span>#{rank}</span>
                    {rank === 1 ? "الأول" : rank === 2 ? "الثاني" : "الثالث"}
                  </button>
                ))}
              </div>

              <label className="modalFieldLabel" htmlFor="winnerPrizeInput">الجائزة</label>
              <input
                id="winnerPrizeInput"
                value={winnerModal.prize}
                onChange={(e) => setWinnerModal((prev) => ({ ...prev, prize: e.target.value, message: "" }))}
                placeholder="مثال: 10$ / شدات PUBG / لقب الشهر"
                autoFocus
              />

              {winnerModal.message && <div className="modalStatusMsg">{winnerModal.message}</div>}

              <div className="modalActions">
                <button className="mainBtn" type="submit" disabled={winnerModal.saving}>
                  {winnerModal.saving ? "جاري الحفظ..." : "تم واعتماد الفائز"}
                </button>
                <button
                  className="ghostBtn"
                  type="button"
                  disabled={winnerModal.saving}
                  onClick={() => setWinnerModal({ open: false, video: null, position: "1", prize: "", saving: false, message: "" })}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

      </section>
    </main>
    </>
  );
}


const rankLabels = {
  leader: "قائد الكلان",
  co_leader: "كو ليدر",
  elite: "لاعب نخبة",
  member: "لاعب عادي",
};

const rankOrder = ["leader", "co_leader", "elite", "member"];

function ClanMembersHierarchy({ members, adminMode = false, onRankChange, onRemove, memberImageFiles = {}, onImageSelect, onImageSave, savingMemberImageId, onNameSave }) {
  const [editingNameId, setEditingNameId] = useState(null);
  const [editingNameValue, setEditingNameValue] = useState("");
  const [savingNameId, setSavingNameId] = useState(null);

  const startEditName = (member) => {
    if (!adminMode) return;
    setEditingNameId(member.id);
    setEditingNameValue(member.player_name || "");
  };

  const cancelEditName = () => {
    setEditingNameId(null);
    setEditingNameValue("");
  };

  const saveEditName = async (member) => {
    if (!onNameSave) return;
    setSavingNameId(member.id);
    const ok = await onNameSave(member, editingNameValue);
    setSavingNameId(null);
    if (ok) cancelEditName();
  };

  const grouped = rankOrder.map((rank) => ({
    rank,
    label: rankLabels[rank],
    items: members.filter((m) => (m.clan_rank || "member") === rank),
  }));

  return (
    <div className="clanPyramid">
      {grouped.map((group, index) => (
        <div className={`pyramidLevel level-${index + 1}`} key={group.rank}>
          <div className="pyramidLevelTitle">
            <Crown size={18} />
            <span>{group.label}</span>
          </div>

          <div className="pyramidMembers">
            {group.items.length ? group.items.map((member) => (
              <div className="memberCard" key={member.id}>
                <label className={`memberAvatarRing ${adminMode ? "editableAvatar" : ""}`} title={adminMode ? "اضغط لتغيير صورة العضو" : member.player_name}>
                  {member.profile_image_url ? (
                    <img src={videoUrl(member.profile_image_url)} alt={member.player_name} />
                  ) : (
                    <Users />
                  )}
                  {adminMode && (
                    <>
                      <span className="avatarEditHint">تغيير</span>
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => onImageSelect && onImageSelect(member.id, e.target.files[0] || null)}
                      />
                    </>
                  )}
                </label>

                {adminMode && editingNameId === member.id ? (
                  <div className="memberNameEditBox">
                    <input
                      value={editingNameValue}
                      onChange={(e) => setEditingNameValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveEditName(member);
                        if (e.key === "Escape") cancelEditName();
                      }}
                      autoFocus
                      placeholder="اسم العضو"
                    />
                    <div className="memberNameEditActions">
                      <button type="button" className="mainBtn miniMemberBtn" onClick={() => saveEditName(member)} disabled={savingNameId === member.id}>
                        {savingNameId === member.id ? "جاري..." : "حفظ"}
                      </button>
                      <button type="button" className="ghostBtn miniMemberBtn" onClick={cancelEditName}>إلغاء</button>
                    </div>
                  </div>
                ) : (
                  <h3
                    className={adminMode ? "editableMemberName" : ""}
                    title={adminMode ? "اضغط لتعديل اسم العضو" : member.player_name}
                    onClick={() => startEditName(member)}
                  >
                    {member.player_name}
                  </h3>
                )}
                <span className="memberRank">{member.clan_title || group.label}</span>


                {adminMode && (
                  <div className="memberAdminControls">
                    <select value={member.clan_rank || "member"} onChange={(e) => onRankChange(member.id, e.target.value)}>
                      <option value="member">لاعب عادي</option>
                      <option value="elite">لاعب نخبة</option>
                      <option value="co_leader">كو ليدر</option>
                      <option value="leader">قائد الكلان</option>
                    </select>
                    {memberImageFiles[member.id] && (
                      <button className="mainBtn memberImageSaveBtn" type="button" onClick={() => onImageSave(member)} disabled={savingMemberImageId === member.id}>
                        {savingMemberImageId === member.id ? "جاري الحفظ..." : "حفظ الصورة"}
                      </button>
                    )}
                    <button className="dangerBtn" onClick={() => onRemove(member.id)}>إزالة</button>
                  </div>
                )}
              </div>
            )) : (
              <div className="emptyPyramidSlot">لا يوجد أعضاء في هذا المستوى حالياً</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ClanMembersPage() {
  const siteLogoUrl = useSiteLogo();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function loadMembers() {
      try {
        const cached = readCachedArray("rnm_cache_clan_members");
        if (alive && cached.length) setMembers(cached);

        const json = await fetchJson("/api/clan-members");
        const list = Array.isArray(json) ? json : [];
        writeCachedArray("rnm_cache_clan_members", list);
        if (alive) setMembers(list);
      } catch {
        // لا نفرغ الصفحة عند انقطاع السيرفر؛ نبقي آخر بيانات محفوظة.
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadMembers();
    return () => { alive = false; };
  }, []);

  return (
    <>
      <BrandAssets logoUrl={siteLogoUrl} />
      <Navbar logoUrl={siteLogoUrl} />
      <section className="membersHero">
        <div className="heroBadge"><Crown size={22} /> RNM CLAN MEMBERS</div>
        <h1>أعضاء الكلان<span>HIERARCHY</span></h1>
        <p>هرم RNM الرسمي: الرئيس، الكو ليدر، لاعبي النخبة، ثم اللاعبين العاديين.</p>
      </section>

      <section className="section membersSection">
        {loading ? <div className="emptyState">جاري تحميل أعضاء الكلان...</div> : <ClanMembersHierarchy members={members} />}
      </section>
      <Footer logoUrl={siteLogoUrl} />
    </>
  );
}

function Footer({ logoUrl = logo }) {
  return (
    <footer className="siteFooter">
      <div className="footerGlow" />

      <div className="footerMotto">
        <span>ONE CLAN</span>
        <b>RNM</b>
        <span>ONE HEART</span>
        <img className="footerLogoImg" src={logoUrl || logo} alt="RNM ESPORTS" />
        <span>ONE LEGACY</span>
      </div>

      <div className="footerCredit">
        <span>الموقع صنع بحب</span>
        <b>♥</b>
        <span>من</span>
        <strong>TEAM HAWK PROGRAMING</strong>
      </div>
    </footer>
  );
}

function App() {
  const path = useRoute();
  const cleanPath = path.replace(/\/+$/, "") || "/";
  const connectionState = useBackendKeepAlive();

  return (
    <>
      <ConnectionBanner state={connectionState} />
      {cleanPath === "/admin" ? <Admin /> : cleanPath === "/members" ? <ClanMembersPage /> : <Home />}
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
