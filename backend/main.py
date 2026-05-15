from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from datetime import datetime
from urllib.parse import urlparse, unquote
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


def storage_path_from_public_url(video_url: str | None) -> str | None:
    """Extract applications/file.mp4 from a Supabase public storage URL."""
    if not video_url:
        return None

    try:
        parsed = urlparse(video_url)
        marker = f"/storage/v1/object/public/{SUPABASE_BUCKET}/"
        if marker not in parsed.path:
            return None
        path = parsed.path.split(marker, 1)[1]
        return unquote(path) if path else None
    except Exception:
        return None


VIDEO_ALLOWED_TYPES = {
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-matroska",
}


async def upload_video_to_storage(video: UploadFile, folder: str) -> tuple[str, str]:
    """Upload a video to Supabase storage and return (public_url, storage_path)."""
    sb = get_supabase()

    if video.content_type not in VIDEO_ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="نوع الفيديو غير مدعوم")

    ext = os.path.splitext(video.filename or "video.mp4")[1] or ".mp4"
    filename = f"{uuid.uuid4().hex}{ext}"
    storage_path = f"{folder}/{filename}"
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
    return public_url, storage_path


def safe_remove_storage_file(video_url: str | None) -> None:
    storage_path = storage_path_from_public_url(video_url)
    if not storage_path:
        return
    try:
        get_supabase().storage.from_(SUPABASE_BUCKET).remove([storage_path])
    except Exception:
        pass


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
    public_url, storage_path = await upload_video_to_storage(video, "applications")

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


