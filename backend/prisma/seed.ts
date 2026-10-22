import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting TaskPulse database seed...');

  // 1. Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payoutRequest.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.workerWallet.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderRevision.deleteMany();
  await prisma.workSubmission.deleteMany();
  await prisma.workerAssignment.deleteMany();
  await prisma.orderFile.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.order.deleteMany();
  await prisma.service.deleteMany();
  await prisma.workerCategory.deleteMany();
  await prisma.workerSkill.deleteMany();
  await prisma.serviceCategory.deleteMany();
  await prisma.workerProfile.deleteMany();
  await prisma.customerProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  // 2. Hash default passwords
  const passwordAdmin = await bcrypt.hash('Admin@12345', 10);
  const passwordCustomer = await bcrypt.hash('Customer@12345', 10);
  const passwordWorker = await bcrypt.hash('Worker@12345', 10);

  // 3. Create Users
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@taskpulse.lk',
      passwordHash: passwordAdmin,
      fullName: 'TaskPulse Operations Admin',
      phone: '+94 77 123 4567',
      role: 'ADMIN',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      passwordHash: passwordCustomer,
      fullName: 'Sarah Perera',
      phone: '+94 71 987 6543',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      customerProfile: {
        create: {
          city: 'Colombo',
          country: 'Sri Lanka',
          preferredLanguage: 'en',
          totalOrdersCount: 1,
        },
      },
    },
  });

  const workerUser = await prisma.user.create({
    data: {
      email: 'worker@example.com',
      passwordHash: passwordWorker,
      fullName: 'Kamal Silva',
      phone: '+94 76 555 4321',
      role: 'WORKER',
      status: 'ACTIVE',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      workerProfile: {
        create: {
          headline: 'Senior Document Specialist & Data Analyst',
          bio: 'Over 6 years of expertise in Microsoft Office Suite, corporate report typesetting, advanced Excel dashboard automation, and bilingual document formatting.',
          experienceYears: 6,
          verificationStatus: 'APPROVED',
          ratingAvg: 4.95,
          ratingCount: 28,
          totalCompletedJobs: 32,
          isAvailable: true,
          wallet: {
            create: {
              currentBalance: 12500.0,
              pendingClearance: 4000.0,
              totalWithdrawn: 45000.0,
            },
          },
          skills: {
            create: [
              { skillName: 'Microsoft Word & APA/IEEE Formatting' },
              { skillName: 'Microsoft Excel & Power Query' },
              { skillName: 'Executive Resume & CV Revamp' },
              { skillName: 'PowerPoint & Keynote Design' },
              { skillName: 'Data Cleaning & Entry' },
            ],
          },
        },
      },
    },
    include: {
      workerProfile: true,
    },
  });

  console.log('👤 Created Admin, Customer, and Worker accounts.');

  // 4. Create the 12 Core Service Categories
  const categoriesData = [
    {
      name: 'Academic Support & Proofreading',
      slug: 'academic-support',
      description: 'Grammar review, thesis formatting, citation alignment (APA, Harvard, IEEE), and research methodology consulting.',
      icon: 'BookOpen',
      displayOrder: 1,
    },
    {
      name: 'Microsoft Word Services',
      slug: 'ms-word',
      description: 'Professional document creation, corporate styles, header/footer pagination, tables of contents, and report formatting.',
      icon: 'FileText',
      displayOrder: 2,
    },
    {
      name: 'Microsoft Excel & Data Analysis',
      slug: 'ms-excel',
      description: 'Advanced spreadsheets, automated formulas, VLOOKUP/XLOOKUP, pivot tables, data cleaning, and KPI dashboards.',
      icon: 'Table',
      displayOrder: 3,
    },
    {
      name: 'PowerPoint & Presentation Design',
      slug: 'powerpoint',
      description: 'Executive pitch decks, conference slideshows, animated corporate presentations, and template revamps.',
      icon: 'Presentation',
      displayOrder: 4,
    },
    {
      name: 'CV & Career Documents',
      slug: 'cv-career',
      description: 'ATS-optimized professional resumes, executive cover letters, and LinkedIn profile optimization.',
      icon: 'Briefcase',
      displayOrder: 5,
    },
    {
      name: 'Research & Documentation',
      slug: 'research-documentation',
      description: 'Technical writing, whitepapers, literature review compilation, indexing, and proofreading.',
      icon: 'Search',
      displayOrder: 6,
    },
    {
      name: 'Programming & IT Assistance',
      slug: 'programming-it',
      description: 'Python script automation, web bug fixes, database queries (SQL), API integration, and script debugging.',
      icon: 'Code',
      displayOrder: 7,
    },
    {
      name: 'Graphic & Digital Design',
      slug: 'graphic-design',
      description: 'Digital flyers, business flowcharts, infographic diagrams, vector conversions, and social media banners.',
      icon: 'Palette',
      displayOrder: 8,
    },
    {
      name: 'PDF Services & Conversion',
      slug: 'pdf-services',
      description: 'Fillable PDF forms, scanned OCR conversions, merging, splitting, and high-fidelity file recreation.',
      icon: 'FileCheck',
      displayOrder: 9,
    },
    {
      name: 'Data Entry & Virtual Administration',
      slug: 'data-entry',
      description: 'Bulk data transcription, web data scraping/copy-paste, contact list compilation, and catalog maintenance.',
      icon: 'Layers',
      displayOrder: 10,
    },
    {
      name: 'Business Reports & Proposals',
      slug: 'business-proposals',
      description: 'Financial report templates, tender documents, business proposals, and executive project briefs.',
      icon: 'TrendingUp',
      displayOrder: 11,
    },
    {
      name: 'Custom & Bespoke Requests',
      slug: 'custom-requests',
      description: 'Tailored digital solutions and multi-disciplinary tasks evaluated and quoted directly by our team.',
      icon: 'Sparkles',
      displayOrder: 12,
    },
  ];

  const createdCategories: Record<string, any> = {};

  for (const cat of categoriesData) {
    const created = await prisma.serviceCategory.create({
      data: cat,
    });
    createdCategories[cat.slug] = created;
  }

  console.log('📁 Created 12 Service Categories.');

  // Link worker to categories
  if (workerUser.workerProfile) {
    await prisma.workerCategory.createMany({
      data: [
        { workerProfileId: workerUser.workerProfile.id, categoryId: createdCategories['ms-word'].id },
        { workerProfileId: workerUser.workerProfile.id, categoryId: createdCategories['ms-excel'].id },
        { workerProfileId: workerUser.workerProfile.id, categoryId: createdCategories['cv-career'].id },
        { workerProfileId: workerUser.workerProfile.id, categoryId: createdCategories['powerpoint'].id },
      ],
    });
  }

  // 5. Seed Real Service Packages with Dynamic Requirement Form Schemas
  const servicesData = [
    {
      categoryId: createdCategories['cv-career'].id,
      title: 'ATS-Optimized Executive Resume & Cover Letter Revamp',
      slug: 'ats-executive-resume-revamp',
      shortSummary: 'Transform your existing resume into a high-impact, keyword-rich CV designed to pass corporate Applicant Tracking Systems.',
      description: 'Our certified career specialists restructure your work history, emphasize measurable achievements, calibrate keywords for target roles, and supply a matching cover letter in both editable Word (.docx) and PDF formats.',
      basePrice: 4500.0,
      turnaroundHours: 48,
      requirementSchema: JSON.stringify([
        { id: 'target_role', label: 'Target Job Title / Position', type: 'text', placeholder: 'e.g. Senior Project Manager', required: true },
        { id: 'target_industry', label: 'Target Industry / Sector', type: 'select', options: ['Technology / Software', 'Banking & Finance', 'Healthcare & Medical', 'Engineering & Construction', 'Marketing & Sales', 'General Corporate'], required: true },
        { id: 'linkedin_url', label: 'Current LinkedIn URL (Optional)', type: 'text', placeholder: 'https://linkedin.com/in/yourname', required: false },
        { id: 'key_achievements', label: 'Key Milestones or Roles to Emphasize', type: 'textarea', placeholder: 'Detail any recent promotions, awards, or technical certifications to feature...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['ms-excel'].id,
      title: 'Advanced Excel Data Cleaning, Modeling & KPI Dashboard',
      slug: 'advanced-excel-cleaning-dashboard',
      shortSummary: 'Clean messy data, fix broken formulas, structure pivot tables, and build automated reporting dashboards.',
      description: 'Send us your raw spreadsheets and requirements. We resolve formula errors (#N/A, #VALUE), standardize date formats, build dynamic summaries with XLOOKUP and INDEX/MATCH, and produce interactive KPI charts.',
      basePrice: 6500.0,
      turnaroundHours: 48,
      requirementSchema: JSON.stringify([
        { id: 'task_type', label: 'Primary Excel Task', type: 'select', options: ['Data Cleaning & Formatting', 'Formula Correction & Automation', 'Pivot Table & Summary Dashboard', 'Financial / Budget Model'], required: true },
        { id: 'approx_rows', label: 'Approximate Row Count', type: 'select', options: ['Under 1,000 rows', '1,000 - 10,000 rows', '10,000 - 50,000 rows', '50,000+ rows'], required: true },
        { id: 'expected_output', label: 'Detailed Description of Desired Outcome', type: 'textarea', placeholder: 'Describe what calculations you need, what charts to display, or what issues need resolving...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['powerpoint'].id,
      title: 'High-Impact Corporate Pitch Deck & Slide Redesign',
      slug: 'corporate-pitch-deck-redesign',
      shortSummary: 'Upgrade basic PowerPoint slides into a sleek, persuasive presentation with custom graphics, icons, and visual layout.',
      description: 'Ideal for startup founder pitches, board meetings, client proposals, or keynote speeches. We enhance readability, incorporate corporate color schemes, craft visual infographics, and deliver 100% editable slides.',
      basePrice: 7500.0,
      turnaroundHours: 72,
      requirementSchema: JSON.stringify([
        { id: 'slide_count', label: 'Total Number of Slides', type: 'number', placeholder: 'e.g. 15', required: true },
        { id: 'presentation_audience', label: 'Target Audience', type: 'select', options: ['Angel Investors / VCs', 'Corporate Executive Board', 'Client Sales Meeting', 'Conference / Public Talk', 'Academic Defense'], required: true },
        { id: 'design_guidelines', label: 'Branding Colors & Style Preferences', type: 'textarea', placeholder: 'Specify brand colors (HEX codes), fonts, or links to existing branding materials...', required: false },
      ]),
    },
    {
      categoryId: createdCategories['ms-word'].id,
      title: 'Corporate Report Typesetting & Style Formatting',
      slug: 'corporate-report-style-formatting',
      shortSummary: 'Flawless document styling with auto-updating Table of Contents, consistent heading hierarchies, and custom headers/footers.',
      description: 'Turn a plain draft document into a publication-ready report. We calibrate margins, typography hierarchy, caption numbering, table formatting, and export print-ready PDFs along with the master Word template.',
      basePrice: 3500.0,
      turnaroundHours: 24,
      requirementSchema: JSON.stringify([
        { id: 'page_count', label: 'Approximate Page Count', type: 'number', placeholder: 'e.g. 25', required: true },
        { id: 'citation_style', label: 'Formatting Standard (if applicable)', type: 'select', options: ['Standard Corporate Report', 'APA 7th Edition', 'Harvard Style', 'IEEE Format', 'Custom Layout'], required: true },
        { id: 'special_notes', label: 'Specific Formatting Instructions', type: 'textarea', placeholder: 'Specify any guidelines for cover page, appendixes, or landscape tables...', required: false },
      ]),
    },
    {
      categoryId: createdCategories['programming-it'].id,
      title: 'Python Automation Script & Web Scraping Task',
      slug: 'python-automation-scripting',
      shortSummary: 'Custom Python scripts for automated data processing, file renaming, API queries, or web scraping.',
      description: 'Eliminate repetitive manual tasks with robust, documented Python automation scripts. Code includes comments, instructions for running, and clean error handling.',
      basePrice: 8500.0,
      turnaroundHours: 48,
      requirementSchema: JSON.stringify([
        { id: 'script_objective', label: 'Script Objective', type: 'text', placeholder: 'e.g. Download and aggregate daily CSVs from portal', required: true },
        { id: 'input_output_format', label: 'Input Data Format & Expected Output', type: 'select', options: ['CSV / Excel', 'JSON / REST API', 'Web HTML Scraping', 'PDF / Text Processing', 'Image Batch Processing'], required: true },
        { id: 'task_steps', label: 'Step-by-step Execution Requirements', type: 'textarea', placeholder: 'Detail the sequence of operations the script must perform...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['custom-requests'].id,
      title: 'Bespoke Digital Service Request',
      slug: 'bespoke-custom-service-request',
      shortSummary: 'Have a unique digital task? Submit your files and brief for a custom quote from our operations team.',
      description: 'If your requirement does not neatly fit predefined categories, submit your files and instructions here. The Administrator will review the scope and issue an itemized quotation within 2 business hours.',
      basePrice: 0.0, // Quoted dynamically
      turnaroundHours: 48,
      requirementSchema: JSON.stringify([
        { id: 'brief_summary', label: 'Project Summary & Objectives', type: 'textarea', placeholder: 'Provide a comprehensive overview of what you need accomplished...', required: true },
        { id: 'preferred_delivery_date', label: 'Desired Completion Date', type: 'date', required: true },
        { id: 'estimated_budget', label: 'Estimated Budget (LKR, Optional)', type: 'text', placeholder: 'e.g. 15,000 LKR', required: false },
      ]),
    },
  ];

  for (const s of servicesData) {
    await prisma.service.create({
      data: s,
    });
  }

  console.log('💼 Seeded 6 comprehensive service packages.');

  // 6. Create a Sample Active Order demonstrating the full state machine
  const sampleService = await prisma.service.findFirst({
    where: { slug: 'ats-executive-resume-revamp' },
  });

  if (sampleService) {
    const sampleOrder = await prisma.order.create({
      data: {
        orderNumber: 'ORD-2026-00101',
        customerId: customerUser.id,
        serviceId: sampleService.id,
        categoryId: sampleService.categoryId,
        title: 'Executive CV Revamp for Senior Project Manager',
        requirementsData: JSON.stringify({
          target_role: 'Senior Project Manager',
          target_industry: 'Technology / Software',
          linkedin_url: 'https://linkedin.com/in/sarah-perera-demo',
          key_achievements: 'Led cloud migration for fintech app; PMP certified; managed 18 engineers.',
        }),
        status: 'IN_PROGRESS',
        targetDeadline: new Date(Date.now() + 48 * 3600 * 1000),
        quotedPrice: 4500.0,
        platformCommissionRate: 0.20,
        platformFee: 900.0,
        workerPayout: 3600.0,
        quotationNotes: 'Approved standard package price. Turnaround 48 hours.',
        revisionsAllowed: 2,
        revisionsUsed: 0,
        files: {
          create: [
            {
              uploaderId: customerUser.id,
              fileTag: 'CUSTOMER_ORIGINAL',
              originalFilename: 'Sarah_Perera_Current_CV_2025.docx',
              storageFilename: 'mock-uuid-cv-orig.docx',
              fileSizeBytes: 145020,
              mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              filePath: 'uploads/customer/mock-uuid-cv-orig.docx',
            },
          ],
        },
        statusHistory: {
          create: [
            {
              fromStatus: null,
              toStatus: 'PENDING_REVIEW',
              changedById: customerUser.id,
              notes: 'Order submitted by customer.',
            },
            {
              fromStatus: 'PENDING_REVIEW',
              toStatus: 'QUOTATION_SENT',
              changedById: adminUser.id,
              notes: 'Quotation sent: 4500 LKR.',
            },
            {
              fromStatus: 'QUOTATION_SENT',
              toStatus: 'AWAITING_PAYMENT',
              changedById: customerUser.id,
              notes: 'Quotation accepted by customer.',
            },
            {
              fromStatus: 'AWAITING_PAYMENT',
              toStatus: 'READY_FOR_ASSIGNMENT',
              changedById: adminUser.id,
              notes: 'PayHere transaction verified (LKR 4,500.00). Escrow locked.',
            },
            {
              fromStatus: 'READY_FOR_ASSIGNMENT',
              toStatus: 'AWAITING_WORKER_ACCEPTANCE',
              changedById: adminUser.id,
              notes: 'Assigned to Kamal Silva with 6h acceptance window.',
            },
            {
              fromStatus: 'AWAITING_WORKER_ACCEPTANCE',
              toStatus: 'IN_PROGRESS',
              changedById: workerUser.id,
              notes: 'Assignment accepted by worker.',
            },
          ],
        },
        payments: {
          create: {
            customerId: customerUser.id,
            amount: 4500.0,
            currency: 'LKR',
            paymentMethod: 'PAYHERE',
            gatewayReference: 'PAYHERE_REF_98124',
            payherePaymentId: '320025190012',
            status: 'COMPLETED',
          },
        },
        assignments: {
          create: {
            workerId: workerUser.id,
            assignedById: adminUser.id,
            status: 'ACCEPTED',
            responseDeadline: new Date(Date.now() + 6 * 3600 * 1000),
            respondedAt: new Date(),
          },
        },
      },
    });

    console.log(`📦 Seeded sample live Order: ${sampleOrder.orderNumber}`);
  }

  console.log('✅ TaskPulse database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
