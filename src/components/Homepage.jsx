import React from "react";
import {
  BookOpen,
  CheckCircle,
  Target,
  Edit3,
  Award,
  MoveUpRight,
  ClipboardCopy,
  BarChart,
  FileQuestion,
  Star,
  BrainCircuit,
  Filter,
  Twitter,
  Linkedin,
  Youtube,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Star as LucideStar,
} from "lucide-react";
import DarkModeToggle from "./ui/DarkModeToggle";
import { ContainerTextFlip } from "./ui/container-text-flip";
import { BentoGrid, BentoGridItem } from "./ui/BentoGrid";
import { InfiniteMovingCards } from "./ui/InfiniteMovingCards";

const Homepage = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-gray-900 dark:text-gray-50 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                Redomind
              </h1>
            </button>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <DarkModeToggle />
              <button
                onClick={onLogin}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-gray-200/50 dark:hover:bg-slate-800/50 transition-all duration-200 text-sm font-medium"
              >
                Login
              </button>
              <button
                onClick={onGetStarted}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 sm:px-6 py-2 rounded-xl hover:shadow-lg transition-all duration-200 text-sm font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center justify-center overflow-hidden py-24 sm:py-32 md:py-40">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/20 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-slate-700/20 [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-gradient-to-br from-transparent via-white/20 to-transparent dark:from-transparent dark:via-slate-800/20 dark:to-transparent [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
            Track Your SAT Mistakes and
            <br />
            <ContainerTextFlip
              words={["Improve Fast", "Boost Your Score", "Master Weak Areas"]}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent"
            />
          </h1>
          <p className="mt-4 font-normal text-base md:text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Log your wrong answers, review question types, and turn mistakes
            into mastery with AI-powered insights and personalized practice.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={onGetStarted}
              className="relative inline-flex h-12 overflow-hidden rounded-lg p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl">
              Get Started Free
              </span>
            </button>
            <button
              onClick={onLogin}
              className="relative inline-flex h-12 overflow-hidden rounded-lg p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-gray-100/80 dark:bg-slate-700/80 px-8 py-1 text-sm font-medium text-slate-800 dark:text-white backdrop-blur-3xl border border-gray-300 dark:border-slate-600">
              Login
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Problem → Solution Strip */}
      <ProblemSolutionStrip />

      {/* Live Dashboard Demo (Lottie/MP4 placeholder) */}
      <DashboardDemo />

      {/* Infinite Scroll Logos */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-white/50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-slate-700/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-center text-sm font-semibold text-gray-500 dark:text-slate-400 mb-6 tracking-wide">
            AS SEEN IN TOP EDUCATIONAL RESOURCES
          </h3>
          <InfiniteMovingCards items={logos} direction="right" speed="slow" />
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-20 bg-gradient-to-br from-gray-50/50 via-white/30 to-blue-50/20 dark:from-slate-950/50 dark:via-slate-900/30 dark:to-slate-800/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
              A Smarter Way to Prepare
            </h2>
            <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
              Our platform is more than just a question log. It's an intelligent
              system designed to help you learn from your mistakes.
            </p>
          </div>
          <BentoGrid className="max-w-4xl mx-auto">
            {features.map((item, i) => (
              <BentoGridItem
                key={i}
                title={item.title}
                description={item.description}
                header={item.header}
                icon={item.icon}
                className={item.className}
              />
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-white/50 via-purple-50/30 to-pink-50/20 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-slate-700/20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 dark:from-white dark:via-purple-100 dark:to-pink-100 bg-clip-text text-transparent">
              Loved by Students Nationwide
            </h2>
            <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
              See how Redomind is transforming SAT prep for students just like you.
            </p>
          </div>
          <div className="relative flex h-[500px] flex-col items-center justify-center overflow-hidden rounded-lg">
            <InfiniteMovingCards
              items={testimonials}
              direction="right"
              speed="slow"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-br from-white/50 via-blue-50/30 to-indigo-50/20 dark:from-slate-900/50 dark:via-slate-800/30 dark:to-slate-700/20 relative overflow-hidden">
        <div className="text-center max-w-4xl mx-auto px-4">
          <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
            Ready to Ace the SAT?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
            Start your journey to a higher score today. No credit card required.
          </p>
          <div className="mt-8">
            <button
              onClick={onGetStarted}
              className="bg-gradient-to-r from-slate-900 to-slate-800 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px text-xs font-semibold leading-6 text-white inline-block"
            >
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(56,189,248,0.6)_0%,rgba(56,189,248,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </span>
              <div className="relative flex space-x-2 items-center z-10 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 py-4 px-8 ring-1 ring-white/10 ">
                <span>Start Your Free Trial</span>
                <MoveUpRight className="w-4 h-4" />
              </div>
              <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40" />
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Toggle Section */}
      <PricingSection />

      {/* FAQ Accordion */}
      <FAQSection />

      {/* Newsletter CTA */}
      <NewsletterCTA />

      {/* Footer */}
      <Footer />
    </div>
  );
};

// --- Bento Grid Components ---

const MockQuizChart = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-blue-100 dark:to-blue-900/30 p-4 relative overflow-hidden">
    <div className="w-1/3 pr-2">
      <p className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-1">Score</p>
      <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">88%</p>
      <p className="text-xs text-blue-800 dark:text-blue-300/80">+12%</p>
    </div>
    <div className="w-2/3 flex items-end">
      <div className="w-full h-full flex items-end gap-1">
        {[40, 60, 50, 75, 88].map((h, i) => (
          <div key={i} className="flex-1 bg-blue-300/70 dark:bg-blue-500/60 rounded-t-sm" style={{ height: `${h}%` }}></div>
        ))}
      </div>
    </div>
  </div>
);

const MockQuestionList = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-indigo-50 dark:from-indigo-900/20 to-indigo-100 dark:to-indigo-900/30 p-2 space-y-1">
    <div className="bg-white/50 dark:bg-slate-800/30 rounded-md p-1.5 text-xs text-indigo-900 dark:text-indigo-200">
      Standard Model
    </div>
    <div className="bg-white/50 dark:bg-slate-800/30 rounded-md p-1.5 text-xs text-indigo-900 dark:text-indigo-200">
      Heart of Algebra
    </div>
    <div className="bg-white/50 dark:bg-slate-800/30 rounded-md p-1.5 text-xs text-indigo-900 dark:text-indigo-200">
      Words in Context
    </div>
  </div>
);

