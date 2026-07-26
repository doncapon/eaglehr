import bcrypt from "bcryptjs";
import {
  ApplicationStatus,
  BillingInterval,
  EmploymentType,
  InvitationStatus,
  NigeriaState,
  OrgRole,
  OrgSize,
  PaymentPurpose,
  PaymentStatus,
  PrismaClient,
  SubscriptionStatus,
  WorkMode,
} from "../generated/client";

const prisma = new PrismaClient();

// Every seeded person account uses this password so it's easy to log in and demo the app.
const DEMO_PASSWORD = "Password123!";

const plans = [
  {
    code: "starter",
    name: "Starter",
    description: "For small teams hiring occasionally.",
    priceKobo: 1_500_000, // NGN 15,000/mo
    billingInterval: BillingInterval.MONTHLY,
    maxActiveJobs: 3,
    maxTeamMembers: 2,
    features: ["3 active job posts", "2 HR team seats", "Email support"],
  },
  {
    code: "growth",
    name: "Growth",
    description: "For growing companies hiring regularly.",
    priceKobo: 4_500_000, // NGN 45,000/mo
    billingInterval: BillingInterval.MONTHLY,
    maxActiveJobs: 15,
    maxTeamMembers: 8,
    features: ["15 active job posts", "8 HR team seats", "Job boosts", "Priority support"],
  },
  {
    code: "scale",
    name: "Scale",
    description: "For larger organizations with high-volume hiring.",
    priceKobo: 12_000_000, // NGN 120,000/mo
    billingInterval: BillingInterval.MONTHLY,
    maxActiveJobs: 50,
    maxTeamMembers: 25,
    features: ["50 active job posts", "25 HR team seats", "Unlimited job boosts", "Dedicated support"],
  },
];

