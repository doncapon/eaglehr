import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { CreateJobInput, JobQueryInput, UpdateJobInput } from "@eaglehr/types";
import { slugify } from "../common/utils/slugify";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lazily flips expired boosts back off — cheap enough to run alongside every public job listing query. */
  private async expireStaleBoosts() {
    await this.prisma.job.updateMany({
      where: { isBoosted: true, boostExpiresAt: { lt: new Date() } },
      data: { isBoosted: false },
    });
  }

  async publicList(query: JobQueryInput) {
    const where = {
      status: "PUBLISHED" as const,
      ...(query.state ? { state: query.state } : {}),
      ...(query.employmentType?.length ? { employmentType: { in: query.employmentType } } : {}),
      ...(query.workMode?.length ? { workMode: { in: query.workMode } } : {}),
      ...(query.industry?.length ? { organization: { industry: { in: query.industry } } } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: "insensitive" as const } },
              { description: { contains: query.q, mode: "insensitive" as const } },
              { organization: { name: { contains: query.q, mode: "insensitive" as const } } },
            ],
          }
        : {}),
      // A job's range overlaps the requested [min, max] window; salary must be public to be filterable.
      ...(query.minSalaryKobo !== undefined || query.maxSalaryKobo !== undefined
        ? {
            salaryIsPublic: true,
            ...(query.maxSalaryKobo !== undefined ? { salaryMinKobo: { lte: query.maxSalaryKobo } } : {}),
            ...(query.minSalaryKobo !== undefined ? { salaryMaxKobo: { gte: query.minSalaryKobo } } : {}),
          }
        : {}),
    };

    // Runs concurrently with the reads below rather than blocking them — a job whose boost
    // expires in the same instant may sort as still-boosted for one more request, which is
    // fine for a "lazily corrected" background cleanup.
    const [, items, total] = await Promise.all([
      this.expireStaleBoosts(),
      this.prisma.job.findMany({
        where,
        include: { organization: { select: { id: true, name: true, slug: true, logoUrl: true } } },
        orderBy: [{ isBoosted: "desc" }, { publishedAt: "desc" }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.job.count({ where }),
    ]);

    return { items, total, page: query.page, limit: query.limit };
  }

  async publicSalaryRange() {
    // Doesn't touch isBoosted, so no need to run the boost-expiry sweep here.
    const result = await this.prisma.job.aggregate({
      where: { status: "PUBLISHED", salaryIsPublic: true },
      _min: { salaryMinKobo: true },
      _max: { salaryMaxKobo: true },
    });
    return {
      minKobo: result._min.salaryMinKobo ?? 0,
      maxKobo: result._max.salaryMaxKobo ?? 0,
    };
  }

  async publicIndustries() {
    // Doesn't touch isBoosted, so no need to run the boost-expiry sweep here.
    const rows = await this.prisma.job.findMany({
      where: { status: "PUBLISHED", organization: { industry: { not: null } } },
      select: { organization: { select: { industry: true } } },
    });
    const counts = new Map<string, number>();
    for (const row of rows) {
      const industry = row.organization.industry;
      if (!industry) continue;
      counts.set(industry, (counts.get(industry) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([industry, count]) => ({ industry, count }))
      .sort((a, b) => a.industry.localeCompare(b.industry));
  }

  async publicFindBySlugOrId(slugOrId: string) {
    const job = await this.prisma.job.findFirst({
      where: { OR: [{ slug: slugOrId }, { id: slugOrId }], status: "PUBLISHED" },
      include: { organization: { select: { id: true, name: true, slug: true, logoUrl: true, websiteUrl: true } } },
    });
    if (!job) {
      throw new NotFoundException("Job not found");
    }
    await this.prisma.job.update({ where: { id: job.id }, data: { viewCount: { increment: 1 } } });
    return job;
  }

  async createForOrg(organizationId: string, userId: string, input: CreateJobInput) {
    const baseSlug = slugify(input.title) || "job";
    let slug = baseSlug;
    let suffix = 1;
    while (await this.prisma.job.findUnique({ where: { slug } })) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    return this.prisma.job.create({
      data: {
        ...input,
        organizationId,
        createdByUserId: userId,
        slug,
      },
    });
  }

  listForOrg(organizationId: string) {
    return this.prisma.job.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOrgJobOrThrow(organizationId: string, jobId: string) {
    const job = await this.prisma.job.findFirst({ where: { id: jobId, organizationId } });
    if (!job) {
      throw new NotFoundException("Job not found");
    }
    return job;
  }

  async update(organizationId: string, jobId: string, input: UpdateJobInput) {
    await this.findOrgJobOrThrow(organizationId, jobId);
    return this.prisma.job.update({ where: { id: jobId }, data: input });
  }

  async remove(organizationId: string, jobId: string) {
    await this.findOrgJobOrThrow(organizationId, jobId);
    await this.prisma.job.delete({ where: { id: jobId } });
    return { success: true };
  }

  async publish(organizationId: string, jobId: string) {
    const job = await this.findOrgJobOrThrow(organizationId, jobId);
    if (job.status === "PUBLISHED") {
      throw new ForbiddenException("Job is already published");
    }
    return this.prisma.job.update({
      where: { id: jobId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
  }
}
