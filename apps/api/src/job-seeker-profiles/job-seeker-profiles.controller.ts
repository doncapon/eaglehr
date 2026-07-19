import { Body, Controller, Get, Patch, Post, Res, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  SubmitJobSeekerVerificationSchema,
  UpdateJobSeekerProfileSchema,
  type SubmitJobSeekerVerificationInput,
  type UpdateJobSeekerProfileInput,
} from "@eaglehr/types";
import type { Response } from "express";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtPayload } from "../auth/strategies/jwt.strategy";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { resumeUploadOptions } from "../common/storage/resume-storage";
import { createVerificationUploadOptions, verificationFilePath } from "../common/storage/verification-document-storage";
import { JobSeekerProfilesService } from "./job-seeker-profiles.service";

@Controller("me/profile")
export class JobSeekerProfilesController {
  constructor(private readonly profilesService: JobSeekerProfilesService) {}

  @Get()
  get(@CurrentUser() user: JwtPayload) {
    return this.profilesService.getByUserId(user.sub);
  }

  @Patch()
  upsert(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(UpdateJobSeekerProfileSchema)) body: UpdateJobSeekerProfileInput,
  ) {
    return this.profilesService.upsert(user.sub, body);
  }

  @Post("resume")
  @UseInterceptors(FileInterceptor("file", resumeUploadOptions))
  uploadResume(@CurrentUser() user: JwtPayload, @UploadedFile() file?: Express.Multer.File) {
    return this.profilesService.uploadResume(user.sub, file);
  }

  @Post("verification")
  @UseInterceptors(FileInterceptor("file", createVerificationUploadOptions("id-documents")))
  submitVerification(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(SubmitJobSeekerVerificationSchema)) body: SubmitJobSeekerVerificationInput,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.profilesService.submitVerification(user.sub, body, file);
  }

  @Get("verification/document")
  async downloadOwnVerificationDocument(@CurrentUser() user: JwtPayload, @Res() res: Response) {
    const { subdir, filename } = await this.profilesService.getOwnVerificationDocumentPath(user.sub);
    res.download(verificationFilePath(subdir, filename));
  }
}
