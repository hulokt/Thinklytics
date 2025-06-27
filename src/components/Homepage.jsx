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
import { ContainerTextFlip } from "./ui/container-text-flip";
import { BentoGrid, BentoGridItem } from "./ui/BentoGrid";
import { InfiniteMovingCards } from "./ui/InfiniteMovingCards";
import Footer from "./Footer";
import MembershipSection from "./MembershipSection";
import QASection from "./QASection";
import CallToAction from "./CallToAction";
import Navbar from "./Navbar";

const Homepage = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-slate-900 dark:via-blue-900 dark:to-slate-900 text-gray-900 dark:text-gray-50 transition-colors duration-300">
      {/* Navigation */}
      <Navbar onGetStarted={onGetStarted} onLogin={onLogin} />

      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center justify-center overflow-hidden py-24 sm:py-32 md:py-40">
        <div className="absolute inset-0 h-full w-full [background-image:linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute pointer-events-none inset-0 flex items-center justify-center [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
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
              className="relative inline-flex h-12 overflow-hidden rounded-lg p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 select-none touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <div className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)] pointer-events-none" />
              </div>
              <div className="relative z-10 inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-slate-950 px-8 py-1 text-sm font-medium text-white backdrop-blur-3xl select-none touch-manipulation">
                Get Started Free
              </div>
            </button>
            <button
              onClick={onLogin}
              className="relative inline-flex h-12 overflow-hidden rounded-lg p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 select-none touch-manipulation"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-lg bg-gray-100/80 dark:bg-slate-700/80 px-8 py-1 text-sm font-medium text-slate-800 dark:text-white backdrop-blur-3xl border border-gray-300 dark:border-slate-600 select-none touch-manipulation">
                Login
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Problem → Solution Strip */}
      <ProblemSolutionStrip />

      {/* Live Dashboard Demo (Lottie/MP4 placeholder) */}
      <DashboardDemo />

      {/* Infinite Scroll Logos */}
      <section className="py-20 md:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-center text-sm font-semibold text-gray-500 dark:text-slate-400 mb-6 tracking-wide">
            AS SEEN IN TOP EDUCATIONAL RESOURCES
          </h3>
          <InfiniteMovingCards items={logos} direction="right" speed="slow" />
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-20 relative overflow-hidden">
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
      <section className="py-20 relative overflow-hidden">
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



      {/* Membership Section */}
      <MembershipSection />

      {/* FAQ Accordion */}
      <QASection />

      {/* Call to Action */}
      <CallToAction />

      {/* Footer */}
      <Footer />
    </div>
  );
};

// --- Bento Grid Components ---

const MockQuizChart = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-50 dark:from-white/5 to-blue-100 dark:to-white/10 p-4 relative overflow-hidden">
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
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-indigo-50 dark:from-white/5 to-indigo-100 dark:to-white/10 p-2 space-y-1">
    <div className="bg-white/50 dark:bg-white/10 rounded-md p-1.5 text-xs text-indigo-900 dark:text-indigo-200">
      Standard Model
    </div>
    <div className="bg-white/50 dark:bg-white/10 rounded-md p-1.5 text-xs text-indigo-900 dark:text-indigo-200">
      Heart of Algebra
    </div>
    <div className="bg-white/50 dark:bg-white/10 rounded-md p-1.5 text-xs text-indigo-900 dark:text-indigo-200">
      Words in Context
    </div>
  </div>
);

const MockPersonalizedQuiz = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-amber-50 dark:from-white/5 to-amber-100 dark:to-white/10 p-3 flex flex-col justify-center items-center text-center">
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
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-emerald-50 dark:from-white/5 to-emerald-100 dark:to-white/10 p-2 flex-col space-y-1">
    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-1 px-1">
      AI Suggestion:
    </p>
    <div className="bg-white/50 dark:bg-white/10 rounded-md p-1.5 text-xs text-emerald-900 dark:text-emerald-200">
      Focus on 'Heart of Algebra'
    </div>
    <div className="bg-white/50 dark:bg-white/10 rounded-md p-1.5 text-xs text-emerald-900 dark:text-emerald-200">
      Review comma usage rules
    </div>
  </div>
);

const MockFilterPills = () => (
  <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-pink-50 dark:from-white/5 to-pink-100 dark:to-white/10 p-3 flex flex-wrap gap-2 content-start">
    <span className="bg-pink-200/50 dark:bg-pink-500/20 text-pink-900 dark:text-pink-200 rounded-full px-2.5 py-1 text-xs font-medium">
      Reading
    </span>
    <span className="bg-pink-200/50 dark:bg-pink-500/20 text-pink-900 dark:text-pink-200 rounded-full px-2.5 py-1 text-xs font-medium">
      Math
    </span>
    <span className="bg-pink-200/50 dark:bg-pink-500/20 text-pink-900 dark:text-pink-200 rounded-full px-2.5 py-1 text-xs font-medium">
      Hard
    </span>
    <span className="bg-white/50 dark:bg-white/10 rounded-full px-2.5 py-1 text-xs text-gray-700 dark:text-gray-300">
      Medium
    </span>
    <span className="bg-white/50 dark:bg-white/10 rounded-full px-2.5 py-1 text-xs text-gray-700 dark:text-gray-300">
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
      <div className="backdrop-blur-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 shadow-2xl rounded-2xl flex flex-col gap-6 py-8 px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { solution: "Auto-logged mistakes" },
            { solution: "Instant analytics" },
            { solution: "Personalized quizzes" }
          ].map((block, i) => (
            <div
              key={i}
              className="flex flex-col items-center justify-center text-center p-6 rounded-xl bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-md transition-all duration-300 flex-1 min-h-[100px] hover:scale-105 hover:ring-2 hover:ring-sky-400/80 hover:shadow-[0_0_24px_4px_rgba(56,189,248,0.25)]"
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
            className="flex flex-col items-center justify-center text-center p-8 rounded-2xl bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 shadow-lg transition-all duration-300 group cursor-pointer hover:scale-105 hover:ring-2 hover:ring-sky-400/80 hover:shadow-[0_0_24px_4px_rgba(56,189,248,0.25)]"
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

export default Homepage; 