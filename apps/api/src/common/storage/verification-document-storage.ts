import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, unlink } from "node:fs";
import { join } from "node:path";
import { BadRequestException } from "@nestjs/common";
import { diskStorage } from "multer";

// Local-disk storage for KYC-style verification documents (NIN/ID slips,
// CAC certificates, proof of address). Unlike resumes, these are never
// served through a public URL — only the owner or a platform admin may
// download them, via authenticated controller routes.

const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png"]);

// 15MB: phone camera photos of an ID (the common case for this upload) routinely
// run 8-15MB straight off the camera, well past a desktop-oriented 5MB cap.
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

function sanitizeOriginalName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-80);
}

function uploadDirFor(subdir: string): string {
  const dir = join(process.cwd(), "uploads", subdir);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function createVerificationUploadOptions(subdir: string) {
  return {
    storage: diskStorage({
      destination: uploadDirFor(subdir),
      filename: (_req, file, callback) => {
        callback(null, `${randomUUID()}__${sanitizeOriginalName(file.originalname)}`);
      },
    }),
    fileFilter: (_req: unknown, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        callback(new BadRequestException("Only PDF, JPG, or PNG files are allowed"), false);
        return;
      }
      callback(null, true);
    },
    limits: { fileSize: MAX_FILE_SIZE_BYTES },
  };
}

const SAFE_STORED_FILENAME = /^[0-9a-f-]{36}__[a-zA-Z0-9.\-_]+$/;

export function isValidStoredFilename(filename: string): boolean {
  return SAFE_STORED_FILENAME.test(filename);
}

export function verificationFilePath(subdir: string, storedFilename: string): string {
  return join(process.cwd(), "uploads", subdir, storedFilename);
}

/** Extracts the stored filename from a `fileUrl` value shaped like `/me/profile/verification/document/<filename>`. */
export function storedFilenameFromUrl(fileUrl: string | null | undefined): string | null {
  if (!fileUrl) return null;
  const filename = fileUrl.split("/").pop();
  return filename && isValidStoredFilename(filename) ? filename : null;
}

export async function deleteVerificationFile(subdir: string, fileUrl: string | null | undefined): Promise<void> {
  const filename = storedFilenameFromUrl(fileUrl);
  if (!filename) return;
  await new Promise<void>((resolve) => {
    unlink(verificationFilePath(subdir, filename), () => resolve());
  });
}
