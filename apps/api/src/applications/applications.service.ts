import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import type { ApplyToJobInput, UpdateApplicationStatusInput } from "@eaglehr/types";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async apply(jobId: string, userId: string, input: ApplyToJobInput) {
    const profile = await this.prisma.jobSeekerProfile.findUnique({ where: { userId } });
    if (!profile) {
      throw new BadRequestException("Complete your job seeker profile before applying");
    }

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== "PUBLISHED") {
      throw new NotFoundException("Job not found or not accepting applications");
    }

    const existing = await this.prisma.application.findUnique({
      where: { jobId_jobSeekerProfileId: { jobId, jobSeekerProfileId: profile.id } },
    });
    if (existing) {
      throw new ConflictException("You have already applied to this job");
    }

    return this.prisma.application.create({
      data: {
        jobId,
        jobSeekerProfileId: profile.id,
        coverLetter: input.coverLetter,
        expectedSalaryKobo: input.expectedSalaryKobo,
        resumeUrlSnapshot: profile.resumeUrl,
      },
    });
  }

  async myApplications(userId: string) {
    const profile = await this.prisma.jobSeekerProfile.findUnique({ where: { userId } });
    if (!profile) {
      return [];
    }
    return this.prisma.application.findMany({
      where: { jobSeekerProfileId: profile.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            organization: { select: { id: true, name: true, logoUrl: true } },
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });
  }

  async listForOrgJob(organizationId: string, jobId: string) {
    const job = await this.prisma.job.findFirst({ where: { id: jobId, organizationId } });
    if (!job) {
      throw new NotFoundException("Job not found");
    }
    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        jobSeekerProfile: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
          },
        },
      },
      orderBy: { appliedAt: "asc" },
    });
  }

  async updateStatus(organizationId: string, applicationId: string, input: UpdateApplicationStatusInput) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });
    if (!application || application.job.organizationId !== organizationId) {
      throw new NotFoundException("Application not found");
    }
    return this.prisma.application.update({ where: { id: applicationId }, data: { status: input.status } });
  }
}
