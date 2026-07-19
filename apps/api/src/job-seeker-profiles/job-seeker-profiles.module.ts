import { Module } from "@nestjs/common";
import { JobSeekerProfilesController } from "./job-seeker-profiles.controller";
import { JobSeekerProfilesService } from "./job-seeker-profiles.service";
import { ResumeFilesController } from "./resume-files.controller";

@Module({
  controllers: [JobSeekerProfilesController, ResumeFilesController],
  providers: [JobSeekerProfilesService],
  exports: [JobSeekerProfilesService],
})
export class JobSeekerProfilesModule {}
