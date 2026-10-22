"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Printer,
  Search,
  Tags,
  X,
  type LucideIcon,
} from "lucide-react";

export interface HelpTopic {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  /** One plain sentence: when would someone need this? */
  when: string;
  /** Numbered steps. Wrap button or menu names in **double stars** to bold them. */
  steps: string[];
  tip?: string;
  link?: { href: string; label: string };
}

export interface HelpFaq {
  question: string;
  answer: string;
}

export interface HelpTerm {
  term: string;
  meaning: string;
}

interface HelpCenterProps {
  title: string;
  subtitle: string;
  accent?: "amber" | "emerald";
  topics: HelpTopic[];
  faqs?: HelpFaq[];
  glossary?: HelpTerm[];
}

// Tailwind needs full class names, so each accent is spelled out here.
const ACCENTS = {
  amber: {
    soft: "bg-amber-50 text-amber-700",
    solid: "bg-amber-600 hover:bg-amber-700 text-white",
    number: "bg-amber-600 text-white",
    ring: "focus:ring-amber-500/20 focus:border-amber-500",
    text: "text-amber-600",
    tip: "bg-amber-50/60 border-amber-200/60 text-amber-900",
    faq: "text-amber-400",
  },
  emerald: {
    soft: "bg-emerald-50 text-emerald-700",
    solid: "bg-emerald-600 hover:bg-emerald-700 text-white",
    number: "bg-emerald-600 text-white",
    ring: "focus:ring-emerald-500/20 focus:border-emerald-500",
    text: "text-emerald-600",
    tip: "bg-emerald-50/60 border-emerald-200/60 text-emerald-900",
    faq: "text-emerald-400",
  },
};

/** Renders **bold** segments without injecting HTML. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, idx) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={idx} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <React.Fragment key={idx}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

const matches = (query: string, ...fields: (string | undefined)[]) =>
  fields.some((f) => f?.toLowerCase().includes(query));

export default function HelpCenter({
  title,
  subtitle,
  accent = "amber",
  topics,
  faqs = [],
  glossary = [],
}: HelpCenterProps) {
  const colors = ACCENTS[accent];
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState(topics[0]?.id);
  const detailRef = useRef<HTMLDivElement>(null);

  const openTopic = (id: string) => {
    setActiveId(id);
    // On phones the steps sit below the topic list, so bring them into view.
    if (window.innerWidth < 1024) {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const q = query.toLowerCase().trim();

  const visibleTopics = useMemo(
    () =>
      q
        ? topics.filter((t) => matches(q, t.title, t.subtitle, t.when, t.tip, ...t.steps))
        : topics,
    [q, topics]
  );
  const visibleFaqs = useMemo(
    () => (q ? faqs.filter((f) => matches(q, f.question, f.answer)) : faqs),
    [q, faqs]
  );
  const visibleTerms = useMemo(
    () => (q ? glossary.filter((g) => matches(q, g.term, g.meaning)) : glossary),
    [q, glossary]
  );

  const active = visibleTopics.find((t) => t.id === activeId) || visibleTopics[0];
  const nothingFound = q && !visibleTopics.length && !visibleFaqs.length && !visibleTerms.length;

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl shadow-inner ${colors.soft}`}>
            <HelpCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all print:hidden"
        >
          <Printer className="w-4 h-4" /> Print this guide
        </button>
      </div>

      {/* Search */}
      <div className="relative print:hidden">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you need help with? e.g. check in, walk-in, refund, cancel"
          className={`w-full pl-12 pr-12 py-4 bg-white border border-slate-200 rounded-2xl text-sm shadow-sm focus:outline-none focus:ring-2 ${colors.ring}`}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {nothingFound && (
        <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center text-sm text-slate-500">
          Nothing matched &ldquo;{query}&rdquo;. Try a simpler word, such as <strong>guest</strong>,{" "}
          <strong>table</strong> or <strong>payment</strong>.
        </div>
      )}

      {active && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
          {/* Topic list */}
          <div className="space-y-2 lg:col-span-1 print:hidden">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              {q ? `Matching topics (${visibleTopics.length})` : "Choose a topic"}
            </h3>
            {visibleTopics.map((topic) => {
              const Icon = topic.icon;
              const isActive = topic.id === active.id;
              return (
                <button
                  key={topic.id}
                  onClick={() => openTopic(topic.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                    isActive
                      ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10"
                      : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className={`p-2 rounded-xl ${isActive ? colors.number : "bg-slate-100 text-slate-500"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">{topic.title}</span>
                    <span className={`text-[11px] block ${isActive ? "text-slate-300" : "text-slate-400"}`}>
                      {topic.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Topic detail */}
          <div ref={detailRef} className="lg:col-span-2 scroll-mt-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${colors.soft}`}>
                    <active.icon className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900">{active.title}</h2>
                </div>
                {active.link && (
                  <Link
                    href={active.link.href}
                    className={`flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all shadow-md print:hidden ${colors.solid}`}
                  >
                    {active.link.label} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800">When to use this: </span>
                {active.when}
              </p>

              <ol className="space-y-3">
                {active.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span
                      className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${colors.number}`}
                      style={{ borderRadius: "50%" }}
                    >
                      {idx + 1}
                    </span>
                    <span className="text-sm text-slate-700 leading-relaxed">
                      <RichText text={step} />
                    </span>
                  </li>
                ))}
              </ol>

              {active.tip && (
                <div className={`p-4 border rounded-2xl flex gap-3 ${colors.tip}`}>
                  <Lightbulb className={`w-5 h-5 flex-shrink-0 mt-0.5 ${colors.text}`} />
                  <div className="text-sm space-y-1">
                    <span className="font-bold block uppercase tracking-wider text-[10px]">Good to know</span>
                    <p className="leading-relaxed">
                      <RichText text={active.tip} />
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Printed copy: every topic, one after another */}
      <div className="hidden print:block space-y-6">
        {topics.map((topic) => (
          <section key={topic.id} className="break-inside-avoid space-y-2">
            <h2 className="text-lg font-extrabold text-slate-900">{topic.title}</h2>
            <p className="text-sm text-slate-600">
              <span className="font-bold">When to use this: </span>
              {topic.when}
            </p>
            <ol className="list-decimal pl-6 space-y-1 text-sm text-slate-700">
              {topic.steps.map((step, idx) => (
                <li key={idx}>
                  <RichText text={step} />
                </li>
              ))}
            </ol>
            {topic.tip && (
              <p className="text-sm text-slate-700">
                <span className="font-bold">Good to know: </span>
                <RichText text={topic.tip} />
              </p>
            )}
          </section>
        ))}
      </div>

      {/* Glossary */}
      {visibleTerms.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
            <Tags className={`w-5 h-5 ${colors.text}`} /> What the words and labels mean
          </h3>
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {visibleTerms.map((item) => (
              <div key={item.term} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <dt className="text-sm font-bold text-slate-900">{item.term}</dt>
                <dd className="text-sm text-slate-600 mt-1 leading-relaxed">{item.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* FAQ */}
      {visibleFaqs.length > 0 && (
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-xl">
          <h3 className="font-extrabold text-lg flex items-center gap-2">
            <BookOpen className={`w-5 h-5 ${colors.faq}`} /> Common questions
          </h3>
          <div className="space-y-4 divide-y divide-slate-800">
            {visibleFaqs.map((faq) => (
              <div key={faq.question} className="pt-4 first:pt-0 space-y-1.5">
                <span className={`text-sm font-bold ${colors.faq}`}>{faq.question}</span>
                <p className="text-sm text-slate-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
