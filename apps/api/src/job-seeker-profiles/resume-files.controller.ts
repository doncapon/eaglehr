import { existsSync } from "node:fs";
import { Controller, Get, NotFoundException, Param, Res } from "@nestjs/common";
import type { Response } from "express";
import { Public } from "../auth/decorators/public.decorator";
import { isValidStoredFilename, resumeDownloadFilename, resumeFilePath } from "../common/storage/resume-storage";

@Controller("resumes")
export class ResumeFilesController {
  @Public()
  @Get(":filename")
  download(@Param("filename") filename: string, @Res() res: Response) {
    if (!isValidStoredFilename(filename)) {
      throw new NotFoundException("Resume not found");
    }

    const filePath = resumeFilePath(filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException("Resume not found");
    }

    res.download(filePath, resumeDownloadFilename(filename));
  }
}