const MockPersonalizedQuiz = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-amber-50 dark:from-amber-900/20 to-amber-100 dark:to-amber-900/30 p-3 flex flex-col justify-center items-center text-center">
    <FileQuestion className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-1" />
    <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
      10 Question Quiz
    </p>
    <p className="text-xs text-amber-800 dark:text-amber-300">
      from your error log
    </p>
  </div>
);

const MockAiInsights = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-emerald-50 dark:from-emerald-900/20 to-emerald-100 dark:to-emerald-900/30 p-2 flex-col space-y-1">
    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1 px-1">
      AI Suggestion:
    </p>
    <div className="bg-white/50 dark:bg-slate-800/30 rounded-md p-1.5 text-xs text-emerald-900 dark:text-emerald-200">
      Focus on 'Heart of Algebra'
    </div>
    <div className="bg-white/50 dark:bg-slate-800/30 rounded-md p-1.5 text-xs text-emerald-900 dark:text-emerald-200">
      Review comma usage rules
    </div>
  </div>
);

const MockFilterPills = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-pink-50 dark:from-pink-900/20 to-pink-100 dark:to-pink-900/30 p-3 flex flex-wrap gap-2 content-start">
    <span className="bg-pink-200/50 dark:bg-pink-500/20 text-pink-900 dark:text-pink-200 rounded-full px-2.5 py-1 text-xs font-medium">
      Reading
    </span>
    <span className="bg-pink-200/50 dark:bg-pink-500/20 text-pink-900 dark:text-pink-200 rounded-full px-2.5 py-1 text-xs font-medium">
      Math
    </span>
    <span className="bg-pink-200/50 dark:bg-pink-500/20 text-pink-900 dark:text-pink-200 rounded-full px-2.5 py-1 text-xs font-medium">
      Hard
    </span>
    <span className="bg-white/50 dark:bg-slate-800/30 rounded-full px-2.5 py-1 text-xs">
      Medium
    </span>
    <span className="bg-white/50 dark:bg-slate-800/30 rounded-full px-2.5 py-1 text-xs">
      Algebra
    </span>
  </div>
);

