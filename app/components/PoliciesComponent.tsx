'use client'

import { useState, useEffect } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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

  return (
    <Accordion type="single" collapsible className="w-full">
      {policies.map((policy) => (
        <AccordionItem key={policy.type} value={policy.type}>
          <AccordionTrigger>{policyTitles[policy.type] || policy.type}</AccordionTrigger>
          <AccordionContent>
            <div dangerouslySetInnerHTML={{ __html: policy.content }} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

