'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface Policy {
  type: string;
  content: string;
}

const policyTypes = [
  { value: 'privacy', label: 'Privacy Policy' },
  { value: 'terms', label: 'Terms and Conditions' },
  { value: 'cancellation', label: 'Cancellation and Refund' },
  { value: 'shipping', label: 'Shipping and Delivery' },
  { value: 'contact', label: 'Contact Us' },
];

export default function AdminPolicies() {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await fetch('/api/policies');
      if (response.ok) {
        const data = await response.json();
        setPolicies(data);
      } else {
        throw new Error('Failed to fetch policies');
      }
    } catch (error) {
      console.error('Error fetching policies:', error);
      toast({
        title: "Error",
        description: "Failed to fetch policies. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePolicyChange = (value: string) => {
    setSelectedPolicy(value);
    const policy = policies.find(p => p.type === value);
    setContent(policy ? policy.content : '');
  };

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handleSubmit = async () => {
    if (!selectedPolicy) {
      toast({
        title: "Error",
        description: "Please select a policy to update.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedPolicy, content }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Policy updated successfully.",
        });
        fetchPolicies();
      } else {
        throw new Error('Failed to update policy');
      }
    } catch (error) {
      console.error('Error updating policy:', error);
      toast({
        title: "Error",
        description: "Failed to update policy. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (session?.user?.role !== 'admin') {
    return <p>You do not have permission to view this page.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Policies</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select onValueChange={handlePolicyChange} value={selectedPolicy}>
          <SelectTrigger>
            <SelectValue placeholder="Select a policy to edit" />
          </SelectTrigger>
          <SelectContent>
            {policyTypes.map((policy) => (
              <SelectItem key={policy.value} value={policy.value}>
                {policy.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ReactQuill theme="snow" value={content} onChange={handleContentChange} />
        <Button onClick={handleSubmit}>Save Policy</Button>
      </CardContent>
    </Card>
  );
}