interface SeedUser {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

const employerOwners: SeedUser[] = [
  { email: "ada@zenithfoods.ng", firstName: "Ada", lastName: "Okafor", phone: "+2348021234501" },
  { email: "emeka@paynaija.com", firstName: "Emeka", lastName: "Chukwu", phone: "+2348021234502" },
  { email: "amaka@greenacre.ng", firstName: "Amaka", lastName: "Eze", phone: "+2348021234503" },
  { email: "chinedu@sahara-energy.ng", firstName: "Chinedu", lastName: "Okoro", phone: "+2348021234504" },
  { email: "amara@lagosdigitalhealth.com", firstName: "Amara", lastName: "Nwachukwu", phone: "+2348021234505" },
  { email: "ifeoma@naijathreads.com", firstName: "Ifeoma", lastName: "Balogun", phone: "+2348021234506" },
  { email: "musa@kadunaagrotech.ng", firstName: "Musa", lastName: "Abdullahi", phone: "+2348021234507" },
  { email: "grace@abujarealty.com", firstName: "Grace", lastName: "Adeyinka", phone: "+2348021234508" },
  { email: "segun@swiftpaymfb.com", firstName: "Segun", lastName: "Afolabi", phone: "+2348021234509" },
  { email: "blessing@edubridge.ng", firstName: "Blessing", lastName: "Okonkwo", phone: "+2348021234510" },
  { email: "tobenna@coastalfreight.ng", firstName: "Tobenna", lastName: "Uzo", phone: "+2348021234511" },
  { email: "aisha@savannatelecom.com", firstName: "Aisha", lastName: "Mohammed", phone: "+2348021234512" },
  { email: "femi@buildright.ng", firstName: "Femi", lastName: "Adebayo", phone: "+2348021234513" },
];

const employerStaff: SeedUser[] = [
  { email: "bola@zenithfoods.ng", firstName: "Bola", lastName: "Adeyemi" },
  { email: "yusuf@paynaija.com", firstName: "Yusuf", lastName: "Ibrahim" },
  { email: "hauwa@swiftpaymfb.com", firstName: "Hauwa", lastName: "Garba" },
  { email: "victor@savannatelecom.com", firstName: "Victor", lastName: "Eze" },
];

const jobSeekers: (SeedUser & {
  headline: string;
  yearsOfExperience: number;
  state: NigeriaState;
  city: string;
  skills: string[];
})[] = [
  {
    email: "chidi.eze@gmail.com",
    firstName: "Chidi",
    lastName: "Eze",
    headline: "Backend Developer",
    yearsOfExperience: 4,
    state: NigeriaState.LAGOS,
    city: "Yaba",
    skills: ["Node.js", "PostgreSQL", "TypeScript"],
  },
  {
    email: "ngozi.obi@gmail.com",
    firstName: "Ngozi",
    lastName: "Obi",
    headline: "Product Designer",
    yearsOfExperience: 5,
    state: NigeriaState.FCT_ABUJA,
    city: "Garki",
    skills: ["Figma", "User Research", "Design Systems"],
  },
  {
    email: "tunde.oluwaseun@gmail.com",
    firstName: "Tunde",
    lastName: "Oluwaseun",
    headline: "Data Analyst",
    yearsOfExperience: 3,
    state: NigeriaState.LAGOS,
    city: "Surulere",
    skills: ["SQL", "Python", "Power BI"],
  },
  {
    email: "fatima.sule@gmail.com",
    firstName: "Fatima",
    lastName: "Sule",
    headline: "Marketing Manager",
    yearsOfExperience: 6,
    state: NigeriaState.KANO,
    city: "Kano",
    skills: ["Brand Strategy", "Digital Marketing", "SEO"],
  },
  {
    email: "kelechi.nwosu@gmail.com",
    firstName: "Kelechi",
    lastName: "Nwosu",
    headline: "DevOps Engineer",
    yearsOfExperience: 5,
    state: NigeriaState.RIVERS,
    city: "Port Harcourt",
    skills: ["AWS", "Docker", "Kubernetes", "Terraform"],
  },
  {
    email: "ibrahim.yusuf@gmail.com",
    firstName: "Ibrahim",
    lastName: "Yusuf",
    headline: "Civil Site Engineer",
    yearsOfExperience: 6,
    state: NigeriaState.FCT_ABUJA,
    city: "Gwarinpa",
    skills: ["AutoCAD", "Site Supervision", "Structural Design"],
  },
  {
    email: "chiamaka.okafor@gmail.com",
    firstName: "Chiamaka",
    lastName: "Okafor",
    headline: "Registered Nurse",
    yearsOfExperience: 4,
    state: NigeriaState.LAGOS,
    city: "Ikoyi",
    skills: ["Patient Care", "Clinical Coordination", "Telemedicine"],
  },
  {
    email: "bashir.aliyu@gmail.com",
    firstName: "Bashir",
    lastName: "Aliyu",
    headline: "Network Operations Engineer",
    yearsOfExperience: 5,
    state: NigeriaState.KANO,
    city: "Kano",
    skills: ["Network Engineering", "Cisco", "Telecoms Infrastructure"],
  },
  {
    email: "funmilayo.adekunle@gmail.com",
    firstName: "Funmilayo",
    lastName: "Adekunle",
    headline: "E-commerce Manager",
    yearsOfExperience: 4,
    state: NigeriaState.LAGOS,
    city: "Lekki",
    skills: ["Shopify", "Retail Marketing", "Merchandising"],
  },
  {
    email: "emmanuel.etim@gmail.com",
    firstName: "Emmanuel",
    lastName: "Etim",
    headline: "Procurement & Supply Chain Specialist",
    yearsOfExperience: 7,
    state: NigeriaState.RIVERS,
    city: "Port Harcourt",
    skills: ["Procurement", "Vendor Management", "Logistics Planning"],
  },
];

interface SeedOrg {
  slug: string;
  name: string;
  industry: string;
  size: OrgSize;
  websiteUrl: string;
  ownerEmail: string;
  staffEmail?: string;
  staffRole?: OrgRole;
  boosted?: boolean;
}

const organizations: SeedOrg[] = [
  {
    slug: "zenith-foods-ltd",
    name: "Zenith Foods Ltd",
    industry: "FMCG",
    size: OrgSize.SIZE_51_200,
    websiteUrl: "https://zenithfoods.ng",
    ownerEmail: "ada@zenithfoods.ng",
    staffEmail: "bola@zenithfoods.ng",
    staffRole: OrgRole.RECRUITER,
    boosted: true,
  },
  {
    slug: "paynaija-technologies",
    name: "PayNaija Technologies",
    industry: "Fintech",
    size: OrgSize.SIZE_11_50,
    websiteUrl: "https://paynaija.com",
    ownerEmail: "emeka@paynaija.com",
    staffEmail: "yusuf@paynaija.com",
    staffRole: OrgRole.ADMIN,
  },
  {
    slug: "greenacre-logistics",
    name: "GreenAcre Logistics",
    industry: "Logistics",
    size: OrgSize.SIZE_201_500,
    websiteUrl: "https://greenacrelogistics.ng",
    ownerEmail: "amaka@greenacre.ng",
  },
  {
    slug: "sahara-energy-resources",
    name: "Sahara Energy Resources",
    industry: "Oil & Gas",
    size: OrgSize.SIZE_201_500,
    websiteUrl: "https://sahara-energy.ng",
    ownerEmail: "chinedu@sahara-energy.ng",
  },
  {
    slug: "lagos-digital-health",
    name: "Lagos Digital Health",
    industry: "Healthtech",
    size: OrgSize.SIZE_11_50,
    websiteUrl: "https://lagosdigitalhealth.com",
    ownerEmail: "amara@lagosdigitalhealth.com",
    boosted: true,
  },
  {
    slug: "naija-threads",
    name: "Naija Threads",
    industry: "Fashion & Retail",
    size: OrgSize.SIZE_51_200,
    websiteUrl: "https://naijathreads.com",
    ownerEmail: "ifeoma@naijathreads.com",
  },
  {
    slug: "kaduna-agrotech",
    name: "Kaduna AgroTech",
    industry: "Agriculture",
    size: OrgSize.SIZE_11_50,
    websiteUrl: "https://kadunaagrotech.ng",
    ownerEmail: "musa@kadunaagrotech.ng",
  },
  {
    slug: "abuja-realty-partners",
    name: "Abuja Realty Partners",
    industry: "Real Estate",
    size: OrgSize.SIZE_1_10,
    websiteUrl: "https://abujarealty.com",
    ownerEmail: "grace@abujarealty.com",
  },
  {
    slug: "swiftpay-microfinance-bank",
    name: "SwiftPay Microfinance Bank",
    industry: "Banking",
    size: OrgSize.SIZE_201_500,
    websiteUrl: "https://swiftpaymfb.com",
    ownerEmail: "segun@swiftpaymfb.com",
    staffEmail: "hauwa@swiftpaymfb.com",
    staffRole: OrgRole.ADMIN,
  },
  {
    slug: "edubridge-nigeria",
    name: "EduBridge Nigeria",
    industry: "Edtech",
    size: OrgSize.SIZE_11_50,
    websiteUrl: "https://edubridge.ng",
    ownerEmail: "blessing@edubridge.ng",
  },
  {
    slug: "coastal-freight-marine",
    name: "Coastal Freight & Marine",
    industry: "Logistics",
    size: OrgSize.SIZE_51_200,
    websiteUrl: "https://coastalfreight.ng",
    ownerEmail: "tobenna@coastalfreight.ng",
  },
  {
    slug: "savanna-telecom",
    name: "Savanna Telecom",
    industry: "Telecoms",
    size: OrgSize.SIZE_500_PLUS,
    websiteUrl: "https://savannatelecom.com",
    ownerEmail: "aisha@savannatelecom.com",
    staffEmail: "victor@savannatelecom.com",
    staffRole: OrgRole.RECRUITER,
  },
  {
    slug: "buildright-construction",
    name: "BuildRight Construction",
    industry: "Construction",
    size: OrgSize.SIZE_51_200,
    websiteUrl: "https://buildright.ng",
    ownerEmail: "femi@buildright.ng",
  },
];

interface SeedJob {
  slug: string;
  orgSlug: string;
  title: string;
  description: string;
  responsibilities: string;
  requirements: string;
  employmentType: EmploymentType;
  workMode: WorkMode;
  state: NigeriaState;
  city: string;
  salaryMinKobo: number;
  salaryMaxKobo: number;
  published: boolean;
  boosted?: boolean;
}

const jobs: SeedJob[] = [
  {
    slug: "backend-engineer-zenith",
    orgSlug: "zenith-foods-ltd",
    title: "Backend Engineer",
    description: "Build and maintain the core backend services powering Zenith Foods' distribution network.",
    responsibilities: "Design APIs, own the order-management service, mentor junior engineers.",
    requirements: "3+ years with Node.js and PostgreSQL, comfortable owning production systems.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    state: NigeriaState.LAGOS,
    city: "Ikeja",
    salaryMinKobo: 70_000_000,
    salaryMaxKobo: 110_000_000,
    published: true,
  },
  {
    slug: "hr-business-partner-zenith",
    orgSlug: "zenith-foods-ltd",
    title: "HR Business Partner",
    description: "Partner with department heads to build out HR policy and manage employee relations.",
    responsibilities: "Lead recruitment drives, manage performance reviews, advise on labour compliance.",
    requirements: "5+ years in HR, familiarity with Nigerian labour law.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.LAGOS,
    city: "Victoria Island",
    salaryMinKobo: 50_000_000,
    salaryMaxKobo: 80_000_000,
    published: true,
  },
  {
    slug: "warehouse-supervisor-zenith",
    orgSlug: "zenith-foods-ltd",
    title: "Warehouse Supervisor",
    description: "Oversee daily warehouse operations at our Abeokuta distribution center.",
    responsibilities: "Manage inventory accuracy, supervise warehouse staff, enforce safety protocols.",
    requirements: "3+ years warehouse management experience.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.OGUN,
    city: "Abeokuta",
    salaryMinKobo: 25_000_000,
    salaryMaxKobo: 35_000_000,
    published: false,
  },
  {
    slug: "product-designer-paynaija",
    orgSlug: "paynaija-technologies",
    title: "Product Designer",
    description: "Shape the end-to-end experience of PayNaija's consumer payments app.",
    responsibilities: "Own design from research to high-fidelity prototypes, run usability testing.",
    requirements: "4+ years product design experience, strong Figma portfolio.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.REMOTE,
    state: NigeriaState.LAGOS,
    city: "Yaba",
    salaryMinKobo: 60_000_000,
    salaryMaxKobo: 95_000_000,
    published: true,
  },
  {
    slug: "devops-engineer-paynaija",
    orgSlug: "paynaija-technologies",
    title: "DevOps Engineer",
    description: "Build and scale the infrastructure behind PayNaija's payment rails.",
    responsibilities: "Own CI/CD, manage Kubernetes clusters, improve observability.",
    requirements: "Strong AWS and Kubernetes experience, on-call rotation comfort.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.REMOTE,
    state: NigeriaState.LAGOS,
    city: "Lekki",
    salaryMinKobo: 90_000_000,
    salaryMaxKobo: 140_000_000,
    published: true,
  },
  {
    slug: "customer-success-paynaija",
    orgSlug: "paynaija-technologies",
    title: "Customer Success Associate",
    description: "Be the first line of support for PayNaija merchants across Nigeria.",
    responsibilities: "Resolve merchant queries, track satisfaction metrics, escalate product issues.",
    requirements: "1+ years in a customer-facing role, excellent written communication.",
    employmentType: EmploymentType.CONTRACT,
    workMode: WorkMode.HYBRID,
    state: NigeriaState.FCT_ABUJA,
    city: "Wuse",
    salaryMinKobo: 20_000_000,
    salaryMaxKobo: 30_000_000,
    published: true,
  },
  {
    slug: "data-analyst-greenacre",
    orgSlug: "greenacre-logistics",
    title: "Data Analyst",
    description: "Turn GreenAcre's fleet and delivery data into decisions that cut cost and delay.",
    responsibilities: "Build dashboards, analyze route efficiency, present findings to ops leadership.",
    requirements: "3+ years in analytics, strong SQL and a BI tool (Power BI/Looker/Metabase).",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.RIVERS,
    city: "Port Harcourt",
    salaryMinKobo: 45_000_000,
    salaryMaxKobo: 70_000_000,
    published: true,
  },
  {
    slug: "fleet-operations-manager-greenacre",
    orgSlug: "greenacre-logistics",
    title: "Fleet Operations Manager",
    description: "Manage day-to-day operations for GreenAcre's Lagos fleet.",
    responsibilities: "Schedule routes, manage driver performance, own fuel/maintenance budgets.",
    requirements: "5+ years fleet or logistics operations management.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.LAGOS,
    city: "Apapa",
    salaryMinKobo: 40_000_000,
    salaryMaxKobo: 60_000_000,
    published: true,
  },
  {
    slug: "marketing-manager-greenacre",
    orgSlug: "greenacre-logistics",
    title: "Marketing Manager",
    description: "Lead brand and demand-generation marketing for GreenAcre's expansion into the North.",
    responsibilities: "Own campaign strategy, manage agency relationships, report on pipeline impact.",
    requirements: "5+ years marketing experience, logistics or B2B experience a plus.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    state: NigeriaState.KANO,
    city: "Kano",
    salaryMinKobo: 50_000_000,
    salaryMaxKobo: 75_000_000,
    published: false,
  },

  // Sahara Energy Resources
  {
    slug: "process-engineer-sahara",
    orgSlug: "sahara-energy-resources",
    title: "Process Engineer",
    description: "Optimize process safety and throughput across Sahara's upstream facilities.",
    responsibilities: "Monitor process performance, lead HAZOP studies, drive efficiency projects.",
    requirements: "5+ years process engineering experience in oil & gas.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.RIVERS,
    city: "Port Harcourt",
    salaryMinKobo: 90_000_000,
    salaryMaxKobo: 140_000_000,
    published: true,
    boosted: true,
  },
  {
    slug: "hse-officer-sahara",
    orgSlug: "sahara-energy-resources",
    title: "HSE Officer",
    description: "Champion health, safety, and environmental compliance across field operations.",
    responsibilities: "Conduct safety audits, lead incident investigations, run compliance training.",
    requirements: "3+ years HSE experience, NEBOSH certification preferred.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.RIVERS,
    city: "Port Harcourt",
    salaryMinKobo: 50_000_000,
    salaryMaxKobo: 75_000_000,
    published: true,
  },
  {
    slug: "procurement-analyst-sahara",
    orgSlug: "sahara-energy-resources",
    title: "Procurement Analyst",
    description: "Support sourcing and vendor management for field operations equipment.",
    responsibilities: "Evaluate vendor bids, track contract compliance, manage purchase orders.",
    requirements: "2+ years procurement experience, strong Excel skills.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    state: NigeriaState.RIVERS,
    city: "Port Harcourt",
    salaryMinKobo: 40_000_000,
    salaryMaxKobo: 60_000_000,
    published: false,
  },

  // Lagos Digital Health
  {
    slug: "mobile-app-developer-ldh",
    orgSlug: "lagos-digital-health",
    title: "Mobile App Developer (Flutter)",
    description: "Build the patient-facing mobile app connecting Nigerians to telemedicine.",
    responsibilities: "Ship new app features, maintain CI pipelines, collaborate with clinical product team.",
    requirements: "3+ years Flutter experience, published apps in production.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.REMOTE,
    state: NigeriaState.LAGOS,
    city: "Ikoyi",
    salaryMinKobo: 70_000_000,
    salaryMaxKobo: 110_000_000,
    published: true,
  },
  {
    slug: "telemedicine-pm-ldh",
    orgSlug: "lagos-digital-health",
    title: "Telemedicine Product Manager",
    description: "Own the roadmap for our virtual consultation platform.",
    responsibilities: "Define product requirements, work with clinicians and engineers, track adoption metrics.",
    requirements: "4+ years product management, healthcare experience a plus.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    state: NigeriaState.LAGOS,
    city: "Ikoyi",
    salaryMinKobo: 80_000_000,
    salaryMaxKobo: 120_000_000,
    published: true,
  },
  {
    slug: "nurse-coordinator-ldh",
    orgSlug: "lagos-digital-health",
    title: "Registered Nurse Coordinator",
    description: "Coordinate virtual care delivery between patients and our clinical network.",
    responsibilities: "Triage patient requests, support clinicians during virtual visits, maintain care records.",
    requirements: "RN license, 2+ years clinical experience.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.LAGOS,
    city: "Ikoyi",
    salaryMinKobo: 35_000_000,
    salaryMaxKobo: 50_000_000,
    published: true,
  },

  // Naija Threads
  {
    slug: "ecommerce-manager-naija-threads",
    orgSlug: "naija-threads",
    title: "E-commerce Manager",
    description: "Run our online storefront and grow direct-to-consumer sales.",
    responsibilities: "Manage the Shopify store, run promotions, analyze conversion funnels.",
    requirements: "3+ years e-commerce management experience.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    state: NigeriaState.LAGOS,
    city: "Lekki",
    salaryMinKobo: 40_000_000,
    salaryMaxKobo: 65_000_000,
    published: true,
  },
  {
    slug: "retail-store-supervisor-naija-threads",
    orgSlug: "naija-threads",
    title: "Retail Store Supervisor",
    description: "Lead day-to-day operations at our flagship Lekki store.",
    responsibilities: "Manage store staff, oversee inventory, deliver on sales targets.",
    requirements: "2+ years retail supervisory experience.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.LAGOS,
    city: "Lekki",
    salaryMinKobo: 20_000_000,
    salaryMaxKobo: 30_000_000,
    published: true,
  },
  {
    slug: "fashion-merchandiser-naija-threads",
    orgSlug: "naija-threads",
    title: "Fashion Merchandiser",
    description: "Curate seasonal collections and manage supplier relationships.",
    responsibilities: "Plan buys, negotiate with suppliers, analyze sell-through data.",
    requirements: "2+ years merchandising experience in fashion retail.",
    employmentType: EmploymentType.CONTRACT,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.LAGOS,
    city: "Lekki",
    salaryMinKobo: 25_000_000,
    salaryMaxKobo: 35_000_000,
    published: false,
  },

  // Kaduna AgroTech
  {
    slug: "agronomist-kaduna-agrotech",
    orgSlug: "kaduna-agrotech",
    title: "Agronomist",
    description: "Advise partner farms on crop yield optimization and soil health.",
    responsibilities: "Run field trials, advise on inputs, train farm extension officers.",
    requirements: "Degree in Agronomy or related field, 3+ years field experience.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.KADUNA,
    city: "Kaduna",
    salaryMinKobo: 35_000_000,
    salaryMaxKobo: 55_000_000,
    published: true,
  },
  {
    slug: "farm-operations-manager-kaduna-agrotech",
    orgSlug: "kaduna-agrotech",
    title: "Farm Operations Manager",
    description: "Oversee daily operations across our partner farm network.",
    responsibilities: "Coordinate planting schedules, manage logistics, report on yields.",
    requirements: "4+ years agricultural operations management.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.KADUNA,
    city: "Kaduna",
    salaryMinKobo: 40_000_000,
    salaryMaxKobo: 60_000_000,
    published: true,
  },

  // Abuja Realty Partners
  {
    slug: "sales-executive-abuja-realty",
    orgSlug: "abuja-realty-partners",
    title: "Real Estate Sales Executive",
    description: "Drive property sales across our Abuja residential and commercial portfolio.",
    responsibilities: "Manage client relationships, run property viewings, close sales.",
    requirements: "2+ years real estate sales experience.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.FCT_ABUJA,
    city: "Maitama",
    salaryMinKobo: 25_000_000,
    salaryMaxKobo: 45_000_000,
    published: true,
  },
  {
    slug: "property-manager-abuja-realty",
    orgSlug: "abuja-realty-partners",
    title: "Property Manager",
    description: "Manage a portfolio of residential properties on behalf of landlords.",
    responsibilities: "Coordinate maintenance, manage tenant relationships, handle lease renewals.",
    requirements: "3+ years property management experience.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.FCT_ABUJA,
    city: "Maitama",
    salaryMinKobo: 30_000_000,
    salaryMaxKobo: 50_000_000,
    published: true,
  },
  {
    slug: "admin-assistant-abuja-realty",
    orgSlug: "abuja-realty-partners",
    title: "Administrative Assistant",
    description: "Support the leadership team with day-to-day administrative operations.",
    responsibilities: "Manage schedules, handle correspondence, organize office operations.",
    requirements: "1+ years administrative experience.",
    employmentType: EmploymentType.PART_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.FCT_ABUJA,
    city: "Maitama",
    salaryMinKobo: 12_000_000,
    salaryMaxKobo: 18_000_000,
    published: false,
  },

  // SwiftPay Microfinance Bank
  {
    slug: "credit-risk-analyst-swiftpay",
    orgSlug: "swiftpay-microfinance-bank",
    title: "Credit Risk Analyst",
    description: "Assess loan applications and manage portfolio risk for our lending products.",
    responsibilities: "Build credit scoring models, review applications, monitor default rates.",
    requirements: "3+ years credit risk experience in banking or fintech.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.LAGOS,
    city: "Ikeja",
    salaryMinKobo: 50_000_000,
    salaryMaxKobo: 80_000_000,
    published: true,
  },
  {
    slug: "branch-operations-officer-swiftpay",
    orgSlug: "swiftpay-microfinance-bank",
    title: "Branch Operations Officer",
    description: "Run daily branch operations and deliver excellent customer service.",
    responsibilities: "Process transactions, manage cash operations, resolve customer queries.",
    requirements: "2+ years banking operations experience.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.LAGOS,
    city: "Ikeja",
    salaryMinKobo: 30_000_000,
    salaryMaxKobo: 45_000_000,
    published: true,
  },
  {
    slug: "compliance-officer-swiftpay",
    orgSlug: "swiftpay-microfinance-bank",
    title: "Compliance Officer",
    description: "Ensure regulatory compliance across all banking operations.",
    responsibilities: "Monitor regulatory changes, conduct compliance audits, file CBN reports.",
    requirements: "4+ years compliance experience in financial services.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    state: NigeriaState.LAGOS,
    city: "Ikeja",
    salaryMinKobo: 45_000_000,
    salaryMaxKobo: 70_000_000,
    published: true,
  },
  {
    slug: "qa-engineer-swiftpay",
    orgSlug: "swiftpay-microfinance-bank",
    title: "Software QA Engineer",
    description: "Own quality assurance for our core banking platform.",
    responsibilities: "Write automated test suites, run regression testing, triage bug reports.",
    requirements: "3+ years QA engineering experience, test automation tools.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.REMOTE,
    state: NigeriaState.LAGOS,
    city: "Ikeja",
    salaryMinKobo: 50_000_000,
    salaryMaxKobo: 80_000_000,
    published: true,
  },

  // EduBridge Nigeria
  {
    slug: "curriculum-designer-edubridge",
    orgSlug: "edubridge-nigeria",
    title: "Curriculum Designer",
    description: "Design engaging digital learning content for secondary school students.",
    responsibilities: "Develop lesson plans, collaborate with subject matter experts, review learning outcomes.",
    requirements: "3+ years curriculum design or teaching experience.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.REMOTE,
    state: NigeriaState.OYO,
    city: "Ibadan",
    salaryMinKobo: 35_000_000,
    salaryMaxKobo: 55_000_000,
    published: true,
  },
  {
    slug: "backend-engineer-edubridge",
    orgSlug: "edubridge-nigeria",
    title: "Backend Engineer (Django)",
    description: "Build the platform powering EduBridge's learning management system.",
    responsibilities: "Design APIs, optimize database performance, ship new platform features.",
    requirements: "3+ years Django experience, strong PostgreSQL skills.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.REMOTE,
    state: NigeriaState.OYO,
    city: "Ibadan",
    salaryMinKobo: 60_000_000,
    salaryMaxKobo: 95_000_000,
    published: true,
  },
  {
    slug: "customer-support-lead-edubridge",
    orgSlug: "edubridge-nigeria",
    title: "Customer Support Lead",
    description: "Lead our support team helping schools onboard onto the platform.",
    responsibilities: "Manage support queue, train support agents, track satisfaction metrics.",
    requirements: "3+ years customer support experience, team lead background.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    state: NigeriaState.OYO,
    city: "Ibadan",
    salaryMinKobo: 25_000_000,
    salaryMaxKobo: 40_000_000,
    published: true,
  },

  // Coastal Freight & Marine
  {
    slug: "marine-logistics-coordinator-coastal",
    orgSlug: "coastal-freight-marine",
    title: "Marine Logistics Coordinator",
    description: "Coordinate vessel scheduling and cargo logistics across our shipping operations.",
    responsibilities: "Schedule vessel movements, liaise with port authorities, track cargo manifests.",
    requirements: "3+ years marine logistics experience.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.RIVERS,
    city: "Port Harcourt",
    salaryMinKobo: 40_000_000,
    salaryMaxKobo: 60_000_000,
    published: true,
  },
  {
    slug: "freight-forwarding-officer-coastal",
    orgSlug: "coastal-freight-marine",
    title: "Freight Forwarding Officer",
    description: "Manage import/export documentation and customs clearance processes.",
    responsibilities: "Prepare shipping documentation, coordinate with customs agents, track shipments.",
    requirements: "2+ years freight forwarding experience.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.RIVERS,
    city: "Port Harcourt",
    salaryMinKobo: 30_000_000,
    salaryMaxKobo: 45_000_000,
    published: true,
  },
  {
    slug: "fleet-maintenance-engineer-coastal",
    orgSlug: "coastal-freight-marine",
    title: "Fleet Maintenance Engineer",
    description: "Keep our marine fleet running safely and efficiently.",
    responsibilities: "Schedule preventive maintenance, diagnose mechanical issues, manage spare parts inventory.",
    requirements: "Marine engineering background, 3+ years maintenance experience.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.RIVERS,
    city: "Port Harcourt",
    salaryMinKobo: 35_000_000,
    salaryMaxKobo: 55_000_000,
    published: false,
  },

  // Savanna Telecom
  {
    slug: "network-ops-engineer-savanna",
    orgSlug: "savanna-telecom",
    title: "Network Operations Engineer",
    description: "Keep Savanna's regional network infrastructure running at peak reliability.",
    responsibilities: "Monitor network health, respond to outages, plan capacity upgrades.",
    requirements: "3+ years telecom network operations experience.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.KANO,
    city: "Kano",
    salaryMinKobo: 50_000_000,
    salaryMaxKobo: 80_000_000,
    published: true,
    boosted: true,
  },
  {
    slug: "customer-experience-manager-savanna",
    orgSlug: "savanna-telecom",
    title: "Customer Experience Manager",
    description: "Own the end-to-end customer experience across our retail and call center channels.",
    responsibilities: "Analyze customer feedback, design service improvements, manage frontline teams.",
    requirements: "4+ years customer experience management in telecoms.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.KANO,
    city: "Kano",
    salaryMinKobo: 40_000_000,
    salaryMaxKobo: 60_000_000,
    published: true,
  },
  {
    slug: "telecom-sales-executive-savanna",
    orgSlug: "savanna-telecom",
    title: "Telecom Sales Executive",
    description: "Drive B2B sales of Savanna's connectivity and data products.",
    responsibilities: "Build client pipeline, negotiate contracts, meet quarterly sales targets.",
    requirements: "2+ years B2B sales experience, telecoms a plus.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.KANO,
    city: "Kano",
    salaryMinKobo: 25_000_000,
    salaryMaxKobo: 40_000_000,
    published: true,
  },
  {
    slug: "it-support-specialist-savanna",
    orgSlug: "savanna-telecom",
    title: "IT Support Specialist",
    description: "Provide first-line IT support across Savanna's regional offices.",
    responsibilities: "Resolve helpdesk tickets, manage device provisioning, support office IT infrastructure.",
    requirements: "1+ years IT support experience.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.KANO,
    city: "Kano",
    salaryMinKobo: 20_000_000,
    salaryMaxKobo: 32_000_000,
    published: true,
  },

  // BuildRight Construction
  {
    slug: "civil-site-engineer-buildright",
    orgSlug: "buildright-construction",
    title: "Civil Site Engineer",
    description: "Oversee on-site civil works for our residential and commercial developments.",
    responsibilities: "Supervise construction crews, review engineering drawings, ensure quality standards.",
    requirements: "3+ years site engineering experience, civil engineering degree.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.FCT_ABUJA,
    city: "Gwarinpa",
    salaryMinKobo: 45_000_000,
    salaryMaxKobo: 70_000_000,
    published: true,
  },
  {
    slug: "quantity-surveyor-buildright",
    orgSlug: "buildright-construction",
    title: "Quantity Surveyor",
    description: "Manage project costs and contracts across active construction sites.",
    responsibilities: "Prepare cost estimates, manage tender processes, track project budgets.",
    requirements: "3+ years quantity surveying experience.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.FCT_ABUJA,
    city: "Gwarinpa",
    salaryMinKobo: 40_000_000,
    salaryMaxKobo: 65_000_000,
    published: true,
  },
  {
    slug: "construction-pm-buildright",
    orgSlug: "buildright-construction",
    title: "Construction Project Manager",
    description: "Lead delivery of multi-million naira construction projects from groundbreaking to handover.",
    responsibilities: "Manage project schedules, coordinate contractors, report to stakeholders.",
    requirements: "6+ years construction project management experience.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.FCT_ABUJA,
    city: "Gwarinpa",
    salaryMinKobo: 70_000_000,
    salaryMaxKobo: 110_000_000,
    published: true,
  },
  {
    slug: "safety-officer-buildright",
    orgSlug: "buildright-construction",
    title: "Safety Officer",
    description: "Champion site safety standards across all active construction projects.",
    responsibilities: "Conduct site safety inspections, lead toolbox talks, investigate incidents.",
    requirements: "2+ years construction safety experience.",
    employmentType: EmploymentType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    state: NigeriaState.FCT_ABUJA,
    city: "Gwarinpa",
    salaryMinKobo: 30_000_000,
    salaryMaxKobo: 45_000_000,
    published: false,
  },
];

interface SeedApplication {
  seekerEmail: string;
  jobSlug: string;
  status: ApplicationStatus;
  coverLetter: string;
}

const applications: SeedApplication[] = [
  {
    seekerEmail: "chidi.eze@gmail.com",
    jobSlug: "backend-engineer-zenith",
    status: ApplicationStatus.SHORTLISTED,
    coverLetter: "I've spent the last 4 years building high-throughput order systems — excited about this role.",
  },
  {
    seekerEmail: "chidi.eze@gmail.com",
    jobSlug: "devops-engineer-paynaija",
    status: ApplicationStatus.APPLIED,
    coverLetter: "I'd love to bring my backend background into a platform/DevOps role.",
  },
  {
    seekerEmail: "ngozi.obi@gmail.com",
    jobSlug: "product-designer-paynaija",
    status: ApplicationStatus.INTERVIEWING,
    coverLetter: "PayNaija's consumer app is exactly the kind of product I want to shape.",
  },
  {
    seekerEmail: "tunde.oluwaseun@gmail.com",
    jobSlug: "data-analyst-greenacre",
    status: ApplicationStatus.HIRED,
    coverLetter: "Logistics analytics is my focus area — happy to share a portfolio of past dashboards.",
  },
  {
    seekerEmail: "fatima.sule@gmail.com",
    jobSlug: "customer-success-paynaija",
    status: ApplicationStatus.REJECTED,
    coverLetter: "I've led support teams before and would bring that structure here.",
  },
  {
    seekerEmail: "kelechi.nwosu@gmail.com",
    jobSlug: "devops-engineer-paynaija",
    status: ApplicationStatus.SHORTLISTED,
    coverLetter: "I've run Kubernetes in production for 3 years and would love to join the team.",
  },
  {
    seekerEmail: "kelechi.nwosu@gmail.com",
    jobSlug: "backend-engineer-zenith",
    status: ApplicationStatus.APPLIED,
    coverLetter: "Open to backend roles too — happy to discuss fit.",
  },
  {
    seekerEmail: "ibrahim.yusuf@gmail.com",
    jobSlug: "civil-site-engineer-buildright",
    status: ApplicationStatus.SHORTLISTED,
    coverLetter: "I've supervised three residential developments in Abuja over the past two years.",
  },
  {
    seekerEmail: "ibrahim.yusuf@gmail.com",
    jobSlug: "quantity-surveyor-buildright",
    status: ApplicationStatus.APPLIED,
    coverLetter: "My site engineering background gives me a strong cost-estimation edge.",
  },
  {
    seekerEmail: "chiamaka.okafor@gmail.com",
    jobSlug: "nurse-coordinator-ldh",
    status: ApplicationStatus.INTERVIEWING,
    coverLetter: "Telemedicine coordination combines both things I love: patient care and technology.",
  },
  {
    seekerEmail: "bashir.aliyu@gmail.com",
    jobSlug: "network-ops-engineer-savanna",
    status: ApplicationStatus.HIRED,
    coverLetter: "Five years keeping regional networks online — ready to bring that to Savanna.",
  },
  {
    seekerEmail: "bashir.aliyu@gmail.com",
    jobSlug: "it-support-specialist-savanna",
    status: ApplicationStatus.WITHDRAWN,
    coverLetter: "Applied before seeing the Network Ops role, which is a better fit for me.",
  },
  {
    seekerEmail: "funmilayo.adekunle@gmail.com",
    jobSlug: "ecommerce-manager-naija-threads",
    status: ApplicationStatus.SHORTLISTED,
    coverLetter: "I grew a Shopify store from zero to six figures in monthly revenue last year.",
  },
  {
    seekerEmail: "emmanuel.etim@gmail.com",
    jobSlug: "procurement-analyst-sahara",
    status: ApplicationStatus.APPLIED,
    coverLetter: "Seven years in procurement across oil & gas and logistics — ready for this challenge.",
  },
  {
    seekerEmail: "emmanuel.etim@gmail.com",
    jobSlug: "marine-logistics-coordinator-coastal",
    status: ApplicationStatus.REJECTED,
    coverLetter: "My vendor management background translates well to marine logistics coordination.",
  },
  {
    seekerEmail: "chidi.eze@gmail.com",
    jobSlug: "backend-engineer-edubridge",
    status: ApplicationStatus.APPLIED,
    coverLetter: "I'd love to bring backend systems experience to an edtech mission.",
  },
  {
    seekerEmail: "tunde.oluwaseun@gmail.com",
    jobSlug: "credit-risk-analyst-swiftpay",
    status: ApplicationStatus.INTERVIEWING,
    coverLetter: "My analytics background is a strong match for credit risk modeling.",
  },
  {
    seekerEmail: "ngozi.obi@gmail.com",
    jobSlug: "telemedicine-pm-ldh",
    status: ApplicationStatus.APPLIED,
    coverLetter: "I'd love to bring product design rigor to telemedicine product management.",
  },
];

async function upsertUser(user: SeedUser, passwordHash: string) {
  return prisma.user.upsert({
    where: { email: user.email },
    create: {
      email: user.email,
      passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isEmailVerified: true,
    },
    update: {
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
    },
  });
}

async function main() {
  for (const plan of plans) {
    await prisma.plan.upsert({ where: { code: plan.code }, create: plan, update: plan });
  }
  console.log(`Seeded ${plans.length} plans.`);

  await prisma.platformSettings.upsert({ where: { id: "singleton" }, create: {}, update: {} });
  console.log("Seeded platform settings (default boost: NGN 5,000 / 7 days).");

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  await prisma.user.upsert({
    where: { email: "admin@eaglehr.ng" },
    create: {
      email: "admin@eaglehr.ng",
      passwordHash,
      firstName: "EagleHire",
      lastName: "Admin",
      isEmailVerified: true,
      isPlatformAdmin: true,
    },
    update: { isPlatformAdmin: true },
  });
  console.log(`Seeded platform admin user: admin@eaglehr.ng (password: ${DEMO_PASSWORD}).`);

  const allPeople = [...employerOwners, ...employerStaff, ...jobSeekers];
  const usersByEmail = new Map<string, Awaited<ReturnType<typeof upsertUser>>>();
  for (const person of allPeople) {
    usersByEmail.set(person.email, await upsertUser(person, passwordHash));
  }
  console.log(`Seeded ${allPeople.length} users (password for all: ${DEMO_PASSWORD}).`);

  for (const seeker of jobSeekers) {
    const user = usersByEmail.get(seeker.email)!;
    await prisma.jobSeekerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        headline: seeker.headline,
        yearsOfExperience: seeker.yearsOfExperience,
        currentState: seeker.state,
        currentCity: seeker.city,
        skills: seeker.skills,
        isOpenToWork: true,
      },
      update: {
        headline: seeker.headline,
        yearsOfExperience: seeker.yearsOfExperience,
        currentState: seeker.state,
        currentCity: seeker.city,
        skills: seeker.skills,
      },
    });
  }
  console.log(`Seeded ${jobSeekers.length} job seeker profiles.`);

  const boostExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const orgsBySlug = new Map<string, { id: string }>();
  for (const org of organizations) {
    const owner = usersByEmail.get(org.ownerEmail)!;
    const created = await prisma.organization.upsert({
      where: { slug: org.slug },
      create: {
        slug: org.slug,
        name: org.name,
        industry: org.industry,
        size: org.size,
        websiteUrl: org.websiteUrl,
        isBoosted: org.boosted ?? false,
        boostExpiresAt: org.boosted ? boostExpiresAt : null,
      },
      update: {
        name: org.name,
        industry: org.industry,
        size: org.size,
        websiteUrl: org.websiteUrl,
        isBoosted: org.boosted ?? false,
        boostExpiresAt: org.boosted ? boostExpiresAt : null,
      },
    });
    orgsBySlug.set(org.slug, created);

    await prisma.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: created.id, userId: owner.id } },
      create: { organizationId: created.id, userId: owner.id, role: OrgRole.OWNER },
      update: { role: OrgRole.OWNER },
    });

    if (org.staffEmail && org.staffRole) {
      const staff = usersByEmail.get(org.staffEmail)!;
      await prisma.organizationMember.upsert({
        where: { organizationId_userId: { organizationId: created.id, userId: staff.id } },
        create: { organizationId: created.id, userId: staff.id, role: org.staffRole },
        update: { role: org.staffRole },
      });
    }
  }
  console.log(`Seeded ${organizations.length} organizations.`);

  const jobsBySlug = new Map<string, { id: string }>();
  for (const job of jobs) {
    const org = orgsBySlug.get(job.orgSlug)!;
    const owner = usersByEmail.get(organizations.find((o) => o.slug === job.orgSlug)!.ownerEmail)!;
    const created = await prisma.job.upsert({
      where: { slug: job.slug },
      create: {
        slug: job.slug,
        organizationId: org.id,
        createdByUserId: owner.id,
        title: job.title,
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        employmentType: job.employmentType,
        workMode: job.workMode,
        state: job.state,
        city: job.city,
        salaryMinKobo: job.salaryMinKobo,
        salaryMaxKobo: job.salaryMaxKobo,
        status: job.published ? "PUBLISHED" : "DRAFT",
        publishedAt: job.published ? new Date() : null,
        isBoosted: job.boosted ?? false,
        boostExpiresAt: job.boosted ? boostExpiresAt : null,
      },
      update: {
        title: job.title,
        description: job.description,
        responsibilities: job.responsibilities,
        requirements: job.requirements,
        employmentType: job.employmentType,
        workMode: job.workMode,
        state: job.state,
        city: job.city,
        salaryMinKobo: job.salaryMinKobo,
        salaryMaxKobo: job.salaryMaxKobo,
        isBoosted: job.boosted ?? false,
        boostExpiresAt: job.boosted ? boostExpiresAt : null,
      },
    });
    jobsBySlug.set(job.slug, created);
  }
  console.log(`Seeded ${jobs.length} jobs (${jobs.filter((j) => j.published).length} published).`);

  for (const application of applications) {
    const seeker = usersByEmail.get(application.seekerEmail)!;
    const profile = await prisma.jobSeekerProfile.findUniqueOrThrow({ where: { userId: seeker.id } });
    const job = jobsBySlug.get(application.jobSlug)!;
    await prisma.application.upsert({
      where: { jobId_jobSeekerProfileId: { jobId: job.id, jobSeekerProfileId: profile.id } },
      create: {
        jobId: job.id,
        jobSeekerProfileId: profile.id,
        status: application.status,
        coverLetter: application.coverLetter,
      },
      update: { status: application.status },
    });
  }
  console.log(`Seeded ${applications.length} applications.`);

  // A pending invitation on Zenith Foods, so the team page has something to show beyond existing members.
  const zenith = orgsBySlug.get("zenith-foods-ltd")!;
  const zenithOwner = usersByEmail.get("ada@zenithfoods.ng")!;
  const pendingInviteEmail = "newrecruiter@example.com";
  const existingInvite = await prisma.organizationInvitation.findFirst({
    where: { organizationId: zenith.id, email: pendingInviteEmail },
  });
  if (!existingInvite) {
    await prisma.organizationInvitation.create({
      data: {
        organizationId: zenith.id,
        email: pendingInviteEmail,
        role: OrgRole.RECRUITER,
        token: `demo-invite-${zenith.id.slice(0, 8)}`,
        invitedByUserId: zenithOwner.id,
        status: InvitationStatus.PENDING,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`Seeded 1 pending invitation (${pendingInviteEmail} -> Zenith Foods Ltd).`);
  }

  // Give Zenith Foods an active Growth subscription, so billing state isn't empty everywhere.
  const growthPlan = await prisma.plan.findUniqueOrThrow({ where: { code: "growth" } });
  const existingSubscription = await prisma.subscription.findFirst({ where: { organizationId: zenith.id } });
  const subscription = existingSubscription
    ? await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          planId: growthPlan.id,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
    : await prisma.subscription.create({
        data: {
          organizationId: zenith.id,
          planId: growthPlan.id,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });

  await prisma.payment.upsert({
    where: { paystackReference: `demo_seed_${zenith.id.slice(0, 8)}` },
    create: {
      organizationId: zenith.id,
      subscriptionId: subscription.id,
      planId: growthPlan.id,
      paystackReference: `demo_seed_${zenith.id.slice(0, 8)}`,
      amountKobo: growthPlan.priceKobo,
      status: PaymentStatus.SUCCESS,
      purpose: PaymentPurpose.SUBSCRIPTION,
      paidAt: new Date(),
    },
    update: { status: PaymentStatus.SUCCESS, paidAt: new Date() },
  });
  console.log("Seeded 1 active subscription + payment (Zenith Foods Ltd -> Growth plan).");

  console.log("\nDemo login (all seeded people use this password):");
  console.log(`  password: ${DEMO_PASSWORD}`);
  console.log("  employers (org owners): ada@zenithfoods.ng, emeka@paynaija.com, amaka@greenacre.ng");
  console.log("  employer staff: bola@zenithfoods.ng (recruiter), yusuf@paynaija.com (admin)");
  console.log(
    "  job seekers: chidi.eze@gmail.com, ngozi.obi@gmail.com, tunde.oluwaseun@gmail.com, fatima.sule@gmail.com, kelechi.nwosu@gmail.com",
  );
  console.log("  platform admin: admin@eaglehr.ng");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
