'use client'

import { useState, useEffect } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Shield, FileText, RotateCcw, Truck, MessageCircle, ScrollText } from 'lucide-react'

interface Policy {
  type: string;
  content: string;
}

export default function PoliciesComponent() {
  const [policies, setPolicies] = useState<Policy[]>([]);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await fetch('/api/policies');
        if (response.ok) {
          const data = await response.json();
          setPolicies(data);
        } else {
          console.error('Failed to fetch policies');
        }
      } catch (error) {
        console.error('Error fetching policies:', error);
      }
    };

    fetchPolicies();
  }, []);

  const policyTitles: { [key: string]: string } = {
    privacy: 'Privacy Policy',
    terms: 'Terms and Conditions',
    cancellation: 'Cancellation and Refund',
    shipping: 'Shipping and Delivery',
    contact: 'Contact Us',
  };

  const policyIcons: { [key: string]: React.ReactNode } = {
    privacy: <Shield className="w-5 h-5" />,
    terms: <FileText className="w-5 h-5" />,
    cancellation: <RotateCcw className="w-5 h-5" />,
    shipping: <Truck className="w-5 h-5" />,
    contact: <MessageCircle className="w-5 h-5" />,
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-pink to-brand-pink-light shadow-soft mb-5">
          <ScrollText className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-brand-text">
          Policies
        </h1>
        <p className="text-brand-text-secondary mt-2 max-w-md mx-auto">
          Everything you need to know about our terms, privacy, and more.
        </p>
        <div className="h-1 w-16 bg-gradient-to-r from-brand-pink to-brand-pink-light rounded-full mt-5 mx-auto" />
      </div>

      {/* Policies Accordion */}
      <div className="bg-white rounded-2xl shadow-card border border-gray-100/80 overflow-hidden">
        <Accordion type="single" collapsible className="w-full">
          {policies.map((policy, index) => (
            <AccordionItem
              key={policy.type}
              value={policy.type}
              className={`border-b border-gray-100 last:border-b-0 transition-all duration-300 ${
                index === 0 ? '' : ''
              }`}
            >
              <AccordionTrigger className="px-6 py-5 hover:no-underline hover:bg-brand-cream/30 transition-all duration-300 group">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-brand-cream flex items-center justify-center text-brand-pink group-hover:bg-gradient-to-br group-hover:from-brand-pink group-hover:to-brand-pink-light group-hover:text-white transition-all duration-300 flex-shrink-0">
                    {policyIcons[policy.type] || <FileText className="w-5 h-5" />}
                  </div>
                  <span className="font-display font-semibold text-brand-text text-left text-base sm:text-lg">
                    {policyTitles[policy.type] || policy.type}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="ml-[52px] pt-1">
                  <div
                    className="prose prose-sm max-w-none text-brand-text-secondary leading-relaxed
                      prose-headings:text-brand-text prose-headings:font-display
                      prose-a:text-brand-pink prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-brand-text prose-strong:font-semibold
                      prose-ul:list-disc prose-ol:list-decimal"
                    dangerouslySetInnerHTML={{ __html: policy.content }}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
