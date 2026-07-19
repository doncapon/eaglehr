import { Controller, Get, Param, Query } from "@nestjs/common";
import { CompanyQuerySchema, type CompanyQueryInput } from "@eaglehr/types";
import { Public } from "../auth/decorators/public.decorator";
import { ZodValidationPipe } from "../common/pipes/zod-validation.pipe";
import { OrganizationsService } from "./organizations.service";

@Controller("companies")
export class PublicCompaniesController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Public()
  @Get()
  list(@Query(new ZodValidationPipe(CompanyQuerySchema)) query: CompanyQueryInput) {
    return this.organizationsService.publicList(query);
  }

  @Public()
  @Get(":slug")
  findOne(@Param("slug") slug: string) {
    return this.organizationsService.publicFindBySlug(slug);
  }
}
