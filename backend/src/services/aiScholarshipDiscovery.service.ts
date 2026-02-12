import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppDataSource } from "../utils/db";
import { StudentProfile } from "../models/student_profiles";
import { Scholarship } from "../models/scholarships";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface ExtractedFilters {
  countries?: string[];
  academicLevels?: string[];
  fieldsOfStudy?: string[];
  interests?: string[];
  scholarshipTypes?: string[];
  hasDisability?: boolean;
  incomeLevel?: string;
  minGPA?: number;
}

export interface DiscoveryResult {
  scholarships: Array<{
    scholarship_id: number;
    title: string;
    organization_name: string;
    country: string;
    education_level: string;
    fields_of_study: string[];
    scholarship_type: string;
    deadline: string;
  }>;
  aiExplanation: string;
  extractedFilters: ExtractedFilters;
  totalMatches: number;
  isConversational?: boolean;
}

export class AIScholarshipDiscoveryService {
  private model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });

  private scholarshipRepo = AppDataSource.getRepository(Scholarship);
  private studentProfileRepo = AppDataSource.getRepository(StudentProfile);

  async discoverScholarships(
    query: string,
    studentId: number
  ): Promise<DiscoveryResult> {
    console.log("\n🚀 ===== NEW SCHOLARSHIP QUERY =====");
    console.log("📝 User Query:", query);
    console.log("👤 Student ID:", studentId);

    const studentProfile = await this.studentProfileRepo.findOne({
      where: { student_id: studentId },
    });

    if (!studentProfile) {
      throw new Error("Student profile not found");
    }

    console.log("👤 Student Profile:", {
      country: studentProfile.country,
      level: studentProfile.academic_level,
      field: studentProfile.field_of_study,
    });

    // RULE-BASED classification
    console.log("\n🔍 Step 1: Classifying query type...");
    const queryType = this.classifyQueryRuleBased(query);
    console.log("✅ Query classified as:", queryType);

    if (queryType !== "scholarship_search") {
      console.log("💬 Handling as conversational query\n");
      return this.handleConversationalQuery(query, queryType, studentProfile);
    }

    // RULE-BASED filter extraction
    console.log("\n🔎 Step 2: Extracting filters from query...");
    const extractedFilters = this.extractFiltersRuleBased(
      query,
      studentProfile
    );
    console.log(
      "✅ Filters extracted:",
      JSON.stringify(extractedFilters, null, 2)
    );

    console.log("\n🔎 Step 3: Searching database with filters...");
    const scholarships = await this.searchScholarships(
      extractedFilters,
      studentProfile
    );
    console.log(`📊 Database returned ${scholarships.length} scholarships`);

    console.log("\n📈 Step 4: Preparing results...");
    const results = this.rankScholarships(
      scholarships,
      extractedFilters,
      studentProfile
    );

    console.log("\n💬 Step 5: Generating explanation...");
    const aiExplanation = this.generateExplanationSimple(
      query,
      extractedFilters,
      results
    );

    console.log("🏁 ===== QUERY COMPLETE =====\n");

    return {
      scholarships: results.slice(0, 10),
      aiExplanation,
      extractedFilters,
      totalMatches: results.length,
    };
  }

  /**
   * RULE-BASED classification of user queries/requests
   */
  private classifyQueryRuleBased(query: string): string {
    const lowerQuery = query.toLowerCase().trim();

    // Greetings
    const greetings = [
      "hello",
      "hi",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
      "greetings",
      "howdy",
      "sup",
      "what's up",
    ];
    if (
      greetings.some(
        (g) =>
          lowerQuery === g ||
          lowerQuery === g + "!" ||
          lowerQuery.startsWith(g + " ")
      )
    ) {
      console.log("🏷️  Rule: greeting");
      return "greeting";
    }

    // System info
    if (
      lowerQuery.includes("how many") ||
      lowerQuery.includes("what can you") ||
      lowerQuery.includes("what do you do") ||
      lowerQuery.includes("your capabilities")
    ) {
      console.log("🏷️  Rule: system_info");
      return "system_info";
    }

    // Feedback
    if (
      lowerQuery.includes("frustrated") ||
      lowerQuery.includes("not working") ||
      lowerQuery.includes("broken") ||
      lowerQuery.includes("terrible")
    ) {
      console.log("🏷️  Rule: feedback");
      return "feedback";
    }

    // Help
    if (
      lowerQuery === "help" ||
      lowerQuery === "help me" ||
      lowerQuery.includes("how do i") ||
      lowerQuery === "what should i search"
    ) {
      console.log("🏷️  Rule: help");
      return "help";
    }

    // Everything else is scholarship search
    console.log("🏷️  Rule: scholarship_search");
    return "scholarship_search";
  }

  /**
   * RULE-BASED filter extraction
   */
  private extractFiltersRuleBased(
    query: string,
    studentProfile: StudentProfile
  ): ExtractedFilters {
    const lowerQuery = query.toLowerCase();
    const filters: ExtractedFilters = {};

    // Extract countries - Maps query text to database country names
    const countryMap: { [key: string]: string } = {
      // Full names
      algeria: "Algeria",
      australia: "Australia",
      austria: "Austria",
      belgium: "Belgium",
      botswana: "Botswana",
      bulgaria: "Bulgaria",
      cameroon: "Cameroon",
      canada: "Canada",
      croatia: "Croatia",
      cyprus: "Cyprus",
      "czech republic": "Czech Republic",
      denmark: "Denmark",
      egypt: "Egypt",
      estonia: "Estonia",
      ethiopia: "Ethiopia",
      finland: "Finland",
      france: "France",
      germany: "Germany",
      ghana: "Ghana",
      hungary: "Hungary",
      ireland: "Ireland",
      italy: "Italy",
      japan: "Japan",
      kenya: "Kenya",
      latvia: "Latvia",
      lithuania: "Lithuania",
      malawi: "Malawi",
      malta: "Malta",
      morocco: "Morocco",
      netherlands: "Netherlands",
      "new zealand": "New Zealand",
      nigeria: "Nigeria",
      norway: "Norway",
      poland: "Poland",
      portugal: "Portugal",
      romania: "Romania",
      rwanda: "Rwanda",
      senegal: "Senegal",
      singapore: "Singapore",
      slovakia: "Slovakia",
      slovenia: "Slovenia",
      "south africa": "South Africa",
      "south korea": "South Korea",
      spain: "Spain",
      sweden: "Sweden",
      switzerland: "Switzerland",
      tanzania: "Tanzania",
      tunisia: "Tunisia",
      uganda: "Uganda",
      "united kingdom": "United Kingdom",
      "united states": "United States",
      zambia: "Zambia",
      zimbabwe: "Zimbabwe",
      // Common abbreviations and variations
      usa: "United States",
      us: "United States",
      america: "United States",
      uk: "United Kingdom",
      britain: "United Kingdom",
      england: "United Kingdom",
      nz: "New Zealand",
      sa: "South Africa",
      korea: "South Korea",
      "s korea": "South Korea",
      sk: "South Korea",
      tz: "Tanzania",
      ke: "Kenya",
    };

    const foundCountries: string[] = [];
    for (const [keyword, country] of Object.entries(countryMap)) {
      if (lowerQuery.includes(keyword)) {
        if (!foundCountries.includes(country)) {
          foundCountries.push(country);
        }
      }
    }
    if (foundCountries.length > 0) {
      filters.countries = foundCountries;
      console.log("  → Found countries:", filters.countries);
    }

    // Extract academic levels - with all variations
    if (
      lowerQuery.includes("high school") ||
      lowerQuery.includes("secondary")
    ) {
      filters.academicLevels = ["High School / Secondary"];
      console.log("  → Found level: High School / Secondary");
    } else if (
      lowerQuery.includes("undergraduate") ||
      lowerQuery.includes("bachelor") ||
      lowerQuery.includes("bachelors") ||
      lowerQuery.includes("bachelor's") ||
      lowerQuery.includes("undergrad") ||
      lowerQuery.includes("bsc") ||
      lowerQuery.includes("b.sc") ||
      lowerQuery.includes("ba") ||
      lowerQuery.includes("b.a")
    ) {
      filters.academicLevels = ["Undergraduate / Bachelor's"];
      console.log("  → Found level: Undergraduate / Bachelor's");
    } else if (
      lowerQuery.includes("masters") ||
      lowerQuery.includes("master") ||
      lowerQuery.includes("master's") ||
      lowerQuery.includes("graduate") ||
      lowerQuery.includes("postgraduate") ||
      lowerQuery.includes("msc") ||
      lowerQuery.includes("m.sc") ||
      lowerQuery.includes("ma") ||
      lowerQuery.includes("m.a") ||
      lowerQuery.includes("mba")
    ) {
      filters.academicLevels = ["Graduate / Master's"];
      console.log("  → Found level: Graduate / Master's");
    } else if (
      lowerQuery.includes("phd") ||
      lowerQuery.includes("doctorate") ||
      lowerQuery.includes("doctoral") ||
      lowerQuery.includes("ph.d")
    ) {
      filters.academicLevels = ["Doctorate / PhD"];
      console.log("  → Found level: Doctorate / PhD");
    } else if (
      lowerQuery.includes("postdoc") ||
      lowerQuery.includes("postdoctoral") ||
      lowerQuery.includes("post-doctoral")
    ) {
      filters.academicLevels = ["Postdoctoral"];
      console.log("  → Found level: Postdoctoral");
    } else if (
      lowerQuery.includes("professional certification") ||
      lowerQuery.includes("certification") ||
      lowerQuery.includes("certificate")
    ) {
      filters.academicLevels = ["Professional Certification"];
      console.log("  → Found level: Professional Certification");
    } else if (
      lowerQuery.includes("vocational") ||
      lowerQuery.includes("technical") ||
      lowerQuery.includes("diploma")
    ) {
      filters.academicLevels = ["Vocational / Technical"];
      console.log("  → Found level: Vocational / Technical");
    }

    // Extract fields of study - Comprehensive mapping with variations
    const fieldMap: { [key: string]: string } = {
      // Business & Economics
      accounting: "Accounting",
      business: "Business",
      "business administration": "Business Administration",
      "business admin": "Business Administration",
      economics: "Economics",
      finance: "Finance",
      fintech: "Fintech",
      "financial technology": "Fintech",
      management: "Management",
      marketing: "Marketing",
      mba: "Business Administration",

      // Computer Science & Technology
      "computer science": "Computer Science",
      cs: "Computer Science",
      "comp sci": "Computer Science",
      computing: "Computer Science",
      "software engineering": "Software Engineering",
      "software development": "Software Engineering",
      "software dev": "Software Engineering",
      "computer engineering": "Computer Engineering",
      "information technology": "Information Technology",
      it: "Information Technology",
      "data science": "Data Science",
      cybersecurity: "Cybersecurity",
      "cyber security": "Cybersecurity",
      "information security": "Cybersecurity",
      "artificial intelligence": "Artificial Intelligence",
      ai: "Artificial Intelligence",
      "machine learning": "Machine Learning",
      ml: "Machine Learning",
      blockchain: "Blockchain",
      "cloud computing": "Cloud Computing",
      "mobile development": "Mobile Development",
      "mobile dev": "Mobile Development",
      "app development": "Mobile Development",
      iot: "IoT",
      "internet of things": "IoT",
      technology: "Technology",
      tech: "Technology",

      // Engineering
      engineering: "Engineering",
      "aerospace engineering": "Aerospace Engineering",
      "biomedical engineering": "Biomedical Engineering",
      "chemical engineering": "Chemical Engineering",
      "civil engineering": "Civil Engineering",
      "electrical engineering": "Electrical Engineering",
      "environmental engineering": "Environmental Engineering",
      "mechanical engineering": "Mechanical Engineering",

      // Sciences
      science: "Science",
      biology: "Biology",
      chemistry: "Chemistry",
      physics: "Physics",
      mathematics: "Mathematics",
      math: "Mathematics",
      maths: "Mathematics",
      statistics: "Statistics",
      stats: "Statistics",
      astronomy: "Astronomy",
      geology: "Geology",
      geography: "Geography",
      "environmental science": "Environmental Science",
      "renewable energy": "Renewable Energy",

      // Health & Medicine
      medicine: "Medicine",
      medical: "Medicine",
      nursing: "Nursing",
      pharmacy: "Pharmacy",
      dentistry: "Dentistry",
      "public health": "Public Health",
      veterinary: "Veterinary Science",
      "veterinary science": "Veterinary Science",

      // Social Sciences & Humanities
      psychology: "Psychology",
      sociology: "Sociology",
      anthropology: "Anthropology",
      "political science": "Political Science",
      politics: "Political Science",
      "international relations": "International Relations",
      history: "History",
      philosophy: "Philosophy",
      linguistics: "Linguistics",
      literature: "Literature",
      theology: "Theology",
      "social work": "Social Work",
      "public policy": "Public Policy",

      // Arts & Design
      art: "Art",
      design: "Design",
      "graphic design": "Graphic Design",
      "ui/ux": "UI/UX Design",
      "ux design": "UI/UX Design",
      "ui design": "UI/UX Design",
      "user experience": "UI/UX Design",
      "fashion design": "Fashion Design",
      fashion: "Fashion Design",
      animation: "Animation",
      architecture: "Architecture",
      "urban planning": "Urban Planning",

      // Media & Communications
      communications: "Communications",
      journalism: "Journalism",
      "media studies": "Media Studies",
      media: "Media Studies",
      "film studies": "Film Studies",
      film: "Film Studies",
      theatre: "Theatre",
      theater: "Theatre",
      music: "Music",

      // Agriculture & Environment
      agriculture: "Agriculture",
      farming: "Agriculture",

      // Education & Law
      education: "Education",
      teaching: "Education",
      law: "Law",
      "legal studies": "Law",

      // Robotics & Automation
      robotics: "Robotics",
      automation: "Automation",

      // Sports
      sports: "Sports",
      athletics: "Sports",
      "physical education": "Sports",
    };

    const foundFields: string[] = [];
    // Sort by length (longest first) to match "software engineering" before "software"
    const sortedKeys = Object.keys(fieldMap).sort(
      (a, b) => b.length - a.length
    );

    for (const keyword of sortedKeys) {
      // For very short keywords (2 chars or less), require word boundaries
      if (keyword.length <= 2) {
        // Use word boundary matching: \b matches word boundaries
        const wordBoundaryRegex = new RegExp(`\\b${keyword}\\b`, "i");
        if (wordBoundaryRegex.test(lowerQuery)) {
          const field = fieldMap[keyword];
          if (!foundFields.includes(field)) {
            foundFields.push(field);
          }
        }
      } else {
        // For longer keywords, use normal substring matching
        if (lowerQuery.includes(keyword)) {
          const field = fieldMap[keyword];
          if (!foundFields.includes(field)) {
            foundFields.push(field);
          }
        }
      }
    }

    if (foundFields.length > 0) {
      filters.fieldsOfStudy = foundFields;
      console.log("  → Found fields:", filters.fieldsOfStudy);
    }

    // Extract scholarship types - All types with variations
    const scholarshipTypeChecks = [
      {
        keywords: [
          "fully funded",
          "full funding",
          "full scholarship",
          "fully-funded",
        ],
        type: "Fully Funded",
      },
      {
        keywords: ["partial funding", "partial scholarship", "partial"],
        type: "Partial Funding",
      },
      {
        keywords: ["tuition only", "tuition waiver", "tuition-only"],
        type: "Tuition Only",
      },
      {
        keywords: ["living expenses", "stipend", "living allowance"],
        type: "Living Expenses Only",
      },
      {
        keywords: ["research grant", "research funding"],
        type: "Research Grant",
      },
      {
        keywords: ["fellowship"],
        type: "Fellowship",
      },
      {
        keywords: ["merit-based", "merit based", "merit scholarship"],
        type: "Merit-based",
      },
      {
        keywords: [
          "need-based",
          "need based",
          "financial need",
          "need based scholarship",
        ],
        type: "Need-based",
      },
      {
        keywords: ["sports scholarship", "athletic scholarship", "sports"],
        type: "Sports Scholarship",
      },
      {
        keywords: ["minority scholarship", "minority"],
        type: "Minority Scholarship",
      },
      {
        keywords: ["women in stem", "women stem", "female stem"],
        type: "Women in STEM",
      },
      {
        keywords: [
          "international students",
          "international scholarship",
          "foreign students",
        ],
        type: "International Students",
      },
      {
        keywords: ["exchange program", "study abroad", "exchange"],
        type: "Exchange Program",
      },
      {
        keywords: ["talent-based", "talent based", "talent scholarship"],
        type: "Talent-based",
      },
      {
        keywords: ["project-based", "project based"],
        type: "Project-based",
      },
      {
        keywords: ["contribution-based", "contribution based"],
        type: "Contribution-based",
      },
      {
        keywords: ["gender-based", "gender based"],
        type: "Gender-based",
      },
    ];

    for (const check of scholarshipTypeChecks) {
      if (check.keywords.some((keyword) => lowerQuery.includes(keyword))) {
        filters.scholarshipTypes = [check.type];
        console.log("  → Found type:", check.type);
        break; // Take first match
      }
    }

    // Extract interests (for description/title search)
    const interests: string[] = [];
    if (lowerQuery.includes("interested in")) {
      // Extract what comes after "interested in"
      const match = lowerQuery.match(/interested in (.+)/);
      if (match) {
        interests.push(match[1].trim());
      }
    }
    if (
      lowerQuery.includes("ai") ||
      lowerQuery.includes("artificial intelligence")
    ) {
      interests.push("AI", "Artificial Intelligence", "Machine Learning");
    }
    if (lowerQuery.includes("machine learning") || lowerQuery.includes("ml")) {
      interests.push("Machine Learning", "AI");
    }
    if (interests.length > 0) {
      filters.interests = [...new Set(interests)];
      console.log("  → Found interests:", filters.interests);
    }

    // If no filters found, use profile as defaults
    const hasFilters =
      filters.countries ||
      filters.academicLevels ||
      filters.fieldsOfStudy ||
      filters.scholarshipTypes ||
      filters.interests;
    if (!hasFilters) {
      console.log("  ⚠️  No specific filters found - using student profile");
      filters.countries = [studentProfile.country];
      filters.academicLevels = [studentProfile.academic_level];
      filters.fieldsOfStudy = [studentProfile.field_of_study];
    }

    return filters;
  }

  private async handleConversationalQuery(
    query: string,
    queryType: string,
    studentProfile: StudentProfile
  ): Promise<DiscoveryResult> {
    let response = "";

    switch (queryType) {
      case "greeting":
        response = `Hello! 👋 I'm your scholarship discovery assistant.

Try asking:
• "Find engineering scholarships"
• "Show me masters programs in Canada"
• "Fully funded opportunities"
• "Computer science scholarships"

What can I help you find?`;
        break;

      case "system_info":
        try {
          const totalCount = await this.scholarshipRepo.count({
            where: { status: "approved" },
          });
          response = `📊 We have **${totalCount} approved scholarships** in our database!

You can search by:
• Field: "computer science", "engineering", "medicine"
• Location: "Canada", "USA", "UK"
• Level: "undergraduate", "masters", "PhD"
• Funding: "fully funded", "partial funding"

What interests you?`;
        } catch (error) {
          response = `I can help you find scholarships! Try searching by field, location, or academic level.`;
        }
        break;

      case "feedback":
        response = `I'm sorry you're having trouble! 😔 Let me help.

Try being specific:
• "Engineering scholarships"
• "Masters in computer science"
• "Fully funded PhD programs"
• "Undergraduate opportunities in USA"

What would you like to find?`;
        break;

      case "help":
        response = `I can help you discover scholarships! 🎓

Search examples:
✅ "Engineering scholarships"
✅ "Masters programs in Canada"
✅ "Fully funded opportunities"
✅ "Computer science undergraduate"
✅ "PhD in medicine"

Try one!`;
        break;

      default:
        response =
          "I'm here to help you find scholarships. Try asking for scholarships by field, country, or level!";
    }

    return {
      scholarships: [],
      aiExplanation: response,
      extractedFilters: {},
      totalMatches: 0,
      isConversational: true,
    };
  }

  private async searchScholarships(
    filters: ExtractedFilters,
    studentProfile: StudentProfile
  ): Promise<Scholarship[]> {
    const queryBuilder = this.scholarshipRepo
      .createQueryBuilder("scholarship")
      .where("scholarship.status = :status", { status: "approved" }) // FIXED!
      .andWhere("scholarship.deadline > :today", { today: new Date() });

    let appliedFilters: string[] = [];

    if (filters.countries && filters.countries.length > 0) {
      const countryConditions = filters.countries
        .map((country) => {
          const escaped = country.replace(/'/g, "''");
          return `(
            scholarship.eligibility_countries @> '"${escaped}"'::jsonb OR
            scholarship.eligibility_countries @> '"Any"'::jsonb OR
            scholarship.eligibility_countries @> '"All Countries"'::jsonb OR
            scholarship.eligibility_countries IS NULL
          )`;
        })
        .join(" OR ");
      queryBuilder.andWhere(`(${countryConditions})`);
      appliedFilters.push(`Countries: ${filters.countries.join(", ")}`);
    }

    if (filters.academicLevels && filters.academicLevels.length > 0) {
      queryBuilder.andWhere("scholarship.education_level IN (:...levels)", {
        levels: filters.academicLevels,
      });
      appliedFilters.push(`Levels: ${filters.academicLevels.join(", ")}`);
    }

    if (filters.fieldsOfStudy && filters.fieldsOfStudy.length > 0) {
      const fieldConditions = filters.fieldsOfStudy
        .map((field) => {
          const escaped = field.replace(/'/g, "''");
          return `EXISTS (
            SELECT 1 FROM jsonb_array_elements_text(scholarship.fields_of_study) as field
            WHERE field ILIKE '%${escaped}%'
          )`;
        })
        .join(" OR ");
      queryBuilder.andWhere(`(${fieldConditions})`);
      appliedFilters.push(`Fields: ${filters.fieldsOfStudy.join(", ")}`);
    }

    if (filters.interests && filters.interests.length > 0) {
      const interestConditions = filters.interests
        .map((interest) => {
          const escaped = interest.replace(/'/g, "''");
          return `(
            scholarship.description ILIKE '%${escaped}%' OR
            scholarship.title ILIKE '%${escaped}%'
          )`;
        })
        .join(" OR ");
      queryBuilder.andWhere(`(${interestConditions})`);
      appliedFilters.push(`Interests: ${filters.interests.join(", ")}`);
    }

    if (filters.scholarshipTypes && filters.scholarshipTypes.length > 0) {
      queryBuilder.andWhere("scholarship.scholarship_type IN (:...types)", {
        types: filters.scholarshipTypes,
      });
      appliedFilters.push(`Types: ${filters.scholarshipTypes.join(", ")}`);
    }

    if (filters.hasDisability === true) {
      queryBuilder.andWhere("scholarship.requires_disability = true");
      appliedFilters.push("Disability: Yes");
    }

    if (filters.incomeLevel && filters.incomeLevel !== "any") {
      queryBuilder.andWhere(
        "(scholarship.income_level = :incomeLevel OR scholarship.income_level IS NULL)",
        { incomeLevel: filters.incomeLevel }
      );
      appliedFilters.push(`Income: ${filters.incomeLevel}`);
    }

    if (filters.minGPA && studentProfile.gpa_max) {
      queryBuilder.andWhere(
        "(scholarship.min_gpa IS NULL OR scholarship.min_gpa <= :studentGPA)",
        { studentGPA: studentProfile.gpa_max }
      );
      appliedFilters.push(`GPA: ${filters.minGPA}+`);
    }

    console.log(
      "🔍 SQL Filters applied:",
      appliedFilters.length > 0
        ? appliedFilters.join(" | ")
        : "NONE (broad search)"
    );

    // If no filters, limit results
    if (appliedFilters.length === 0) {
      queryBuilder.orderBy("scholarship.created_at", "DESC").limit(20);
    }

    const scholarships = await queryBuilder.getMany();

    if (scholarships.length > 0) {
      console.log("📋 Sample scholarship:", {
        title: scholarships[0].title,
        level: scholarships[0].education_level,
        fields: scholarships[0].fields_of_study,
        type: scholarships[0].scholarship_type,
      });
    }

    return scholarships;
  }

  private rankScholarships(
    scholarships: Scholarship[],
    filters: ExtractedFilters,
    studentProfile: StudentProfile
  ): Array<any> {
    // Simply return scholarships in the order they come from the database
    // No artificial match scoring - that's handled by the official MatchingService
    return scholarships.map((scholarship) => ({
      scholarship_id: scholarship.scholarship_id,
      title: scholarship.title,
      organization_name: scholarship.organization_name,
      country: scholarship.country,
      education_level: scholarship.education_level,
      fields_of_study: scholarship.fields_of_study,
      scholarship_type: scholarship.scholarship_type,
      deadline: scholarship.deadline,
    }));
  }

  /**
   * Simple explanation without match scores
   */
  private generateExplanationSimple(
    query: string,
    filters: ExtractedFilters,
    scholarships: Array<any>
  ): string {
    if (scholarships.length === 0) {
      const suggestions = [];
      if (filters.countries)
        suggestions.push("Try removing location restrictions");
      if (filters.fieldsOfStudy)
        suggestions.push("Try broader fields of study");
      if (filters.academicLevels)
        suggestions.push("Try different academic levels");

      return `No scholarships found for "${query}".${
        suggestions.length > 0
          ? "\n\nTry:\n• " + suggestions.join("\n• ")
          : " Try broadening your search criteria."
      }`;
    }

    const filtersUsed = [];
    if (filters.countries) filtersUsed.push(filters.countries.join(", "));
    if (filters.academicLevels)
      filtersUsed.push(filters.academicLevels.join(", "));
    if (filters.fieldsOfStudy)
      filtersUsed.push(filters.fieldsOfStudy.join(", "));
    if (filters.scholarshipTypes)
      filtersUsed.push(filters.scholarshipTypes.join(", "));

    let explanation = `Found ${scholarships.length} scholarship${
      scholarships.length > 1 ? "s" : ""
    } matching your search`;
    if (filtersUsed.length > 0) {
      explanation += ` for ${filtersUsed.join(" • ")}`;
    }
    explanation += `! 🎓`;

    if (scholarships.length > 0) {
      explanation += `\n\nShowing top results. Check them out below!`;
    }

    return explanation;
  }
}
