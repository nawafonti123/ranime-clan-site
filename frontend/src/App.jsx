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
} from "lucide-react";
import "./style.css";

const API = "http://127.0.0.1:8000";

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
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();

    if (!video) {
      setMessage("ارفع فيديو أدائك أولاً");
      return;
    }

    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => data.append(k, v));
    data.append("video", video);

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
      }
    } catch {
      setMessage("حدث خطأ أثناء الرفع");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <Hero />
      <ClanInfo />
      <Identity />
      <Videos />
      <ApplySection
        form={form}
        setForm={setForm}
        video={video}
        setVideo={setVideo}
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
    ["الفيديوهات", "#videos"],
    ["التقديم", "#apply"],
  ];

  return (
    <nav className="nav">
      <button className="brand" onClick={() => go("/")}>
        <span className="brandWolf">♛</span>
        <span>RNM</span>
        <small>ESPORTS</small>
      </button>

      <div className={`navLinks ${open ? "show" : ""}`}>
        {links.map(([label, href]) => (
          <a key={label} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
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
          RANIME GAMING OFFICIAL
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

      <div className="heroEmblem">
        <div className="emblemRing">
          <Crown />
          <h2>RNM</h2>
          <p>ONE CLAN</p>
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
  const videos = [
    "مونتاج الكلان",
    "لقطات سكريم",
    "أداء الأعضاء",
  ];

  return (
    <section className="section" id="videos">
      <div className="sectionHead">
        <span>CLAN MEDIA</span>
        <h2>فيديوهات الكلان</h2>
        <p>
          قسم خاص لعرض أقوى لقطات RNM، البطولات، السكريمات، والمونتاجات.
        </p>
      </div>

      <div className="videoGrid">
        {videos.map((title, i) => (
          <div className="videoBox" key={title}>
            <div className="videoMock">
              <Video />
              <span>VIDEO {i + 1}</span>
            </div>
            <h3>{title}</h3>
            <p>يمكنك لاحقاً استبداله بفيديو حقيقي أو رابط YouTube.</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ApplySection({ form, setForm, video, setVideo, submit, message, loading }) {
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
  const [password, setPassword] = useState("");
  const [allowed, setAllowed] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (allowed) loadApps();
  }, [allowed]);

  async function loadApps() {
    const res = await fetch(`${API}/api/applications`);
    const json = await res.json();
    setApps(json);
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
      <main className="adminPage">
        <div className="adminLogin">
          <div className="adminLogo">
            <Lock />
          </div>
          <h1>لوحة إدارة RNM</h1>
          <p>الدخول مخصص للإدارة فقط لمراجعة طلبات الانضمام.</p>

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
    );
  }

  return (
    <main className="adminDashboard">
      <aside className="adminSide">
        <div className="sideBrand">
          <Crown />
          <h2>RNM</h2>
          <span>ADMIN PANEL</span>
        </div>

        <button onClick={loadApps}>تحديث الطلبات</button>
        <button onClick={() => go("/")}>فتح الموقع</button>

        <div className="sideStat">
          <b>{apps.length}</b>
          <span>إجمالي الطلبات</span>
        </div>
      </aside>

      <section className="adminContent">
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
                <Trophy />
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

              <video controls src={`${API}${a.video_url}`} />
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="emptyState">
              لا توجد طلبات مطابقة.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Footer() {
  return (
    <footer>
      <span>ONE CLAN</span>
      <b>RNM</b>
      <span>ONE HEART</span>
      <b>♛</b>
      <span>ONE LEGACY</span>
    </footer>
  );
}

function App() {
  const path = useRoute();
  const cleanPath = path.replace(/\/+$/, "") || "/";

  if (cleanPath === "/admin") return <Admin />;
  return <Home />;
}

createRoot(document.getElementById("root")).render(<App />);