"use client";

import Image from "next/image";
import Link from "next/link";
import HelpCenter from "@/components/help/HelpCenter";
import { publicFaqs, publicGlossary, publicTopics } from "@/components/help/content/public";

export default function PublicCheckInHelpPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-gray-100 print:hidden">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/smallLogo.jpg" alt="Tamarind Dhow" width={40} height={40} className="rounded-lg shadow-sm" />
          <span className="text-lg font-bold text-primary tracking-tight">Tamarind Dhow</span>
        </Link>
      </nav>
      <HelpCenter
        title="Check-in Help"
        subtitle="How dock crew use the passenger list link, and how guests board with their boarding pass."
        accent="amber"
        topics={publicTopics}
        faqs={publicFaqs}
        glossary={publicGlossary}
      />
    </div>
  );
}
