import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { SubmitJobSeekerVerificationInput, UpdateJobSeekerProfileInput } from "@eaglehr/types";
import { deleteResumeFileByUrl } from "../common/storage/resume-storage";
import { deleteVerificationFile } from "../common/storage/verification-document-storage";
import { PrismaService } from "../prisma/prisma.service";

const ID_DOCUMENT_SUBDIR = "id-documents";

@Injectable()
export class JobSeekerProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  getByUserId(userId: string) {
    return this.prisma.jobSeekerProfile.findUnique({ where: { userId } });
  }

  upsert(userId: string, input: UpdateJobSeekerProfileInput) {
    return this.prisma.jobSeekerProfile.upsert({
      where: { userId },
      create: { userId, ...input },
      update: input,
    });
  }

  async uploadResume(userId: string, file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException("No file was uploaded");
    }

    const existing = await this.prisma.jobSeekerProfile.findUnique({ where: { userId } });
    const apiPublicUrl = this.config.get<string>("API_PUBLIC_URL") ?? "http://localhost:4000";
    const resumeUrl = `${apiPublicUrl}/resumes/${file.filename}`;

    const profile = await this.prisma.jobSeekerProfile.upsert({
      where: { userId },
      create: { userId, resumeUrl },
      update: { resumeUrl },
    });

    // Best-effort cleanup of the previous file so uploads don't pile up on disk.
    if (existing?.resumeUrl && existing.resumeUrl !== resumeUrl) {
      await deleteResumeFileByUrl(existing.resumeUrl);
    }

    return profile;
  }

  async submitVerification(
    userId: string,
    input: SubmitJobSeekerVerificationInput,
    file: Express.Multer.File | undefined,
  ) {
    if (!file) {
      throw new BadRequestException("Please upload a photo or scan of your NIN slip or ID card");
    }

    const existing = await this.prisma.jobSeekerProfile.findUnique({ where: { userId } });

    const profile = await this.prisma.jobSeekerProfile.upsert({
      where: { userId },
      create: {
        userId,
        nin: input.nin,
        idDocumentUrl: file.filename,
        verificationStatus: "PENDING",
      },
      update: {
        nin: input.nin,
        idDocumentUrl: file.filename,
        verificationStatus: "PENDING",
        verificationNote: null,
        verifiedAt: null,
      },
    });

    if (existing?.idDocumentUrl && existing.idDocumentUrl !== file.filename) {
      await deleteVerificationFile(ID_DOCUMENT_SUBDIR, existing.idDocumentUrl);
    }

    return profile;
  }

  async getOwnVerificationDocumentPath(userId: string) {
    const profile = await this.prisma.jobSeekerProfile.findUnique({ where: { userId } });
    if (!profile?.idDocumentUrl) {
      throw new NotFoundException("No verification document on file");
    }
    return { subdir: ID_DOCUMENT_SUBDIR, filename: profile.idDocumentUrl };
  }
}
