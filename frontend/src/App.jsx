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
} from "lucide-react";
import "./style.css";
import clanVideo1 from "./VID-1.mp4";
import clanVideo2 from "./VID-2.mp4";
import clanVideo3 from "./VID-3.mp4";
import logo from "./RNM.png";

const API = import.meta.env.VITE_API_URL || "https://ranime-clan-site.onrender.com";
const MAX_CLAN_VIDEOS = 10;

function go(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("popstate"));
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
    { id: "fallback-1", title: "أداء الأعضاء", description: "فيديو يظهر اداء الكلان ", src: clanVideo1, label: "VIDEO 1", fallback: true },
    { id: "fallback-2", title: "أداء الأعضاء", description: "فيديو يظهر اداء الكلان ", src: clanVideo2, label: "VIDEO 2", fallback: true },
    { id: "fallback-3", title: "أداء الأعضاء", description: "فيديو يظهر اداء الكلان ", src: clanVideo3, label: "VIDEO 3", fallback: true },
  ];
}

function BrandAssets() {
  useEffect(() => {
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }
    favicon.type = "image/png";
    favicon.href = logo;

    let appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!appleIcon) {
      appleIcon = document.createElement("link");
      appleIcon.rel = "apple-touch-icon";
      document.head.appendChild(appleIcon);
    }
    appleIcon.href = logo;
  }, []);

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
      const res = await fetch(`${API}/api/apply`, {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      setMessage(json.message);

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
      <BrandAssets />
      <Navbar />
      <Hero />
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
      <Footer />
    </>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    ["الرئيسية", "#top"],
    ["الكلان", "#clan"],
    ["أعضاء الكلان", "/members"],
    ["الفيديوهات", "#videos"],
    ["التصاميم", "#designs"],
    ["التقديم", "#apply"],
  ];

  return (
    <nav className="nav">
      <button className="brand" onClick={() => go("/")}>
        <img className="brandLogoNav" src={logo} alt="RNM ESPORTS" />
        <span className="brandTextStack">
          <span>RNM</span>
          <small>ESPORTS</small>
        </span>
      </button>

      <div className={`navLinks ${open ? "show" : ""}`}>
        {links.map(([label, href]) => (
          href.startsWith("/") ? (
            <button key={label} type="button" onClick={() => { setOpen(false); go(href); }}>
              {label}
            </button>
          ) : (
            <a key={label} href={href} onClick={() => setOpen(false)}>
              {label}
            </a>
          )
        ))}
      </div>

      <button className="menuBtn" onClick={() => setOpen(!open)}>
        {open ? <X /> : <Menu />}
      </button>
    </nav>
  );
}

