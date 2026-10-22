"use client";

import HelpCenter from "@/components/help/HelpCenter";
import { supervisorFaqs, supervisorGlossary, supervisorTopics } from "@/components/help/content/supervisor";

export default function HelpGuidePage() {
  return (
    <HelpCenter
      title="Help Guide"
      subtitle="Simple step-by-step help for running boarding at the dock. Search or choose a topic."
      accent="emerald"
      topics={supervisorTopics}
      faqs={supervisorFaqs}
      glossary={supervisorGlossary}
    />
  );
}
