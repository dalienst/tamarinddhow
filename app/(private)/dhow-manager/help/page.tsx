"use client";

import HelpCenter from "@/components/help/HelpCenter";
import { managerFaqs, managerGlossary, managerTopics } from "@/components/help/content/manager";

export default function HelpGuidePage() {
  return (
    <HelpCenter
      title="Help Guide"
      subtitle="Simple step-by-step help for everything in the manager portal. Search or choose a topic."
      accent="amber"
      topics={managerTopics}
      faqs={managerFaqs}
      glossary={managerGlossary}
    />
  );
}
