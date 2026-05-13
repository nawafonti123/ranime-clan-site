from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from datetime import datetime
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

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_BUCKET = os.getenv("SUPABASE_BUCKET", "application-videos")

supabase: Client | None = None
if SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)


def get_supabase() -> Client:
    if supabase is None:
        raise HTTPException(
            status_code=500,
            detail="Supabase env vars are missing: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY",
        )
    return supabase


@app.get("/")
def root():
    return {"message": "RANIME Gaming Backend Running With Supabase"}


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
):
    sb = get_supabase()

    allowed = {
        "video/mp4",
        "video/webm",
        "video/quicktime",
        "video/x-matroska",
    }

    if video.content_type not in allowed:
        return {"success": False, "message": "نوع الفيديو غير مدعوم"}

    ext = os.path.splitext(video.filename or "video.mp4")[1] or ".mp4"
    filename = f"{uuid.uuid4().hex}{ext}"
    storage_path = f"applications/{filename}"

    content = await video.read()

    try:
        sb.storage.from_(SUPABASE_BUCKET).upload(
            path=storage_path,
            file=content,
            file_options={
                "content-type": video.content_type or "video/mp4",
                "upsert": "false",
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage upload failed: {e}")

    public_url = sb.storage.from_(SUPABASE_BUCKET).get_public_url(storage_path)

    row = {
        "player_name": player_name,
        "pubg_id": pubg_id,
        "discord": discord,
        "device": device,
        "fps": fps,
        "role": role,
        "description": description,
        "video_url": public_url,
        "created_at": datetime.utcnow().isoformat(),
    }

    try:
        result = sb.table("applications").insert(row).execute()
        inserted = result.data[0] if result.data else row
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database insert failed: {e}")

    return {
        "success": True,
        "message": "تم رفع طلبك بنجاح، سيتم مراجعته من الإدارة.",
        "application_id": inserted.get("id"),
    }


@app.get("/api/applications")
def get_applications():
    sb = get_supabase()
    result = sb.table("applications").select("*").order("id", desc=True).execute()
    return result.data or []


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