@app.delete("/api/applications/{application_id}")
def delete_application(application_id: int):
    sb = get_supabase()

    try:
        found = (
            sb.table("applications")
            .select("id, video_url")
            .eq("id", application_id)
            .limit(1)
            .execute()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database read failed: {e}")

    if not found.data:
        raise HTTPException(status_code=404, detail="طلب التقديم غير موجود")

    video_url = found.data[0].get("video_url")
    storage_path = storage_path_from_public_url(video_url)

    if storage_path:
        try:
            sb.storage.from_(SUPABASE_BUCKET).remove([storage_path])
        except Exception:
            # لا نوقف حذف الطلب إذا فشل حذف الفيديو من التخزين
            pass

    try:
        sb.table("applications").delete().eq("id", application_id).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database delete failed: {e}")

    return {"success": True, "message": "تم حذف طلب التقديم بنجاح"}


# =========================
# SITE VIDEOS MANAGEMENT
# =========================

@app.get("/api/site-videos")
def get_site_videos():
    sb = get_supabase()
    try:
        result = (
            sb.table("site_videos")
            .select("*")
            .eq("is_active", True)
            .order("slot", desc=False)
            .order("id", desc=False)
            .execute()
        )
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Videos read failed: {e}")


@app.post("/api/site-videos")
async def create_site_video(
    title: str = Form(...),
    description: str = Form(""),
    slot: int = Form(1),
    video: UploadFile = File(...),
):
    sb = get_supabase()
    public_url, storage_path = await upload_video_to_storage(video, "site-videos")

    row = {
        "title": title,
        "description": description,
        "slot": slot,
        "video_url": public_url,
        "storage_path": storage_path,
        "is_active": True,
        "created_at": datetime.utcnow().isoformat(),
    }

    try:
        result = sb.table("site_videos").insert(row).execute()
        return {"success": True, "message": "تم إضافة الفيديو بنجاح", "video": (result.data or [row])[0]}
    except Exception as e:
        safe_remove_storage_file(public_url)
        raise HTTPException(status_code=500, detail=f"Video insert failed: {e}")


@app.put("/api/site-videos/{video_id}")
async def update_site_video(
    video_id: int,
    title: str = Form(...),
    description: str = Form(""),
    slot: int = Form(1),
    video: UploadFile | None = File(None),
):
    sb = get_supabase()

    try:
        found = sb.table("site_videos").select("*").eq("id", video_id).limit(1).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video read failed: {e}")

    if not found.data:
        raise HTTPException(status_code=404, detail="الفيديو غير موجود")

    updates = {
        "title": title,
        "description": description,
        "slot": slot,
    }

    old_video_url = found.data[0].get("video_url")

    if video is not None:
        public_url, storage_path = await upload_video_to_storage(video, "site-videos")
        updates["video_url"] = public_url
        updates["storage_path"] = storage_path

    try:
        result = sb.table("site_videos").update(updates).eq("id", video_id).execute()
        if video is not None:
            safe_remove_storage_file(old_video_url)
        return {"success": True, "message": "تم تحديث الفيديو", "video": (result.data or [updates])[0]}
    except Exception as e:
        if video is not None:
            safe_remove_storage_file(updates.get("video_url"))
        raise HTTPException(status_code=500, detail=f"Video update failed: {e}")


@app.delete("/api/site-videos/{video_id}")
def delete_site_video(video_id: int):
    sb = get_supabase()

    try:
        found = sb.table("site_videos").select("id, video_url").eq("id", video_id).limit(1).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video read failed: {e}")

    if not found.data:
        raise HTTPException(status_code=404, detail="الفيديو غير موجود")

    safe_remove_storage_file(found.data[0].get("video_url"))

    try:
        sb.table("site_videos").delete().eq("id", video_id).execute()
        return {"success": True, "message": "تم حذف الفيديو"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video delete failed: {e}")


# =========================
# VISITOR VIDEO REQUESTS
# =========================

@app.post("/api/video-requests")
async def create_video_request(
    visitor_name: str = Form(...),
    contact: str = Form(""),
    title: str = Form(...),
    description: str = Form(""),
    video: UploadFile = File(...),
):
    sb = get_supabase()
    public_url, storage_path = await upload_video_to_storage(video, "video-requests")

    row = {
        "visitor_name": visitor_name,
        "contact": contact,
        "title": title,
        "description": description,
        "video_url": public_url,
        "storage_path": storage_path,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
    }

    try:
        result = sb.table("video_requests").insert(row).execute()
        return {"success": True, "message": "تم إرسال طلب الفيديو للإدارة", "request": (result.data or [row])[0]}
    except Exception as e:
        safe_remove_storage_file(public_url)
        raise HTTPException(status_code=500, detail=f"Video request insert failed: {e}")


@app.get("/api/video-requests")
def get_video_requests(status: str | None = None):
    sb = get_supabase()

    try:
        query = sb.table("video_requests").select("*")
        if status:
            query = query.eq("status", status)
        result = query.order("id", desc=True).execute()
        return result.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video requests read failed: {e}")


@app.post("/api/video-requests/{request_id}/approve")
def approve_video_request(request_id: int):
    sb = get_supabase()

    try:
        found = sb.table("video_requests").select("*").eq("id", request_id).limit(1).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video request read failed: {e}")

    if not found.data:
        raise HTTPException(status_code=404, detail="طلب الفيديو غير موجود")

    req = found.data[0]

    try:
        sb.table("video_requests").update(
            {"status": "approved", "reviewed_at": datetime.utcnow().isoformat()}
        ).eq("id", request_id).execute()

        design_row = {
            "title": req.get("title") or "تصميم جديد",
            "description": req.get("description") or "",
            "slot": 99,
            "video_url": req.get("video_url"),
            "storage_path": req.get("storage_path"),
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
        }
        inserted = sb.table("site_videos").insert(design_row).execute()
        return {"success": True, "message": "تم قبول الفيديو ونشره في قسم التصاميم", "video": (inserted.data or [design_row])[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video request approve failed: {e}")


@app.post("/api/video-requests/{request_id}/reject")
def reject_video_request(request_id: int):
    sb = get_supabase()

    try:
        found = sb.table("video_requests").select("*").eq("id", request_id).limit(1).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video request read failed: {e}")

    if not found.data:
        raise HTTPException(status_code=404, detail="طلب الفيديو غير موجود")

    safe_remove_storage_file(found.data[0].get("video_url"))

    try:
        sb.table("video_requests").update(
            {"status": "rejected", "reviewed_at": datetime.utcnow().isoformat()}
        ).eq("id", request_id).execute()
        return {"success": True, "message": "تم رفض طلب الفيديو"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video request reject failed: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