const features = [
  {
    title: "Effortless Question Logging",
    description: "Quickly capture any question you get wrong. Just copy and paste.",
    header: <MockQuestionList />,
    icon: <ClipboardCopy className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-1",
  },
  {
    title: "Personalized Quizzes",
    description: "Generate practice quizzes from your error log to target your weaknesses.",
    header: <MockPersonalizedQuiz />,
    icon: <FileQuestion className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-1",
  },
  {
    title: "AI-Powered Insights",
    description: "Our AI analyzes your mistakes and provides actionable feedback.",
    header: <MockAiInsights />,
    icon: <BrainCircuit className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-1",
  },
  {
    title: "Track Your Progress",
    description: "Visualize your improvement with detailed performance analytics. See trends, score breakdowns, and more.",
    header: <MockQuizChart />,
    icon: <BarChart className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-2",
  },
  {
    title: "Focus on What Matters",
    description: "Filter by section, domain, and question type to focus your prep.",
    header: <MockFilterPills />,
    icon: <Filter className="h-4 w-4 text-neutral-500" />,
    className: "md:col-span-1",
  },
];

const logos = [
  "KHAN ACADEMY",
  "COLLEGE BOARD",
  "THE PRINCETON REVIEW",
  "KAPLAN",
  "BARRON'S",
  "VARSITY TUTORS",
];

const testimonials = [
  {
    quote:
      "This tool was a game-changer. I was able to pinpoint exactly where I was going wrong and my score jumped 150 points!",
    name: "Sarah L.",
    title: "High School Student, California",
    avatar: "SL",
    stars: 5,
  },
  {
    quote:
      "Being able to generate quizzes from my own mistakes is brilliant. It's the most efficient way to study I've ever found.",
    name: "Michael C.",
    title: "SAT Prep Tutor",
    avatar: "MC",
    stars: 5,
  },
  {
    quote:
      "I used to dread reviewing my practice tests. Redomind made it simple and even a bit fun. I finally broke 1500!",
    name: "Jessica P.",
    title: "High School Student, New York",
    avatar: "JP",
    stars: 5,
  },
  {
    quote:
      "The analytics are fantastic. I could see my weak areas in the Reading section and focused my efforts there. Highly recommend.",
    name: "David H.",
    title: "High School Student, Texas",
    avatar: "DH",
    stars: 4,
  },
  {
    quote:
      "As a parent, I love that my son has a structured way to learn from his errors instead of just taking test after test.",
    name: "Emily R.",
    title: "Parent, Florida",
    avatar: "ER",
    stars: 5,
  },
];

// --- New Sections and Footer ---

