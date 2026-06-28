import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, HelpCircle } from "lucide-react";

import { Input } from "../../components/ui/input";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "../../components/ui/accordion";
import faqData from "../../data/faq.json";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function filterFAQ(categories, searchTerm) {
  if (!searchTerm.trim()) return categories;

  const lower = searchTerm.toLowerCase();

  return categories
    .map((category) => ({
      ...category,
      items: category.items.filter(
        (item) =>
          item.question.toLowerCase().includes(lower) ||
          item.answer.toLowerCase().includes(lower)
      ),
    }))
    .filter((category) => category.items.length > 0);
}

// ---------------------------------------------------------------------------
// HelpCentrePage
// ---------------------------------------------------------------------------

export default function HelpCentrePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = filterFAQ(faqData, searchTerm);

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <HelpCircle className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Help Centre</h1>
      </div>

      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search FAQ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* FAQ content */}
      {filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <HelpCircle className="h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No matching questions found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredCategories.map((category) => (
            <div key={category.category}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {category.category}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {category.items.map((item, index) => (
                  <AccordionItem
                    key={`${category.category}-${index}`}
                    value={`${category.category}-${index}`}
                  >
                    <AccordionTrigger className="text-left">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-muted-foreground leading-relaxed">
                        {item.answer}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      )}

      {/* Report a Problem link */}
      <div className="mt-8 pt-6 border-t text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Can't find what you're looking for?
        </p>
        <button
          onClick={() => navigate("/help?tab=report")}
          className="text-sm font-medium text-primary hover:underline"
        >
          Report a Problem
        </button>
      </div>
    </div>
  );
}
