"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database, PublicQuizOption, QuestionWithOptions } from "@/types/database";
import type { Json } from "@/types/database";
import { 
  type BadgeTitle, 
  sanitizeUserName, 
  sanitizeLga, 
  calculateBadgeTitle 
} from "@/lib/quiz-utils";

export type { BadgeTitle };

export interface SubmitQuizPayload {
  userName?: string;
  user_name?: string;
  lga?: string | null;
  answers: Array<{
    question_id: string;
    selected_option_id: string;
  }>;
}

export interface QuizSubmissionResult {
  score: number;
  total: number;
  percentage: number;
  badgeTitle: BadgeTitle;
  submissionId: string;
}

/**
 * Modern Fisher-Yates (Knuth) shuffle algorithm to randomize option order on the server.
 */
function shuffleArray<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Seed questions fallback for offline / development testing when Supabase
 * credentials have not yet been linked or the database is unseeded.
 * NOTE: Answer keys (`is_correct`) are completely excluded to maintain zero-client-trust.
 */
const FALLBACK_QUESTIONS: QuestionWithOptions[] = [
  {
    id: "f1000000-0000-0000-0000-000000000001",
    category_id: "c1000000-0000-0000-0000-000000000001",
    question_text: "Which traditional Akwa Ibom delicacy is prepared primarily using grated water yam wrapped in leaves?",
    explanation: "Ekpang Nkukwo is a cherished traditional delicacy made from grated cocoyam or water yam wrapped carefully in cocoyam or sweet potato leaves and simmered with palm oil and rich seafood.",
    category: { name: "Food & Cuisine", slug: "food-cuisine" },
    options: [
      { id: "o1000000-0000-0000-0000-000000000001", question_id: "f1000000-0000-0000-0000-000000000001", option_text: "Afang Soup" },
      { id: "o1000000-0000-0000-0000-000000000002", question_id: "f1000000-0000-0000-0000-000000000001", option_text: "Ekpang Nkukwo" },
      { id: "o1000000-0000-0000-0000-000000000003", question_id: "f1000000-0000-0000-0000-000000000001", option_text: "Edikang Ikong" },
      { id: "o1000000-0000-0000-0000-000000000004", question_id: "f1000000-0000-0000-0000-000000000001", option_text: "Asa Iwa" },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000002",
    category_id: "c1000000-0000-0000-0000-000000000001",
    question_text: 'Which indigenous aromatic leaf, botanically known as Piper guineense, is commonly called "Odusa" in local soups?',
    explanation: "Piper guineense is commonly called Uziza or Odusa and provides a pungent, fragrant aroma in native culinary preparations.",
    category: { name: "Food & Cuisine", slug: "food-cuisine" },
    options: [
      { id: "o1000000-0000-0000-0000-000000000005", question_id: "f1000000-0000-0000-0000-000000000002", option_text: "Uziza / Odusa" },
      { id: "o1000000-0000-0000-0000-000000000006", question_id: "f1000000-0000-0000-0000-000000000002", option_text: "Utasi" },
      { id: "o1000000-0000-0000-0000-000000000007", question_id: "f1000000-0000-0000-0000-000000000002", option_text: "Atama" },
      { id: "o1000000-0000-0000-0000-000000000008", question_id: "f1000000-0000-0000-0000-000000000002", option_text: "Editan" },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000003",
    category_id: "c1000000-0000-0000-0000-000000000001",
    question_text: 'What combination of main leaves gives the famous Akwa Ibom "Atama Soup" its signature aroma and texture?',
    explanation: "Atama soup gets its legendary rich texture and bouquet from fresh shredded atama leaves steeped in fresh palm fruit pulp extract (Abak).",
    category: { name: "Food & Cuisine", slug: "food-cuisine" },
    options: [
      { id: "o1000000-0000-0000-0000-000000000009", question_id: "f1000000-0000-0000-0000-000000000003", option_text: "Waterleaf and Okra" },
      { id: "o1000000-0000-0000-0000-000000000010", question_id: "f1000000-0000-0000-0000-000000000003", option_text: "Atama leaf and Palm Fruit Extract (Abak)" },
      { id: "o1000000-0000-0000-0000-000000000011", question_id: "f1000000-0000-0000-0000-000000000003", option_text: "Bitterleaf and Egusi" },
      { id: "o1000000-0000-0000-0000-000000000012", question_id: "f1000000-0000-0000-0000-000000000003", option_text: "Scent leaf and Spinach" },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000004",
    category_id: "c1000000-0000-0000-0000-000000000002",
    question_text: "How many Local Government Areas make up Akwa Ibom State?",
    explanation: "Akwa Ibom State comprises 31 Local Government Areas across Uyo, Ikot Ekpene, and Eket Senatorial Districts.",
    category: { name: "LGAs & Geography", slug: "lgas-geography" },
    options: [
      { id: "o1000000-0000-0000-0000-000000000013", question_id: "f1000000-0000-0000-0000-000000000004", option_text: "27" },
      { id: "o1000000-0000-0000-0000-000000000014", question_id: "f1000000-0000-0000-0000-000000000004", option_text: "31" },
      { id: "o1000000-0000-0000-0000-000000000015", question_id: "f1000000-0000-0000-0000-000000000004", option_text: "36" },
      { id: "o1000000-0000-0000-0000-000000000016", question_id: "f1000000-0000-0000-0000-000000000004", option_text: "25" },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000005",
    category_id: "c1000000-0000-0000-0000-000000000002",
    question_text: "Which coastal Local Government Area in Akwa Ibom houses major offshore oil operations and the longest coastline in Nigeria?",
    explanation: "Ibeno LGA features the longest open sand beach coastline in West Africa, stretching over 30 kilometers along the Atlantic.",
    category: { name: "LGAs & Geography", slug: "lgas-geography" },
    options: [
      { id: "o1000000-0000-0000-0000-000000000017", question_id: "f1000000-0000-0000-0000-000000000005", option_text: "Ikot Abasi" },
      { id: "o1000000-0000-0000-0000-000000000018", question_id: "f1000000-0000-0000-0000-000000000005", option_text: "Ibeno" },
      { id: "o1000000-0000-0000-0000-000000000019", question_id: "f1000000-0000-0000-0000-000000000005", option_text: "Oron" },
      { id: "o1000000-0000-0000-0000-000000000020", question_id: "f1000000-0000-0000-0000-000000000005", option_text: "Eastern Obolo" },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000006",
    category_id: "c1000000-0000-0000-0000-000000000002",
    question_text: 'In which LGA is the historic "Amalgamation House"—where Lord Lugard signed the 1914 amalgamation of Nigeria—located?',
    explanation: "The historic Amalgamation House is located in Ikot Abasi LGA along the Imo River estuary.",
    category: { name: "LGAs & Geography", slug: "lgas-geography" },
    options: [
      { id: "o1000000-0000-0000-0000-000000000021", question_id: "f1000000-0000-0000-0000-000000000006", option_text: "Uyo" },
      { id: "o1000000-0000-0000-0000-000000000022", question_id: "f1000000-0000-0000-0000-000000000006", option_text: "Ikot Abasi" },
      { id: "o1000000-0000-0000-0000-000000000023", question_id: "f1000000-0000-0000-0000-000000000006", option_text: "Ikot Ekpene" },
      { id: "o1000000-0000-0000-0000-000000000024", question_id: "f1000000-0000-0000-0000-000000000006", option_text: "Eket" },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000007",
    category_id: "c1000000-0000-0000-0000-000000000003",
    question_text: 'What does the celebrated Akwa Ibom socio-cultural philosophy "Dakkada" translate to in English?',
    explanation: '"Dakkada" translates to "Arise" or "Stand Up", embodying pride, self-reliance, and faith in divine destiny.',
    category: { name: "Languages & Cultural Heritage", slug: "languages-cultural-heritage" },
    options: [
      { id: "o1000000-0000-0000-0000-000000000025", question_id: "f1000000-0000-0000-0000-000000000007", option_text: "Move Forward" },
      { id: "o1000000-0000-0000-0000-000000000026", question_id: "f1000000-0000-0000-0000-000000000007", option_text: "Arise and Shine / Arise" },
      { id: "o1000000-0000-0000-0000-000000000027", question_id: "f1000000-0000-0000-0000-000000000007", option_text: "Unity is Strength" },
      { id: "o1000000-0000-0000-0000-000000000028", question_id: "f1000000-0000-0000-0000-000000000007", option_text: "Peace and Progress" },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000008",
    category_id: "c1000000-0000-0000-0000-000000000003",
    question_text: "Which major ethnic group and dialect is predominantly native to the Ikot Ekpene Senatorial District?",
    explanation: "The Annang people are native to Ikot Ekpene Senatorial District, famous for woodcarving, raffia craftsmanship, and rich cultural traditions.",
    category: { name: "Languages & Cultural Heritage", slug: "languages-cultural-heritage" },
    options: [
      { id: "o1000000-0000-0000-0000-000000000029", question_id: "f1000000-0000-0000-0000-000000000008", option_text: "Annang" },
      { id: "o1000000-0000-0000-0000-000000000030", question_id: "f1000000-0000-0000-0000-000000000008", option_text: "Oron" },
      { id: "o1000000-0000-0000-0000-000000000031", question_id: "f1000000-0000-0000-0000-000000000008", option_text: "Eket" },
      { id: "o1000000-0000-0000-0000-000000000032", question_id: "f1000000-0000-0000-0000-000000000008", option_text: "Ibeno" },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000009",
    category_id: "c1000000-0000-0000-0000-000000000003",
    question_text: "Which ancestral group in Akwa Ibom is traditionally governed by the Ohiokim Oron council of elders?",
    explanation: "The Oron (Oro) nation of Akwa Ibom has its venerable cultural leadership rooted in the Ohiokim Oron council.",
    category: { name: "Languages & Cultural Heritage", slug: "languages-cultural-heritage" },
    options: [
      { id: "o1000000-0000-0000-0000-000000000033", question_id: "f1000000-0000-0000-0000-000000000009", option_text: "Annang" },
      { id: "o1000000-0000-0000-0000-000000000034", question_id: "f1000000-0000-0000-0000-000000000009", option_text: "Oron (Oro)" },
      { id: "o1000000-0000-0000-0000-000000000035", question_id: "f1000000-0000-0000-0000-000000000009", option_text: "Ekid" },
      { id: "o1000000-0000-0000-0000-000000000036", question_id: "f1000000-0000-0000-0000-000000000009", option_text: "Ibiono" },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000010",
    category_id: "c1000000-0000-0000-0000-000000000004",
    question_text: "Who was appointed as the first Military Administrator of Akwa Ibom State upon its creation in September 1987?",
    explanation: "Col. Tunde Ogbeha was appointed as the pioneer Military Administrator of the new state in September 1987.",
    category: { name: "Past Leaders & History", slug: "past-leaders-history" },
    options: [
      { id: "o1000000-0000-0000-0000-000000000037", question_id: "f1000000-0000-0000-0000-000000000010", option_text: "Col. Tunde Ogbeha" },
      { id: "o1000000-0000-0000-0000-000000000038", question_id: "f1000000-0000-0000-0000-000000000010", option_text: "Col. Godwin Abbe" },
      { id: "o1000000-0000-0000-0000-000000000039", question_id: "f1000000-0000-0000-0000-000000000010", option_text: "Obong Victor Attah" },
      { id: "o1000000-0000-0000-0000-000000000040", question_id: "f1000000-0000-0000-0000-000000000010", option_text: "Wing Commander Idongesit Nkanga" },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000011",
    category_id: "c1000000-0000-0000-0000-000000000004",
    question_text: "Who served as the first democratically elected civilian Governor of Akwa Ibom State in the Third Republic (1992)?",
    explanation: "Obong Akpan Isemin served as the first civilian executive governor during the Nigerian Third Republic between 1992 and 1993.",
    category: { name: "Past Leaders & History", slug: "past-leaders-history" },
    options: [
      { id: "o1000000-0000-0000-0000-000000000041", question_id: "f1000000-0000-0000-0000-000000000011", option_text: "Obong Akpan Isemin" },
      { id: "o1000000-0000-0000-0000-000000000042", question_id: "f1000000-0000-0000-0000-000000000011", option_text: "Obong Victor Attah" },
      { id: "o1000000-0000-0000-0000-000000000043", question_id: "f1000000-0000-0000-0000-000000000011", option_text: "Chief Godswill Akpabio" },
      { id: "o1000000-0000-0000-0000-000000000044", question_id: "f1000000-0000-0000-0000-000000000011", option_text: "Dr. Clement Isong" },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000012",
    category_id: "c1000000-0000-0000-0000-000000000004",
    question_text: "Which former Governor is credited with establishing Ibom Air and initiating the Victor Attah International Airport expansion?",
    explanation: "Governor Udom Emmanuel established Ibom Air in 2019 and led major aviation infrastructure expansions including the new smart terminal.",
    category: { name: "Past Leaders & History", slug: "past-leaders-history" },
    options: [
      { id: "o1000000-0000-0000-0000-000000000045", question_id: "f1000000-0000-0000-0000-000000000012", option_text: "Chief Godswill Akpabio" },
      { id: "o1000000-0000-0000-0000-000000000046", question_id: "f1000000-0000-0000-0000-000000000012", option_text: "Mr. Udom Emmanuel" },
      { id: "o1000000-0000-0000-0000-000000000047", question_id: "f1000000-0000-0000-0000-000000000012", option_text: "Pastor Umo Eno" },
      { id: "o1000000-0000-0000-0000-000000000048", question_id: "f1000000-0000-0000-0000-000000000012", option_text: "Obong Victor Attah" },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000013",
    category_id: "c1000000-0000-0000-0000-000000000005",
    question_text: "On what exact date was Akwa Ibom State created from the former Cross River State?",
    explanation: "Akwa Ibom State was created on September 23, 1987, by General Ibrahim Babangida.",
    category: { name: "Landmarks & State Milestones", slug: "landmarks-state-milestones" },
    options: [
      { id: "o1000000-0000-0000-0000-000000000049", question_id: "f1000000-0000-0000-0000-000000000013", option_text: "September 23, 1987" },
      { id: "o1000000-0000-0000-0000-000000000050", question_id: "f1000000-0000-0000-0000-000000000013", option_text: "August 27, 1991" },
      { id: "o1000000-0000-0000-0000-000000000051", question_id: "f1000000-0000-0000-0000-000000000013", option_text: "May 27, 1967" },
      { id: "o1000000-0000-0000-0000-000000000052", question_id: "f1000000-0000-0000-0000-000000000013", option_text: "October 1, 1960" },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000014",
    category_id: "c1000000-0000-0000-0000-000000000005",
    question_text: "What state-owned commercial airline launched by Akwa Ibom State is the first of its kind in Nigeria?",
    explanation: "Ibom Air is the only state-owned commercial airline in Nigeria, renowned for industry-leading on-time performance.",
    category: { name: "Landmarks & State Milestones", slug: "landmarks-state-milestones" },
    options: [
      { id: "o1000000-0000-0000-0000-000000000053", question_id: "f1000000-0000-0000-0000-000000000014", option_text: "Anchor Air" },
      { id: "o1000000-0000-0000-0000-000000000054", question_id: "f1000000-0000-0000-0000-000000000014", option_text: "Ibom Air" },
      { id: "o1000000-0000-0000-0000-000000000055", question_id: "f1000000-0000-0000-0000-000000000014", option_text: "Dakkada Airlines" },
      { id: "o1000000-0000-0000-0000-000000000056", question_id: "f1000000-0000-0000-0000-000000000014", option_text: "Orange Air" },
    ],
  },
  {
    id: "f1000000-0000-0000-0000-000000000015",
    category_id: "c1000000-0000-0000-0000-000000000005",
    question_text: 'What modern 30,000-capacity sports facility in Uyo is popularly nicknamed the "Nest of Champions"?',
    explanation: 'The Godswill Akpabio International Stadium in Uyo is internationally acclaimed and nicknamed the "Nest of Champions".',
    category: { name: "Landmarks & State Milestones", slug: "landmarks-state-milestones" },
    options: [
      { id: "o1000000-0000-0000-0000-000000000057", question_id: "f1000000-0000-0000-0000-000000000015", option_text: "Uyo Township Stadium" },
      { id: "o1000000-0000-0000-0000-000000000058", question_id: "f1000000-0000-0000-0000-000000000015", option_text: "Godswill Akpabio International Stadium" },
      { id: "o1000000-0000-0000-0000-000000000059", question_id: "f1000000-0000-0000-0000-000000000015", option_text: "Eket Township Stadium" },
      { id: "o1000000-0000-0000-0000-000000000060", question_id: "f1000000-0000-0000-0000-000000000015", option_text: "Ikot Ekpene Sports Complex" },
    ],
  },
];

// Offline answers lookup used ONLY if Supabase is unreachable/placeholder during development
const DEV_OFFLINE_CORRECT_MAP: Record<string, string> = {
  "f1000000-0000-0000-0000-000000000001": "o1000000-0000-0000-0000-000000000002",
  "f1000000-0000-0000-0000-000000000002": "o1000000-0000-0000-0000-000000000005",
  "f1000000-0000-0000-0000-000000000003": "o1000000-0000-0000-0000-000000000010",
  "f1000000-0000-0000-0000-000000000004": "o1000000-0000-0000-0000-000000000014",
  "f1000000-0000-0000-0000-000000000005": "o1000000-0000-0000-0000-000000000018",
  "f1000000-0000-0000-0000-000000000006": "o1000000-0000-0000-0000-000000000022",
  "f1000000-0000-0000-0000-000000000007": "o1000000-0000-0000-0000-000000000026",
  "f1000000-0000-0000-0000-000000000008": "o1000000-0000-0000-0000-000000000029",
  "f1000000-0000-0000-0000-000000000009": "o1000000-0000-0000-0000-000000000034",
  "f1000000-0000-0000-0000-000000000010": "o1000000-0000-0000-0000-000000000037",
  "f1000000-0000-0000-0000-000000000011": "o1000000-0000-0000-0000-000000000041",
  "f1000000-0000-0000-0000-000000000012": "o1000000-0000-0000-0000-000000000046",
  "f1000000-0000-0000-0000-000000000013": "o1000000-0000-0000-0000-000000000049",
  "f1000000-0000-0000-0000-000000000014": "o1000000-0000-0000-0000-000000000054",
  "f1000000-0000-0000-0000-000000000015": "o1000000-0000-0000-0000-000000000058",
};

/**
 * Check if the current Supabase configuration uses placeholders.
 */
function isPlaceholderConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    !url ||
    !anonKey ||
    url.includes("placeholder-project") ||
    anonKey.includes("placeholder")
  );
}

/**
 * 1. fetchQuizQuestions()
 * Fetches questions and joins with public_quiz_options view.
 * Strictly NEVER queries raw `options` table directly to prevent exposing answer keys.
 * Shuffles options randomly on the server before returning.
 */
export async function fetchQuizQuestions(): Promise<QuestionWithOptions[]> {
  // If Supabase credentials are placeholder or unconfigured, return the production fallback directly
  if (isPlaceholderConfig()) {
    return FALLBACK_QUESTIONS.map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));
  }

  try {
    const supabase = await createClient();

    // 1. Fetch questions joined with category
    const { data: questions, error: qError } = await supabase
      .from("questions")
      .select(`
        id,
        category_id,
        question_text,
        explanation,
        categories (
          name,
          slug
        )
      `)
      .order("created_at", { ascending: true });

    // 2. Fetch options strictly from the secure public_quiz_options view
    const { data: options, error: optError } = await supabase
      .from("public_quiz_options")
      .select("id, question_id, option_text");

    if (qError || optError || !questions || questions.length === 0) {
      // In development or when Supabase project is unlinked/offline, use production fallback
      return FALLBACK_QUESTIONS.map((q) => ({
        ...q,
        options: shuffleArray(q.options),
      }));
    }

    // Group options by question_id
    const optionsMap = new Map<string, PublicQuizOption[]>();
    if (options) {
      for (const opt of options) {
        const list = optionsMap.get(opt.question_id) || [];
        list.push({
          id: opt.id,
          question_id: opt.question_id,
          option_text: opt.option_text,
        });
        optionsMap.set(opt.question_id, list);
      }
    }

    // Assemble and shuffle options on the server
    const assembled: QuestionWithOptions[] = questions.map((q) => {
      const qOptions = optionsMap.get(q.id) || [];
      const cat = q.categories as unknown as { name: string; slug: string } | null;

      return {
        id: q.id,
        category_id: q.category_id,
        question_text: q.question_text,
        explanation: q.explanation,
        category: cat ? { name: cat.name, slug: cat.slug } : undefined,
        // Shuffle options randomly on the server
        options: shuffleArray(qOptions),
      };
    });

    return assembled;
  } catch (err) {
    console.warn("Error fetching questions from Supabase, serving fallback question set:", err);
    return FALLBACK_QUESTIONS.map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));
  }
}

/**
 * 2. submitQuizAnswers(payload)
 * Server action to securely process, evaluate, and save quiz submissions.
 * - Sanitizes user_name (max 25 characters, scripts stripped).
 * - Calls evaluate_quiz_submission RPC on Supabase.
 * - Computes score percentage and determines badge title.
 * - Saves submission to quiz_submissions table.
 * - Returns { score, total, percentage, badgeTitle, submissionId }.
 */
export async function submitQuizAnswers(payload: SubmitQuizPayload): Promise<QuizSubmissionResult> {
  // Extract and sanitize username
  const rawUserName = payload.userName ?? payload.user_name;
  if (!rawUserName) {
    throw new Error("User name is required.");
  }
  const sanitizedUserName = sanitizeUserName(rawUserName);
  const sanitizedLga = sanitizeLga(payload.lga);

  if (!Array.isArray(payload.answers) || payload.answers.length === 0) {
    throw new Error("Answers array cannot be empty.");
  }

  // Sanitize payload answers format
  const formattedAnswers = payload.answers.map((ans) => ({
    question_id: String(ans.question_id).trim(),
    selected_option_id: String(ans.selected_option_id).trim(),
  }));

  const totalQuestions = formattedAnswers.length;
  let score = 0;
  let evaluatedViaRpc = false;
  let submissionId = crypto.randomUUID();

  if (!isPlaceholderConfig()) {
    try {
      const supabase = await createClient();

      // 3. Call evaluate_quiz_submission Supabase RPC
      const { data: rpcData, error: rpcError } = await supabase.rpc(
        "evaluate_quiz_submission",
        {
          p_answers: formattedAnswers as unknown as Json,
        }
      );

      if (!rpcError && rpcData && rpcData.length > 0) {
        score = rpcData[0].calculated_score;
        evaluatedViaRpc = true;
      }

      // 4. Calculate percentage and badge title
      const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
      const badgeTitle = calculateBadgeTitle(percentage);

      // 5. Save submission to quiz_submissions table
      const { data: submission, error: insertError } = await supabase
        .from("quiz_submissions")
        .insert({
          user_name: sanitizedUserName,
          lga: sanitizedLga,
          score,
          total_questions: totalQuestions,
          badge_title: badgeTitle,
        })
        .select("id")
        .single();

      if (!insertError && submission?.id) {
        submissionId = submission.id;
        try {
          revalidatePath("/");
          revalidatePath("/admin");
        } catch {}
      }

      return {
        score,
        total: totalQuestions,
        percentage,
        badgeTitle,
        submissionId,
      };
    } catch (err) {
      console.warn("Supabase evaluation failed, falling back to local scoring:", err);
      evaluatedViaRpc = false;
    }
  }

  // Development fallback evaluation when Supabase is not connected or RPC failed
  if (!evaluatedViaRpc) {
    let fallbackScore = 0;
    for (const ans of formattedAnswers) {
      if (DEV_OFFLINE_CORRECT_MAP[ans.question_id] === ans.selected_option_id) {
        fallbackScore++;
      }
    }
    score = fallbackScore;
  }

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const badgeTitle = calculateBadgeTitle(percentage);

  return {
    score,
    total: totalQuestions,
    percentage,
    badgeTitle,
    submissionId,
  };
}
