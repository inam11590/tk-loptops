import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/guard";
import { recordAuditLog } from "@/lib/auditLog";

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function POST(request: Request) {
  const guard = await requireAdminApi();
  if (!guard.authorized) {
    return guard.response;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    const ext = ALLOWED_MIME_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        {
          error:
            "Unsupported file format. Only JPG, PNG, and WebP images are allowed.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: "Image exceeds the 2 MB maximum file size limit.",
        },
        { status: 400 }
      );
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const baseName =
      path
        .basename(file.name, path.extname(file.name))
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "laptop";

    const uniqueFileName = `${baseName}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 7)}${ext}`;
    const targetPath = path.join(uploadsDir, uniqueFileName);

    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(arrayBuffer));

    const publicUrl = `/uploads/${uniqueFileName}`;

    recordAuditLog({
      actor: {
        id: guard.admin.id,
        fullName: guard.admin.fullName,
        email: guard.admin.email,
      },
      action: "product.image_upload",
      entityType: "product",
      entityId: uniqueFileName,
      summary: `Uploaded product image ${uniqueFileName} (${Math.round(
        file.size / 1024
      )} KB)`,
    });

    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to upload image." },
      { status: 500 }
    );
  }
}
