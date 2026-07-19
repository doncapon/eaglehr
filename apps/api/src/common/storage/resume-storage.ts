import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, unlink } from "node:fs";
import { join } from "node:path";
import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";

// Local-disk resume storage for dev. Every consumer of this file only deals
// with (filename in, URL out) — swapping to S3/R2 later means rewriting this
// file alone, not the controllers/services that use it.

export const RESUME_UPLOAD_DIR = join(process.cwd(), "uploads", "resumes");

if (!existsSync(RESUME_UPLOAD_DIR)) {
  mkdirSync(RESUME_UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function sanitizeOriginalName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-80);
}

export const resumeUploadOptions = {
  storage: diskStorage({
    destination: RESUME_UPLOAD_DIR,
    filename: (_req, file, callback) => {
      const safeOriginal = sanitizeOriginalName(file.originalname);
      callback(null, `${randomUUID()}__${safeOriginal}`);
    },
  }),
  fileFilter: (_req: unknown, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(new BadRequestException("Only PDF, DOC, or DOCX files are allowed"), false);
      return;
    }
    callback(null, true);
  },
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
};

/** Matches `<uuid>__<sanitized-original-name>` — rejects path traversal or unexpected shapes. */
const SAFE_STORED_FILENAME = /^[0-9a-f-]{36}__[a-zA-Z0-9.\-_]+$/;

export function isValidStoredFilename(filename: string): boolean {
  return SAFE_STORED_FILENAME.test(filename);
}

export function resumeFilePath(storedFilename: string): string {
  return join(RESUME_UPLOAD_DIR, storedFilename);
}

/** The human-friendly name to show as the downloaded file, stripped of our UUID prefix. */
export function resumeDownloadFilename(storedFilename: string): string {
  const idx = storedFilename.indexOf("__");
  return idx >= 0 ? storedFilename.slice(idx + 2) : storedFilename;
}

export async function deleteResumeFileByUrl(resumeUrl: string | null | undefined): Promise<void> {
  if (!resumeUrl) return;
  const filename = resumeUrl.split("/").pop();
  if (!filename || !isValidStoredFilename(filename)) return;

  await new Promise<void>((resolve) => {
    unlink(resumeFilePath(filename), () => resolve()); // swallow errors — e.g. already gone
  });
}
