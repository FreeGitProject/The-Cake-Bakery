'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
//import { useToast } from "@/components/ui/use-toast"
import { useToast } from "@/hooks/use-toast"
interface AdminSettingsData {
  catalogPageSize: number;
  cachingEnabled: boolean;
  cachingStrategy: 'isr' | 'redis';
  recentViewsCount: number;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettingsData>({
    catalogPageSize: 20,
    cachingEnabled: false,
    cachingStrategy: 'isr',
    recentViewsCount: 5,
  });
  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        throw new Error('Failed to fetch settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setSettings(prev => ({ ...prev, cachingEnabled: checked }));
  };

  const handleSelectChange = (value: string) => {
    setSettings(prev => ({ ...prev, cachingStrategy: value as 'isr' | 'redis' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Settings updated successfully.",
        });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (session?.user?.role !== 'admin') {
    return <p>You do not have permission to view this page.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Catalog Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="catalogPageSize">Default page size for product listings</Label>
            <Input
              id="catalogPageSize"
              name="catalogPageSize"
              type="number"
              value={settings.catalogPageSize}
              onChange={handleInputChange}
              min={1}
              max={100}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Caching Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="cachingEnabled"
              checked={settings.cachingEnabled}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="cachingEnabled">Enable caching</Label>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cachingStrategy">Caching strategy</Label>
            <Select
              value={settings.cachingStrategy}
              onValueChange={handleSelectChange}
              disabled={!settings.cachingEnabled}
            >
              <SelectTrigger id="cachingStrategy">
                <SelectValue placeholder="Select caching strategy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="isr">Next.js ISR</SelectItem>
                <SelectItem value="redis">Redis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Views Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="recentViewsCount">Maximum number of recent views</Label>
            <Input
              id="recentViewsCount"
              name="recentViewsCount"
              type="number"
              value={settings.recentViewsCount}
              onChange={handleInputChange}
              min={1}
              max={50}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit">Save Settings</Button>
    </form>
  );
}

