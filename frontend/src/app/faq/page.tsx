'use client';

import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Search, HelpCircle, MessageCircle } from 'lucide-react';
import { faqService } from '@/services/api.service';
import { FAQ, FAQCategory } from '@/types';
import Link from 'next/link';

const categories = Object.values(FAQCategory);

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const data = await faqService.getAll();
        setFaqs(data);
        setFilteredFaqs(data);
      } catch (error) {
        console.error('Failed to fetch FAQs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaqs();
  }, []);

  useEffect(() => {
    let filtered = faqs;

    if (selectedCategory) {
      filtered = filtered.filter((faq) => faq.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );
    }

    setFilteredFaqs(filtered);
  }, [faqs, selectedCategory, searchQuery]);

  const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
          <HelpCircle className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions about our platform, courses, and more.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search FAQs..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <Badge
            variant={selectedCategory === null ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            All
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>
      </div>

      {/* FAQ List */}
      <div className="max-w-3xl mx-auto">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredFaqs.length > 0 ? (
          Object.entries(groupedFaqs).map(([category, categoryFaqs]) => (
            <div key={category} className="mb-8">
              <h2 className="text-lg font-semibold mb-4">{category}</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {categoryFaqs.map((faq) => (
                  <AccordionItem key={faq.id} value={`faq-${faq.id}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left hover:no-underline">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No FAQs found matching your criteria.</p>
            <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Still Need Help */}
      <div className="max-w-3xl mx-auto mt-12 text-center p-8 bg-muted/50 rounded-lg">
        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold mb-2">Still Need Help?</h3>
        <p className="text-muted-foreground mb-4">
          Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
        </p>
        <Button asChild>
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