function Hero() {
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
        <div className="heroOrb">
          <div className="rnmHeroSlash" />
          <div className="rnmHeroLetters" aria-label="RNM">
            <span>R</span>
            <span>N</span>
            <span>M</span>
          </div>
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
  const [videos, setVideos] = useState(fallbackMainVideos());
  const [designs, setDesigns] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    let alive = true;

    async function loadSiteVideos() {
      try {
        const res = await fetch(`${API}/api/site-videos`);
        if (!res.ok) throw new Error("backend");
        const json = await res.json();

        if (!alive) return;

        const mapped = (Array.isArray(json) ? json : []).map((item, index) => ({
          id: item.id,
          title: item.title || "فيديو RNM",
          description: item.description || "فيديو من إدارة الكلان",
          src: videoUrl(item.video_url),
          label: item.slot && item.slot >= 99 ? "DESIGN" : `VIDEO ${item.slot || index + 1}`,
          slot: item.slot || index + 1,
          fallback: false,
        }));

        const sortedMapped = mapped.sort((a, b) => (a.slot || 1) - (b.slot || 1) || String(a.id).localeCompare(String(b.id)));
        const mainVideos = sortedMapped
          .filter((v) => (v.slot || 1) < 99)
          .slice(0, MAX_CLAN_VIDEOS);
        const designVideos = sortedMapped.filter((v) => (v.slot || 1) >= 99);

        setVideos(mainVideos.length ? mainVideos : fallbackMainVideos());
        setDesigns(designVideos);
        setUsingFallback(!mainVideos.length);
      } catch {
        if (!alive) return;
        setVideos(fallbackMainVideos());
        setDesigns([]);
        setUsingFallback(true);
      }
    }

    loadSiteVideos();
    return () => {
      alive = false;
    };
  }, []);

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
              if (!item.fallback && videos[index]) {
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

  return (
    <>
      <section className="section" id="videos">
        <div className="sectionHead">
          <span>CLAN MEDIA</span>
          <h2>فيديوهات الكلان</h2>
          <p>
            الإدارة تقدر تضيف حتى 10 فيديوهات للكلان بنفس الترتيب، 3 فيديوهات في كل سطر. وإذا تعطل الباك اند تظهر الفيديوهات الأصلية تلقائياً.
          </p>
          {usingFallback && (
            <div className="fallbackNotice">
              يتم عرض الفيديوهات الاحتياطية حالياً.
            </div>
          )}
        </div>

        <div className={`mediaGrid compactMediaGrid clanVideosGrid count-${Math.min(videos.length, MAX_CLAN_VIDEOS)}`}>
          {videos.map(renderVideoCard)}
        </div>
      </section>

      <section className="section" id="designs">
        <div className="sectionHead">
          <span>RNM DESIGNS</span>
          <h2>قسم التصاميم</h2>
          <p>
            الفيديوهات المقبولة من الإدارة تظهر هنا كتصاميم وإبداعات خاصة بالكلان.
          </p>
        </div>

        {designs.length ? (
          <div className={`mediaGrid compactMediaGrid count-${Math.min(designs.length, 3)}`}>
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
      const res = await fetch(`${API}/api/video-requests`, {
        method: "POST",
        body: data,
      });

      const text = await res.text();
      let json = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        json = {};
      }

      if (!res.ok || json.success === false) {
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

  useEffect(() => {
    if (allowed) loadAdminData();
  }, [allowed]);

  async function loadAdminData() {
    await Promise.all([loadApps(), loadSiteVideos(), loadVideoRequests(), loadClanMembers()]);
  }

  async function loadApps() {
    const res = await fetch(`${API}/api/applications`);
    const json = await res.json();
    setApps(Array.isArray(json) ? json : []);
  }

  async function loadSiteVideos() {
    try {
      const res = await fetch(`${API}/api/site-videos`);
      const json = await res.json();
      setSiteVideos(Array.isArray(json) ? json : []);
    } catch {
      setSiteVideos([]);
    }
  }

  async function loadVideoRequests() {
    try {
      const res = await fetch(`${API}/api/video-requests`);
      const json = await res.json();
      setVideoRequests(Array.isArray(json) ? json : []);
    } catch {
      setVideoRequests([]);
    }
  }

  async function loadClanMembers() {
    try {
      const res = await fetch(`${API}/api/clan-members`);
      const json = await res.json();
      setClanMembers(Array.isArray(json) ? json : []);
    } catch {
      setClanMembers([]);
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
      const res = await fetch(`${API}/api/clan-members/import`, {
        method: "POST",
        body: data,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json.success === false) {
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
      const res = await fetch(`${API}/api/applications/${id}/approve`, { method: "POST", body: data });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
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
      const res = await fetch(`${API}/api/clan-members/${id}`, { method: "PUT", body: data });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
        alert(json.message || json.detail || "فشل تحديث العضو");
        return;
      }
      await loadClanMembers();
    } catch {
      alert("حدث خطأ أثناء تحديث العضو");
    }
  }

  async function removeClanMember(id) {
    const ok = window.confirm("هل تريد إزالة هذا العضو من هرم الكلان؟");
    if (!ok) return;
    try {
      const res = await fetch(`${API}/api/clan-members/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.success === false) {
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
      const res = await fetch(`${API}/api/applications/${id}`, {
        method: "DELETE",
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json.success === false) {
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

      const res = await fetch(url, {
        method: videoForm.id ? "PUT" : "POST",
        body: data,
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || json.success === false) {
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
      description: item.description || "",
      slot: item.slot || 1,
      file: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteSiteVideo(id) {
    const ok = window.confirm("هل تريد حذف هذا الفيديو من الموقع؟");
    if (!ok) return;

    try {
      const res = await fetch(`${API}/api/site-videos/${id}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || json.success === false) {
        alert(json.message || json.detail || "فشل حذف الفيديو");
        return;
      }

      setSiteVideos((prev) => prev.filter((item) => item.id !== id));
    } catch {
      alert("حدث خطأ أثناء حذف الفيديو");
    }
  }

  async function reviewVideoRequest(id, action) {
    const ok = window.confirm(action === "approve" ? "قبول الفيديو ونشره؟" : "رفض الفيديو؟");
    if (!ok) return;

    try {
      const res = await fetch(`${API}/api/video-requests/${id}/${action}`, {
        method: "POST",
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || json.success === false) {
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
      const res = await fetch(`${API}/api/video-requests/${id}`, {
        method: "DELETE",
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok || json.success === false) {
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
      <BrandAssets />
      <main className="adminPage">
        <div className="adminLogin">
          <div className="adminLogo">
            <img className="rnmLogoImg adminLoginLogoImg" src={logo} alt="RNM ADMIN" />
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
    <BrandAssets />
    <main className="adminDashboard">
      <aside className="adminSide">
        <div className="sideBrand">
          <img className="rnmLogoImg adminSideLogoImg" src={logo} alt="RNM ADMIN" />
          <h2>RNM</h2>
          <span>ADMIN PANEL</span>
        </div>

        <button className={adminTab === "applications" ? "active" : ""} onClick={() => setAdminTab("applications")}>طلبات التقديم</button>
        <button className={adminTab === "members" ? "active" : ""} onClick={() => setAdminTab("members")}>التحكم بأعضاء الكلان</button>
        <button className={adminTab === "videos" ? "active" : ""} onClick={() => setAdminTab("videos")}>إدارة فيديوهات الموقع</button>
        <button className={adminTab === "requests" ? "active" : ""} onClick={() => setAdminTab("requests")}>طلبات التصاميم</button>
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
      </aside>

      <section className="adminContent">
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
                        <option value="leader">رئيس الكلان</option>
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

            <ClanMembersHierarchy members={clanMembers} adminMode onRankChange={updateClanMemberRank} onRemove={removeClanMember} />
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

                  <p className="desc">{v.description || "لا يوجد وصف"}</p>
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
      </section>
    </main>
    </>
  );
}


const rankLabels = {
  leader: "رئيس الكلان",
  co_leader: "كو ليدر",
  elite: "لاعب نخبة",
  member: "لاعب عادي",
};

const rankOrder = ["leader", "co_leader", "elite", "member"];

function ClanMembersHierarchy({ members, adminMode = false, onRankChange, onRemove }) {
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
                <div className="memberAvatarRing">
                  {member.profile_image_url ? (
                    <img src={videoUrl(member.profile_image_url)} alt={member.player_name} />
                  ) : (
                    <Users />
                  )}
                </div>

                <h3>{member.player_name}</h3>
                <span className="memberRank">{member.clan_title || group.label}</span>

                <div className="memberMiniGrid">
                  <p><IdCard size={14} /> {member.pubg_id || "بدون ID"}</p>
                  <p><Monitor size={14} /> {member.device || "غير محدد"}</p>
                  <p><Eye size={14} /> {member.fps || "غير محدد"}</p>
                  <p><Sword size={14} /> {member.game_role || "غير محدد"}</p>
                </div>

                {adminMode && (
                  <div className="memberAdminControls">
                    <select value={member.clan_rank || "member"} onChange={(e) => onRankChange(member.id, e.target.value)}>
                      <option value="member">لاعب عادي</option>
                      <option value="elite">لاعب نخبة</option>
                      <option value="co_leader">كو ليدر</option>
                      <option value="leader">رئيس الكلان</option>
                    </select>
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
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function loadMembers() {
      try {
        const res = await fetch(`${API}/api/clan-members`);
        const json = await res.json();
        if (alive) setMembers(Array.isArray(json) ? json : []);
      } catch {
        if (alive) setMembers([]);
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadMembers();
    return () => { alive = false; };
  }, []);

  return (
    <>
      <BrandAssets />
      <Navbar />
      <section className="membersHero">
        <div className="heroBadge"><Crown size={22} /> RNM CLAN MEMBERS</div>
        <h1>أعضاء الكلان<span>HIERARCHY</span></h1>
        <p>هرم RNM الرسمي: الرئيس، الكو ليدر، لاعبي النخبة، ثم اللاعبين العاديين.</p>
      </section>

      <section className="section membersSection">
        {loading ? <div className="emptyState">جاري تحميل أعضاء الكلان...</div> : <ClanMembersHierarchy members={members} />}
      </section>
      <Footer />
    </>
  );
}

function Footer() {
  return (
    <footer className="siteFooter">
      <div className="footerGlow" />

      <div className="footerMotto">
        <span>ONE CLAN</span>
        <b>RNM</b>
        <span>ONE HEART</span>
        <img className="footerLogoImg" src={logo} alt="RNM ESPORTS" />
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

  if (cleanPath === "/admin") return <Admin />;
  if (cleanPath === "/members") return <ClanMembersPage />;
  return <Home />;
}

createRoot(document.getElementById("root")).render(<App />);
