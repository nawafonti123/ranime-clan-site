from fastapi import FastAPI, UploadFile, File, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from datetime import datetime
import shutil
import os
import uuid

app = FastAPI(title="RANIME Gaming API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

DATABASE_URL = "sqlite:///./ranime.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    player_name = Column(String(120), nullable=False)
    pubg_id = Column(String(80), nullable=False)
    discord = Column(String(120), nullable=True)
    device = Column(String(80), nullable=True)
    fps = Column(String(50), nullable=True)
    role = Column(String(80), nullable=True)
    description = Column(Text, nullable=True)
    video_url = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "RANIME Gaming Backend Running"}

@app.post("/api/apply")
async def apply_to_clan(
    player_name: str = Form(...),
    pubg_id: str = Form(...),
    discord: str = Form(""),
    device: str = Form(""),
    fps: str = Form(""),
    role: str = Form(""),
    description: str = Form(""),
    video: UploadFile = File(...),
    db: Session = Depends(db_session)
):
    allowed = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"]
    if video.content_type not in allowed:
        return {"success": False, "message": "نوع الفيديو غير مدعوم"}

    ext = os.path.splitext(video.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(video.file, buffer)

    app_record = Application(
        player_name=player_name,
        pubg_id=pubg_id,
        discord=discord,
        device=device,
        fps=fps,
        role=role,
        description=description,
        video_url=f"/uploads/{filename}"
    )

    db.add(app_record)
    db.commit()
    db.refresh(app_record)

    return {
        "success": True,
        "message": "تم رفع طلبك بنجاح، سيتم مراجعته من الإدارة.",
        "application_id": app_record.id
    }

@app.get("/api/applications")
def get_applications(db: Session = Depends(db_session)):
    items = db.query(Application).order_by(Application.id.desc()).all()
    return [
        {
            "id": x.id,
            "player_name": x.player_name,
            "pubg_id": x.pubg_id,
            "discord": x.discord,
            "device": x.device,
            "fps": x.fps,
            "role": x.role,
            "description": x.description,
            "video_url": x.video_url,
            "created_at": x.created_at.isoformat()
        }
        for x in items
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)