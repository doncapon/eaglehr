import { Controller, Get, Param, Query } from "@nestjs/common";
import { JobQuerySchema, type JobQueryInput } from "@eaglehr/types";
import { Public } from "../auth/decorators/public.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { JobsService } from "./jobs.service";

@Controller("jobs")
export class JobsPublicController {
  constructor(private readonly jobsService: JobsService) {}

  @Public()
  @Get()
  list(@Query(new ZodValidationPipe(JobQuerySchema)) query: JobQueryInput) {
    return this.jobsService.publicList(query);
  }

  @Public()
  @Get("salary-range")
  salaryRange() {
    return this.jobsService.publicSalaryRange();
  }

  @Public()
  @Get("filter-facets")
  filterFacets() {
    return this.jobsService.publicFilterFacets();
  }

  @Public()
  @Get(":slugOrId")
  findOne(@Param("slugOrId") slugOrId: string) {
    return this.jobsService.publicFindBySlugOrId(slugOrId);
  }
}
