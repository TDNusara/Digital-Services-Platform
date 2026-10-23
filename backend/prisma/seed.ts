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

  // 5. Seed Real Digital Services across Target Customer Segments
  const servicesData = [
    // STUDENTS
    {
      categoryId: createdCategories['academic-support'].id,
      title: 'Academic Assignment Structuring & Guidance',
      slug: 'academic-assignment-guidance',
      shortSummary: 'Comprehensive assistance structuring, proofreading, and refining student assignments across diverse academic disciplines.',
      description: 'Receive tailored academic assistance including structure alignment, reference integration, rubric compliance check, and academic language refinement. Due to varied module requirements and grading criteria, this service is custom-quoted by our academic specialists.',
      pricingType: 'CUSTOM_QUOTE',
      basePrice: 0.0,
      targetAudience: 'Students',
      turnaroundHours: 48,
      requirementSchema: JSON.stringify([
        { id: 'academic_level', label: 'Academic Level', type: 'select', options: ['Undergraduate (Degree)', 'Postgraduate (Masters)', 'Diploma / Foundation', 'Secondary / High School'], required: true },
        { id: 'module_subject', label: 'Module / Subject Name', type: 'text', placeholder: 'e.g. Strategic Management, Computer Science, Economics', required: true },
        { id: 'word_count', label: 'Expected Word Count', type: 'number', placeholder: 'e.g. 2500', required: true },
        { id: 'grading_rubric', label: 'Key Grading Rubric or Guidelines', type: 'textarea', placeholder: 'Paste rubric criteria or specific tutor instructions...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['research-documentation'].id,
      title: 'Academic Research & Literature Review Document',
      slug: 'academic-research-document',
      shortSummary: 'Literature review compilation, citation alignment (APA, Harvard, IEEE), and methodology documentation for student dissertations.',
      description: 'In-depth secondary research synthesis, journal paper indexing, methodology write-up, and citation standard calibration. Custom quoted based on research depth and source count.',
      pricingType: 'CUSTOM_QUOTE',
      basePrice: 0.0,
      targetAudience: 'Students',
      turnaroundHours: 72,
      requirementSchema: JSON.stringify([
        { id: 'research_topic', label: 'Research Topic / Problem Statement', type: 'text', placeholder: 'e.g. Impact of AI on Retail Supply Chains', required: true },
        { id: 'citation_style', label: 'Citation Standard', type: 'select', options: ['APA 7th Edition', 'Harvard Style', 'IEEE Format', 'Chicago / Turabian', 'MLA 9th'], required: true },
        { id: 'number_of_sources', label: 'Minimum Peer-Reviewed Sources Required', type: 'number', placeholder: 'e.g. 15', required: true },
        { id: 'research_scope', label: 'Specific Research Focus / Methodology', type: 'textarea', placeholder: 'Outline objectives, key theories to explore, or search boundaries...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['powerpoint'].id,
      title: 'Student Project & Thesis Defense Presentation Slides',
      slug: 'student-project-presentation',
      shortSummary: 'Visual, high-clarity slide redesign for student project presentations, viva defenses, and seminar talks.',
      description: 'Convert draft slides or project report sections into sleek, visually compelling presentation slides with clean diagrams, speaker notes hints, and modern typography.',
      pricingType: 'FIXED',
      basePrice: 3500.0,
      targetAudience: 'Students',
      turnaroundHours: 48,
      requirementSchema: JSON.stringify([
        { id: 'slide_count', label: 'Number of Slides Needed', type: 'number', placeholder: 'e.g. 12', required: true },
        { id: 'defense_type', label: 'Presentation Type', type: 'select', options: ['Final Year Viva / Thesis Defense', 'Coursework Project Pitch', 'Seminar / Classroom Talk'], required: true },
        { id: 'key_findings', label: 'Core Findings & Highlights to Emphasize', type: 'textarea', placeholder: 'Detail key bullet points, metrics, or graphs to feature...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['academic-support'].id,
      title: 'Academic Report & Thesis Formatting',
      slug: 'academic-report-formatting',
      shortSummary: 'Standard university document typesetting, pagination, heading hierarchy, and table of contents generation.',
      description: 'Full thesis layout calibration: roman/arabic split pagination, auto-generating list of tables and figures, margin spacing, and bibliography formatting.',
      pricingType: 'FIXED',
      basePrice: 4000.0,
      targetAudience: 'Students',
      turnaroundHours: 24,
      requirementSchema: JSON.stringify([
        { id: 'page_count', label: 'Approximate Total Pages', type: 'number', placeholder: 'e.g. 40', required: true },
        { id: 'university_name', label: 'University / Institute Name', type: 'text', placeholder: 'e.g. University of Colombo / SLIIT', required: true },
        { id: 'style_manual', label: 'Formatting Standard', type: 'select', options: ['APA 7th Edition', 'Harvard Formatting', 'IEEE Standard', 'University Official Template'], required: true },
      ]),
    },
    {
      categoryId: createdCategories['ms-excel'].id,
      title: 'Student Survey Data & Lab Excel Modeling',
      slug: 'student-survey-excel-work',
      shortSummary: 'Cleaning questionnaire survey responses, calculating descriptive statistics, ANOVA/t-test summaries, and charts in Excel.',
      description: 'Clean Google Forms or survey data, code variables, produce frequency tables, mean/standard deviation summaries, and generate publishable charts for project reports.',
      pricingType: 'FIXED',
      basePrice: 3000.0,
      targetAudience: 'Students',
      turnaroundHours: 36,
      requirementSchema: JSON.stringify([
        { id: 'sample_size', label: 'Number of Survey Respondents / Rows', type: 'select', options: ['Under 100 responses', '100 - 300 responses', '300 - 1,000 responses', '1,000+ responses'], required: true },
        { id: 'tests_needed', label: 'Desired Statistical Analyses / Charts', type: 'textarea', placeholder: 'Specify charts, percentage distributions, correlation, or summary tables needed...', required: true },
      ]),
    },

    // JOB SEEKERS
    {
      categoryId: createdCategories['cv-career'].id,
      title: 'ATS-Optimized Professional CV & Resume Revamp',
      slug: 'ats-executive-resume-revamp',
      shortSummary: 'Transform your existing resume into a high-impact, keyword-rich CV designed to pass Applicant Tracking Systems.',
      description: 'Our certified career specialists restructure your work history, emphasize measurable achievements, calibrate keywords for target roles, and supply matching editable Word (.docx) and PDF formats.',
      pricingType: 'FIXED',
      basePrice: 4500.0,
      targetAudience: 'Job Seekers',
      turnaroundHours: 48,
      requirementSchema: JSON.stringify([
        { id: 'target_role', label: 'Target Job Title / Position', type: 'text', placeholder: 'e.g. Senior Project Manager', required: true },
        { id: 'target_industry', label: 'Target Industry / Sector', type: 'select', options: ['Technology / Software', 'Banking & Finance', 'Healthcare & Medical', 'Engineering & Construction', 'Marketing & Sales', 'General Corporate'], required: true },
        { id: 'linkedin_url', label: 'Current LinkedIn URL (Optional)', type: 'text', placeholder: 'https://linkedin.com/in/yourname', required: false },
        { id: 'key_achievements', label: 'Key Milestones or Roles to Emphasize', type: 'textarea', placeholder: 'Detail any recent promotions, awards, or technical certifications to feature...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['cv-career'].id,
      title: 'Tailored Executive Job Application Cover Letter',
      slug: 'targeted-job-cover-letter',
      shortSummary: 'Persuasive, targeted cover letters that directly connect your background to the specific job advertisement.',
      description: 'Craft a compelling narrative that answers why you are the ideal fit for the role, emphasizing specific requirements from the employer\'s job description.',
      pricingType: 'FIXED',
      basePrice: 2500.0,
      targetAudience: 'Job Seekers',
      turnaroundHours: 24,
      requirementSchema: JSON.stringify([
        { id: 'target_company', label: 'Target Company / Organization', type: 'text', placeholder: 'e.g. Dialog Axiata / Virtusa', required: true },
        { id: 'target_position', label: 'Target Position Title', type: 'text', placeholder: 'e.g. Business Analyst', required: true },
        { id: 'job_link_or_text', label: 'Job Description or Key Responsibilities', type: 'textarea', placeholder: 'Paste job advert requirements or link here...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['cv-career'].id,
      title: 'Comprehensive Job Application Form Assistance',
      slug: 'job-application-assistance',
      shortSummary: 'Support completing intricate government, multinational, or overseas visa & employment application questionnaires.',
      description: 'Custom quoted according to the length and complexity of the employment portal or selection criteria essays required.',
      pricingType: 'CUSTOM_QUOTE',
      basePrice: 0.0,
      targetAudience: 'Job Seekers',
      turnaroundHours: 48,
      requirementSchema: JSON.stringify([
        { id: 'portal_name', label: 'Company / Agency Portal', type: 'text', placeholder: 'e.g. UN Careers, Civil Service, Overseas Work Permit', required: true },
        { id: 'form_questions_count', label: 'Number of Essay / Competency Questions', type: 'number', placeholder: 'e.g. 4', required: true },
        { id: 'competency_framework', label: 'Specific Competencies / Instructions', type: 'textarea', placeholder: 'Detail STAR methodology guidelines or prompt questions...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['cv-career'].id,
      title: 'LinkedIn Profile Content & Headline Optimization',
      slug: 'linkedin-profile-content',
      shortSummary: 'Professional LinkedIn headline, About summary, experience bullet revamp, and creator keyword optimization.',
      description: 'Boost recruiter inbound inquiries with an optimized LinkedIn profile narrative, structured headline with role keywords, and an engaging first-person summary.',
      pricingType: 'FIXED',
      basePrice: 3500.0,
      targetAudience: 'Job Seekers',
      turnaroundHours: 36,
      requirementSchema: JSON.stringify([
        { id: 'current_linkedin', label: 'Existing LinkedIn Profile URL', type: 'text', placeholder: 'https://linkedin.com/in/username', required: true },
        { id: 'career_pivot', label: 'Career Objective or Next Target Level', type: 'text', placeholder: 'e.g. Transition from QA to Product Management', required: true },
        { id: 'core_strengths', label: 'Core Skills & Strengths to Feature', type: 'textarea', placeholder: 'Highlight leadership, technical tools, or specialized knowledge...', required: true },
      ]),
    },

    // EMPLOYEES
    {
      categoryId: createdCategories['business-proposals'].id,
      title: 'Workplace Business Reports & Summary Briefs',
      slug: 'workplace-business-reports',
      shortSummary: 'Transform rough workplace notes and metrics into structured, polished management briefs and quarterly reports.',
      description: 'Fast turnaround business report drafting with executive summaries, status tables, risk matrices, and action items formatted to corporate standards.',
      pricingType: 'FIXED',
      basePrice: 4000.0,
      targetAudience: 'Employees',
      turnaroundHours: 24,
      requirementSchema: JSON.stringify([
        { id: 'report_title', label: 'Report Focus / Subject', type: 'text', placeholder: 'e.g. Q3 Operations Performance Review', required: true },
        { id: 'key_data_points', label: 'Data Points & Main Takeaways', type: 'textarea', placeholder: 'List main accomplishments, challenges, and next milestones...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['ms-excel'].id,
      title: 'Corporate Excel Sheets & Formula Automation',
      slug: 'corporate-excel-sheets',
      shortSummary: 'Automate daily spreadsheet tasks with dynamic formulas (XLOOKUP, SUMIFS), pivot summaries, and conditional formatting.',
      description: 'Streamline your daily job tasks. We fix formula syntax errors, connect multiple sheets, remove duplicates, and build automated trackers.',
      pricingType: 'FIXED',
      basePrice: 5000.0,
      targetAudience: 'Employees',
      turnaroundHours: 24,
      requirementSchema: JSON.stringify([
        { id: 'sheet_purpose', label: 'Purpose of Spreadsheet', type: 'text', placeholder: 'e.g. Monthly Sales Tracker / Inventory Reconciliation', required: true },
        { id: 'excel_requirements', label: 'Specific Calculations or Automations Needed', type: 'textarea', placeholder: 'Describe what formulas or automated outputs you need...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['ms-word'].id,
      title: 'Professional Word Documents & Corporate Styles',
      slug: 'corporate-report-style-formatting',
      shortSummary: 'Flawless document styling with auto-updating Table of Contents, corporate headers/footers, and clean typography.',
      description: 'Turn plain internal memos or draft manuals into publication-ready documents. We calibrate margins, typography hierarchy, caption numbering, and export print-ready PDFs.',
      pricingType: 'FIXED',
      basePrice: 3500.0,
      targetAudience: 'Employees',
      turnaroundHours: 24,
      requirementSchema: JSON.stringify([
        { id: 'page_count', label: 'Approximate Page Count', type: 'number', placeholder: 'e.g. 20', required: true },
        { id: 'formatting_instructions', label: 'Specific Layout Preferences', type: 'textarea', placeholder: 'Mention company colors, headers/footers, or logo placement...', required: false },
      ]),
    },
    {
      categoryId: createdCategories['powerpoint'].id,
      title: 'Corporate Executive Presentation & Slide Decks',
      slug: 'corporate-pitch-deck-redesign',
      shortSummary: 'Modern presentation design for departmental reviews, management presentations, and client demonstrations.',
      description: 'High-impact slide redesign matching corporate branding guidelines, infographics, charts, and clean layouts.',
      pricingType: 'FIXED',
      basePrice: 6000.0,
      targetAudience: 'Employees',
      turnaroundHours: 48,
      requirementSchema: JSON.stringify([
        { id: 'slide_count', label: 'Total Number of Slides', type: 'number', placeholder: 'e.g. 15', required: true },
        { id: 'brand_colors', label: 'Company Brand Colors / Style (Optional)', type: 'text', placeholder: 'e.g. Navy Blue #003366 and Gold #FFD700', required: false },
        { id: 'presentation_notes', label: 'Key Audience & Presentation Goal', type: 'textarea', placeholder: 'Describe target audience and key message to communicate...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['data-entry'].id,
      title: 'Administrative Data Entry & Sheet Transcription',
      slug: 'admin-data-entry-transcription',
      shortSummary: 'Rapid typing, digital transcription, scanned receipts / invoice data capture into organized spreadsheets.',
      description: 'Custom quoted based on volume of entries, file clarity, and turnaround urgency.',
      pricingType: 'CUSTOM_QUOTE',
      basePrice: 0.0,
      targetAudience: 'Employees',
      turnaroundHours: 48,
      requirementSchema: JSON.stringify([
        { id: 'record_count', label: 'Estimated Records / Pages to Transcribe', type: 'number', placeholder: 'e.g. 250 invoices', required: true },
        { id: 'source_file_type', label: 'Source File Format', type: 'select', options: ['Scanned PDFs / Images', 'Handwritten Log Sheets', 'Web Portal Copy-Paste', 'Audio Dictation'], required: true },
        { id: 'instructions', label: 'Field Mapping Instructions', type: 'textarea', placeholder: 'Specify columns to extract (e.g. Date, Invoice Number, Amount, Vendor)...', required: true },
      ]),
    },

    // BUSINESSES
    {
      categoryId: createdCategories['data-entry'].id,
      title: 'Business Data Entry & Large-Scale Records Management',
      slug: 'business-data-entry-management',
      shortSummary: 'Scalable data processing, CRM updates, product catalog data entry, and customer database cleansing for companies.',
      description: 'High-volume business data entry executed with double-entry verification and QA standards. Quoted according to database complexity.',
      pricingType: 'CUSTOM_QUOTE',
      basePrice: 0.0,
      targetAudience: 'Businesses',
      turnaroundHours: 72,
      requirementSchema: JSON.stringify([
        { id: 'target_platform', label: 'Target System / Database', type: 'text', placeholder: 'e.g. Excel, Shopify, Salesforce, PostgreSQL', required: true },
        { id: 'volume_estimate', label: 'Estimated Volume (Rows / Products)', type: 'select', options: ['500 - 2,500 items', '2,500 - 10,000 items', '10,000+ items'], required: true },
        { id: 'verification_rules', label: 'Data Validation Rules', type: 'textarea', placeholder: 'Specify required formats, validation checks, or deduplication rules...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['ms-excel'].id,
      title: 'Advanced Excel Management, Models & KPI Dashboards',
      slug: 'advanced-excel-cleaning-dashboard',
      shortSummary: 'Custom business financial models, cashflow forecasts, automated inventory managers, and dynamic executive dashboards.',
      description: 'End-to-end spreadsheet architecture for enterprises. We construct interconnected workbooks, automated macro/VBA logic, and real-time visualization.',
      pricingType: 'CUSTOM_QUOTE',
      basePrice: 0.0,
      targetAudience: 'Businesses',
      turnaroundHours: 48,
      requirementSchema: JSON.stringify([
        { id: 'model_type', label: 'Model Type', type: 'select', options: ['Financial / Cashflow Forecast Model', 'Inventory & Warehouse Tracker', 'Sales Commission / Payroll Calculator', 'Executive KPI BI Dashboard'], required: true },
        { id: 'complexity_description', label: 'Detailed Description of Business Logic', type: 'textarea', placeholder: 'Detail inputs, calculation rules, scenarios, and desired visual charts...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['business-proposals'].id,
      title: 'Business Proposals, Tender Documents & Feasibility Reports',
      slug: 'business-proposals-tenders',
      shortSummary: 'High-stakes RFP tender submissions, investor prospectuses, and commercial contract proposals prepared by specialists.',
      description: 'Tailored bid documentation with compelling value propositions, technical specifications, compliance matrices, and commercial breakdown tables.',
      pricingType: 'CUSTOM_QUOTE',
      basePrice: 0.0,
      targetAudience: 'Businesses',
      turnaroundHours: 72,
      requirementSchema: JSON.stringify([
        { id: 'tender_type', label: 'Proposal Scope / RFP Name', type: 'text', placeholder: 'e.g. Commercial Construction Tender / IT Vendor Bid', required: true },
        { id: 'submission_deadline', label: 'Strict Submission Deadline', type: 'date', required: true },
        { id: 'scope_outline', label: 'Core Capabilities & Commercial Parameters', type: 'textarea', placeholder: 'Describe solution details, pricing structure, and key differentiators to include...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['powerpoint'].id,
      title: 'Investor Pitch Decks & Boardroom Presentations',
      slug: 'investor-pitch-deck-presentation',
      shortSummary: 'Venture capital pitch decks, startup fundraising presentations, and high-stakes board meeting slide suites.',
      description: 'Story-driven slide deck redesign focusing on problem-solution framing, market sizing (TAM/SAM/SOM), business model economics, and traction metrics.',
      pricingType: 'FIXED',
      basePrice: 8500.0,
      targetAudience: 'Businesses',
      turnaroundHours: 48,
      requirementSchema: JSON.stringify([
        { id: 'slide_count', label: 'Total Number of Slides', type: 'number', placeholder: 'e.g. 15', required: true },
        { id: 'funding_stage', label: 'Company Stage / Purpose', type: 'select', options: ['Seed / Angel Round', 'Series A / Venture Capital', 'Board of Directors Meeting', 'Strategic Partnership Pitch'], required: true },
        { id: 'brand_assets', label: 'Branding Assets & Target Metrics', type: 'textarea', placeholder: 'Include brand guidelines, website link, and key financial metrics to feature...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['programming-it'].id,
      title: 'Website & Custom Software IT Bug Fixes / Script Automation',
      slug: 'python-automation-scripting',
      shortSummary: 'Python automation, website frontend bug fixes, database SQL queries, API integration, and web scrapers.',
      description: 'Solve technical hurdles fast. Our verified software specialists deliver clean, documented code and bug solutions for businesses.',
      pricingType: 'CUSTOM_QUOTE',
      basePrice: 0.0,
      targetAudience: 'Businesses',
      turnaroundHours: 48,
      requirementSchema: JSON.stringify([
        { id: 'tech_stack', label: 'Programming Language / Framework', type: 'text', placeholder: 'e.g. Python, React/Node, WordPress, SQL', required: true },
        { id: 'task_type', label: 'Task Category', type: 'select', options: ['Bug Fix / Troubleshooting', 'Automation Script / Web Scraper', 'API Integration', 'Database Optimization', 'Small Feature Development'], required: true },
        { id: 'task_details', label: 'Detailed Technical Brief', type: 'textarea', placeholder: 'Describe bug symptoms, expected behavior, or script inputs/outputs...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['ms-word'].id,
      title: 'Master Document Creation & Standard Operating Procedures',
      slug: 'master-document-creation',
      shortSummary: 'Comprehensive company SOP manuals, employee handbooks, and standardized corporate policy documents.',
      description: 'Custom quoted based on departmental complexity and total document size.',
      pricingType: 'CUSTOM_QUOTE',
      basePrice: 0.0,
      targetAudience: 'Businesses',
      turnaroundHours: 72,
      requirementSchema: JSON.stringify([
        { id: 'document_scope', label: 'Document Focus', type: 'text', placeholder: 'e.g. Company HR Handbook & Safety SOPs', required: true },
        { id: 'process_notes', label: 'Operational Steps & Policy Notes', type: 'textarea', placeholder: 'Detail procedures to document and corporate branding requirements...', required: true },
      ]),
    },

    // GENERAL CUSTOMERS
    {
      categoryId: createdCategories['ms-word'].id,
      title: 'Official Letters & Formal Correspondence Drafting',
      slug: 'official-letters-drafting',
      shortSummary: 'Formal letters for legal inquiries, tenancy, banks, embassies, dispute notices, and corporate correspondence.',
      description: 'Properly formatted, articulate formal letters written with correct tone, legal clarity, and professional presentation ready to print or email.',
      pricingType: 'FIXED',
      basePrice: 2500.0,
      targetAudience: 'General Customers',
      turnaroundHours: 24,
      requirementSchema: JSON.stringify([
        { id: 'letter_purpose', label: 'Letter Purpose / Recipient', type: 'text', placeholder: 'e.g. Bank Loan Request / Landlord Notice / Embassy Letter', required: true },
        { id: 'letter_facts', label: 'Key Facts & Demands / Inquiries to Include', type: 'textarea', placeholder: 'Explain situation, dates, names, reference numbers, and what outcome you seek...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['pdf-services'].id,
      title: 'Official Forms & Digital Form Filling Assistance',
      slug: 'official-form-filling',
      shortSummary: 'Assistance completing complex PDF applications, visa checklists, and government digital forms.',
      description: 'Avoid costly rejections. We verify requirements, transcribe your details into digital fillable forms, and validate all fields.',
      pricingType: 'FIXED',
      basePrice: 2000.0,
      targetAudience: 'General Customers',
      turnaroundHours: 24,
      requirementSchema: JSON.stringify([
        { id: 'form_name', label: 'Name of Form / Agency', type: 'text', placeholder: 'e.g. Schengen Visa Application / Company Registration Form', required: true },
        { id: 'special_notes', label: 'Any Particular Clarifications', type: 'textarea', placeholder: 'Specify any ambiguous questions you need expert help answering...', required: false },
      ]),
    },
    {
      categoryId: createdCategories['pdf-services'].id,
      title: 'PDF Editing, Form Conversion & OCR Recovery',
      slug: 'pdf-editing-conversion-ocr',
      shortSummary: 'Make scanned unsearchable PDFs editable, fix typos, add interactive digital form fields, and compress without quality loss.',
      description: 'High-fidelity PDF manipulation: text replacement on flattened documents, form field creation, merging, password unlocking, and clean formatting.',
      pricingType: 'FIXED',
      basePrice: 2500.0,
      targetAudience: 'General Customers',
      turnaroundHours: 24,
      requirementSchema: JSON.stringify([
        { id: 'page_count', label: 'Total Pages to Process', type: 'number', placeholder: 'e.g. 10', required: true },
        { id: 'pdf_task_type', label: 'Primary PDF Operation', type: 'select', options: ['Text Correction / Header Edit', 'Create Fillable Interactive Form', 'OCR Scanned Document Recovery', 'Split, Merge & Compress'], required: true },
        { id: 'instructions', label: 'Specific Edits Required', type: 'textarea', placeholder: 'Detail exact text changes or fields to add...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['ms-word'].id,
      title: 'Document Formatting, Typesetting & Layout Fixes',
      slug: 'general-document-formatting',
      shortSummary: 'Fix broken margins, messy spacing, overlapping images, and inconsistent fonts in Word or PDF files.',
      description: 'Fast beautification for personal manuscripts, family history books, booklets, or community newsletters.',
      pricingType: 'FIXED',
      basePrice: 2000.0,
      targetAudience: 'General Customers',
      turnaroundHours: 24,
      requirementSchema: JSON.stringify([
        { id: 'page_count', label: 'Approximate Pages', type: 'number', placeholder: 'e.g. 15', required: true },
        { id: 'layout_instructions', label: 'Desired Layout or Style', type: 'textarea', placeholder: 'Specify preferred font, margin size, or booklet format...', required: false },
      ]),
    },
    {
      categoryId: createdCategories['data-entry'].id,
      title: 'Fast Typing & Handwritten Notes to Word Document',
      slug: 'fast-typing-transcription',
      shortSummary: 'Accurate transcription of handwritten manuscripts, printed booklets, or receipts into editable Word files.',
      description: 'Up to 99.8% transcription accuracy with proofreading. Fast delivery with exact paragraphing.',
      pricingType: 'FIXED',
      basePrice: 1800.0,
      targetAudience: 'General Customers',
      turnaroundHours: 24,
      requirementSchema: JSON.stringify([
        { id: 'page_count', label: 'Number of Pages to Type', type: 'number', placeholder: 'e.g. 8', required: true },
        { id: 'language', label: 'Document Language', type: 'select', options: ['English', 'Sinhala', 'Tamil', 'Bilingual'], required: true },
        { id: 'special_instructions', label: 'Formatting Instructions', type: 'textarea', placeholder: 'Mention if tables or diagrams are present in the notes...', required: false },
      ]),
    },
    {
      categoryId: createdCategories['pdf-services'].id,
      title: 'File Conversion & Document Rebuilding (PDF to Word/Excel)',
      slug: 'file-conversion-rebuilding',
      shortSummary: 'Convert non-editable PDF, scanned images, or table images into fully editable, clean Word and Excel files.',
      description: 'We don\'t rely on messy automated converters. Our team manually reconstructs complex tables, alignment, and formatting.',
      pricingType: 'FIXED',
      basePrice: 1500.0,
      targetAudience: 'General Customers',
      turnaroundHours: 12,
      requirementSchema: JSON.stringify([
        { id: 'output_format', label: 'Desired Output Format', type: 'select', options: ['Microsoft Word (.docx)', 'Microsoft Excel (.xlsx)', 'PowerPoint (.pptx)'], required: true },
        { id: 'page_count', label: 'Number of Pages', type: 'number', placeholder: 'e.g. 5', required: true },
      ]),
    },
    {
      categoryId: createdCategories['graphic-design'].id,
      title: 'Digital Graphic, Flyer & Social Media Design',
      slug: 'digital-graphic-flyer-design',
      shortSummary: 'Eye-catching promotional flyers, social media post graphics, event banners, and digital marketing materials.',
      description: 'Custom creative designs tailored to your event, product launch, or brand. Custom quoted depending on design assets and sizes.',
      pricingType: 'CUSTOM_QUOTE',
      basePrice: 0.0,
      targetAudience: 'General Customers',
      turnaroundHours: 48,
      requirementSchema: JSON.stringify([
        { id: 'graphic_type', label: 'Design Asset Type', type: 'select', options: ['Promotional Flyer / Poster', 'Instagram / Facebook Post Banner', 'Business Card / Stationery', 'Infographic Diagram'], required: true },
        { id: 'dimensions', label: 'Dimensions / Orientation', type: 'text', placeholder: 'e.g. A4 print, 1080x1080 Square, 1920x1080 HD', required: true },
        { id: 'text_content', label: 'Text & Content to Include', type: 'textarea', placeholder: 'Paste headline, date, contact info, and branding guidelines...', required: true },
      ]),
    },
    {
      categoryId: createdCategories['custom-requests'].id,
      title: 'Bespoke Digital Service Request',
      slug: 'bespoke-custom-service-request',
      shortSummary: 'Have a unique digital task? Submit your files and brief for an itemized quotation from our operations team.',
      description: 'If your requirement does not neatly fit predefined categories, submit your files and instructions here. The Administrator will review the scope and issue an itemized quotation within 2 business hours.',
      pricingType: 'CUSTOM_QUOTE',
      basePrice: 0.0,
      targetAudience: 'General Customers',
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

  console.log(`💼 Seeded ${servicesData.length} comprehensive digital services across 5 customer groups.`);

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