// Problem → Solution Strip
const ProblemSolutionStrip = () => (
  <section className="relative z-20 -mt-16 sm:-mt-24 flex justify-center w-full">
    <div className="max-w-3xl w-full px-4">
      <div className="backdrop-blur-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-2xl rounded-2xl flex flex-col gap-6 py-8 px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { solution: "Auto-logged mistakes" },
            { solution: "Instant analytics" },
            { solution: "Personalized quizzes" }
          ].map((block, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center text-center p-6 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-md transition-all duration-300 flex-1 min-h-[100px] hover:scale-105 hover:ring-2 hover:ring-sky-400/80 hover:shadow-[0_0_24px_4px_rgba(56,189,248,0.25)]"
            >
              <span className="text-lg font-bold text-blue-700 dark:text-blue-200 tracking-tight">{block.solution}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// Live Dashboard Demo (Lottie/MP4 placeholder)
const DashboardDemo = () => (
  <section className="w-full flex justify-center items-center py-5 sm:py-5 md:py-5 bg-transparent">
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
      <div className="mb-8 text-center">
        <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent max-w-xl mx-auto text-nowrap mt-8">
          SAT Success Starts Here
        </h2>
        <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-slate-300 max-w-xl mx-auto">Explore the tools and features that help you master the SAT, track your progress, and boost your score.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {[
          { icon: <FileQuestion className="w-10 h-10 text-blue-500 dark:text-blue-400" />, label: "Log Every Mistake" },
          { icon: <BarChart className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />, label: "Track Your Progress" },
          { icon: <BrainCircuit className="w-10 h-10 text-purple-500 dark:text-purple-400" />, label: "AI-Powered Insights" },
          { icon: <ClipboardCopy className="w-10 h-10 text-orange-500 dark:text-orange-400" />, label: "Personalized Quizzes" },
          { icon: <Star className="w-10 h-10 text-yellow-500 dark:text-yellow-400" />, label: "Master Weak Areas" },
          { icon: <CheckCircle className="w-10 h-10 text-green-500 dark:text-green-400" />, label: "Instant Feedback" },
          { icon: <Award className="w-10 h-10 text-pink-500 dark:text-pink-400" />, label: "Score Analytics" },
          { icon: <Edit3 className="w-10 h-10 text-cyan-500 dark:text-cyan-400" />, label: "Smart Review Tools" },
          { icon: <Target className="w-10 h-10 text-indigo-500 dark:text-indigo-400" />, label: "Set & Hit Your Goals" },
        ].map((card, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg transition-all duration-300 group cursor-pointer hover:scale-105 hover:ring-2 hover:ring-sky-400/80 hover:shadow-[0_0_24px_4px_rgba(56,189,248,0.25)]"
          >
            <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
              {card.icon}
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">{card.label}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Pricing Toggle Section
function PricingSection() {
  const [yearly, setYearly] = React.useState(true);
  const plans = [
    {
      name: "Starter",
      price: 0,
      monthly: 0,
      yearly: 0,
      features: ["Unlimited logging", "Basic analytics", "Personal dashboard"],
      cta: "Get Started",
      highlight: false,
    },
    {
      name: "Plus",
      price: yearly ? 8 : 12,
      monthly: 12,
      yearly: 8,
      features: ["All Starter features", "AI insights", "Export data", "Priority support"],
      cta: "Start Plus",
      highlight: true,
    },
    {
      name: "Pro",
      price: yearly ? 16 : 20,
      monthly: 20,
      yearly: 16,
      features: ["All Plus features", "Team analytics", "Advanced exports", "Beta features"],
      cta: "Go Pro",
      highlight: false,
    },
  ];
  return (
    <section className="w-full py-24 sm:py-28 md:py-32 bg-gradient-to-br from-gray-50 to-[#EDF1F7] dark:from-[#0E1426] dark:to-[#111827]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">Simple, transparent pricing</h2>
          <p className="mt-4 text-base md:text-lg text-gray-600 dark:text-slate-300 max-w-xl mx-auto">No hidden fees. Cancel anytime.</p>
          <div className="mt-8 flex items-center gap-2 bg-white/55 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full px-2 py-1 shadow-sm">
            <button
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${!yearly ? 'bg-blue-600 text-white shadow' : 'text-gray-700 dark:text-gray-200'}`}
              onClick={() => setYearly(false)}
            >
              Monthly
            </button>
            <button
              className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${yearly ? 'bg-blue-600 text-white shadow' : 'text-gray-700 dark:text-gray-200'}`}
              onClick={() => setYearly(true)}
            >
              Yearly <span className="ml-1 text-xs text-blue-500">-33%</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`relative flex flex-col items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg shadow-lg p-8 transition-all duration-300 ${plan.highlight ? 'scale-105 ring-2 ring-blue-400/30 dark:ring-blue-500/30 z-10' : ''} hover:scale-105 hover:ring-2 hover:ring-sky-400/80 hover:shadow-[0_0_24px_4px_rgba(56,189,248,0.25)]`}
              style={{ borderRadius: 16 }}
            >
              {plan.price === 0 && (
                <span className="absolute top-4 right-4 text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">Free plan</span>
              )}
              <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{plan.name}</h3>
              <div className="flex items-end mb-4">
                <span className="text-4xl font-extrabold text-blue-700 dark:text-blue-300">{plan.price === 0 ? "$0" : `$${plan.price}`}</span>
                {plan.price !== 0 && <span className="ml-1 text-base text-gray-500 dark:text-gray-400 font-medium">/mo</span>}
              </div>
              <ul className="mb-6 space-y-2 text-sm text-gray-700 dark:text-gray-200">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-center gap-2"><Check className="w-4 h-4 text-blue-500 dark:text-blue-400" /> {f}</li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 ${plan.highlight ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-700 hover:bg-gray-800'} shadow-md`}>{plan.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ Accordion
function FAQSection() {
  const [open, setOpen] = React.useState(-1);
  const faqs = [
    { q: "How does Redomind log my mistakes?", a: "Every time you mark a question wrong, it's automatically added to your error log for review and analytics." },
    { q: "Can I use Redomind for free?", a: "Yes! The Starter plan is free forever and includes unlimited logging and basic analytics." },
    { q: "What is included in Plus and Pro?", a: "Plus unlocks AI insights and export, while Pro adds team analytics and advanced features." },
    { q: "Is my data private and secure?", a: "Absolutely. All your data is encrypted and stored securely in the cloud." },
    { q: "Can I cancel or change my plan anytime?", a: "Yes, you can upgrade, downgrade, or cancel at any time from your account settings." },
    { q: "How do I get support?", a: "You can reach out via our Help Center or email us directly for priority support on paid plans." },
  ];
  return (
    <section className="w-full py-24 sm:py-28 md:py-32 bg-gradient-to-br from-gray-50 to-[#EDF1F7] dark:from-[#0E1426] dark:to-[#111827]">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-10 text-center">Frequently Asked Questions</h2>
        <div className="divide-y divide-gray-200 dark:divide-[#334155] border border-gray-200 dark:border-[#334155] rounded-lg bg-white dark:bg-slate-800 shadow-md hover:scale-105 hover:ring-2 hover:ring-sky-400/80 hover:shadow-[0_0_24px_4px_rgba(56,189,248,0.25)] transition-all duration-300">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none transition-colors duration-300 group"
                onClick={() => setOpen(open === i ? -1 : i)}
                aria-expanded={open === i}
                style={{ minHeight: 56 }}
              >
                <span className="text-base font-semibold text-gray-900 dark:text-white max-w-[90%]">{faq.q}</span>
                <ChevronDown
                  className={`w-6 h-6 text-blue-500 dark:text-blue-400 transform transition-transform duration-300 ease-out ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-out px-6 ${open === i ? 'max-h-40 py-2' : 'max-h-0 py-0'}`}
                style={{ background: 'none' }}
              >
                <p className="text-gray-700 dark:text-gray-200 text-base max-w-2xl mx-auto">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Newsletter CTA
function NewsletterCTA() {
  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);
  return (
    <section className="w-full py-8 bg-gradient-to-br from-white/80 to-blue-50/40 dark:from-[#0E1426]/80 dark:to-[#111827]/40 border-t border-b border-gray-200 dark:border-[#1F2937] flex justify-center items-center">
      <form
        className="w-full max-w-xl mx-auto flex flex-col sm:flex-row items-center gap-4 px-4"
        onSubmit={e => { e.preventDefault(); setSubmitted(true); setTimeout(() => setSubmitted(false), 2000); }}
      >
        <span className="text-lg font-semibold text-gray-900 dark:text-white flex-shrink-0">Get one SAT tip each week.</span>
        <input
          type="email"
          required
          placeholder="Your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 min-w-0 max-w-xs sm:max-w-[320px] px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
        />
        <button
          type="submit"
          className="px-6 py-3 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold transition-all duration-300"
        >
          {submitted ? <Check className="w-5 h-5" /> : "Subscribe"}
        </button>
      </form>
    </section>
  );
}

// Responsive Footer
function Footer() {
  const social = [
    { icon: Twitter, label: "Twitter", href: "#" },
    { icon: Linkedin, label: "LinkedIn", href: "#" },
    { icon: Youtube, label: "YouTube", href: "#" },
  ];
  const columns = [
    {
      heading: "Product",
      links: [
        { label: "Features", href: "#features" },
        { label: "Pricing", href: "#pricing" },
        { label: "Demo", href: "#demo" },
        { label: "Roadmap", href: "#roadmap" },
      ],
    },
    {
      heading: "Company",
      links: [
        { label: "About", href: "#about" },
        { label: "Careers", href: "#careers" },
        { label: "Press", href: "#press" },
        { label: "Contact", href: "#contact" },
      ],
    },
    {
      heading: "Resources",
      links: [
        { label: "Blog", href: "#blog" },
        { label: "Help Center", href: "#help" },
        { label: "Terms", href: "#terms" },
        { label: "Privacy", href: "#privacy" },
      ],
    },
  ];
  const [newsletter, setNewsletter] = React.useState("");
  const [newsletterSubmitted, setNewsletterSubmitted] = React.useState(false);
  return (
    <footer className="w-full bg-[#E9ECEF] dark:bg-[#0A0F1E] border-t border-[#CBD5E1] dark:border-[#1F2937] pt-12 pb-4 transition-colors duration-300">
      <div className="max-w-7xl xl:max-w-[1280px] mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-8">
          {columns.map((col, i) => (
            <div key={col.heading} className="flex flex-col">
              <span className="text-[14px] font-semibold text-gray-900 dark:text-white mb-3">{col.heading}</span>
              {col.links.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-[14px] font-normal mb-2 transition-colors duration-200 text-[rgba(71,85,105,0.7)] hover:text-blue-600 dark:text-[rgba(255,255,255,0.7)] dark:hover:text-sky-400"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
          {/* Newsletter column */}
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-gray-900 dark:text-white mb-3">Newsletter</span>
            <form
              className="flex flex-col gap-2"
              onSubmit={e => { e.preventDefault(); setNewsletterSubmitted(true); setTimeout(() => setNewsletterSubmitted(false), 2000); }}
            >
              <input
                type="email"
                required
                placeholder="Your email"
                value={newsletter}
                onChange={e => setNewsletter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 max-w-xs"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold transition-all duration-300"
              >
                {newsletterSubmitted ? <Check className="w-5 h-5" /> : "Subscribe"}
              </button>
            </form>
          </div>
        </div>
        <div className="border-t border-[#CBD5E1] dark:border-[#1F2937] pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">© 2024 Redomind. All rights reserved.</span>
          <div className="flex gap-3">
            {social.map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-blue-600 dark:hover:bg-blue-600 transition-colors duration-200 group"
                style={{ transition: 'background 0.2s' }}
              >
                <Icon className="w-5 h-5 text-gray-500 dark:text-gray-300 group-hover:text-white transition-colors duration-200" />
              </a>
            ))}
          </div>
          </div>
        </div>
      </footer>
  );
}

// --- END New Sections ---

export default Homepage; 