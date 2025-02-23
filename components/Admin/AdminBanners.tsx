"use client"
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Trash2, Eye, AlertCircle, ChevronUp } from "lucide-react";

interface PromoBanner {
  _id: string;
  message: string;
  link: string;
  linkText: string;
  backgroundColor: string;
  textColor: string;
  icon: string;
  isPriority: boolean;
}

export default function AdminBanners() {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newBanner, setNewBanner] = useState<Omit<PromoBanner, "_id">>({
    message: "",
    link: "",
    linkText: "",
    backgroundColor: "#FF9494",
    textColor: "#FFFFFF",
    icon: "",
    isPriority: false,
  });

  const { data: session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchBanners();
    }
  }, [session]);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/banners");
      if (response.ok) {
        const data = await response.json();
        setBanners(data);
      } else {
        throw new Error("Failed to fetch banners");
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to fetch banners. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBanner((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setNewBanner((prev) => ({ ...prev, isPriority: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBanner),
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Promo banner created successfully.",
        });
        fetchBanners();
        setNewBanner({
          message: "",
          link: "",
          linkText: "",
          backgroundColor: "#FF9494",
          textColor: "#FFFFFF",
          icon: "",
          isPriority: false,
        });
      } else {
        throw new Error("Failed to create banner");
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to create banner. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Banner deleted successfully.",
        });
        fetchBanners();
      } else {
        throw new Error("Failed to delete banner");
      }
    } catch (error) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to delete banner. Please try again.",
        variant: "destructive",
      });
    }
  };

  const BannerPreview = ({ banner }: { banner: Omit<PromoBanner, "_id"> }) => (
    <div
      style={{
        backgroundColor: banner.backgroundColor,
        color: banner.textColor,
        padding: "1rem",
        borderRadius: "0.5rem",
        marginTop: "1rem",
      }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        {banner.icon && <span>{banner.icon}</span>}
        <span>{banner.message}</span>
        <a
          href={banner.link}
          className="underline ml-2"
          style={{ color: banner.textColor }}
        >
          {banner.linkText}
        </a>
      </div>
      {banner.isPriority && (
        <Badge variant="outline" className="bg-yellow-500 text-white">
          Priority
        </Badge>
      )}
    </div>
  );

  if (session?.user?.role !== "admin") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You do not have permission to view this page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <Tabs defaultValue="create">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="create">Create Banner</TabsTrigger>
          <TabsTrigger value="manage">Manage Banners ({banners.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Promo Banner</CardTitle>
              <CardDescription>
                Create a new promotional banner to display on your site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Input
                      name="message"
                      value={newBanner.message}
                      onChange={handleInputChange}
                      placeholder="Enter banner message"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Link URL</label>
                      <Input
                        name="link"
                        value={newBanner.link}
                        onChange={handleInputChange}
                        placeholder="https://"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Link Text</label>
                      <Input
                        name="linkText"
                        value={newBanner.linkText}
                        onChange={handleInputChange}
                        placeholder="Click here"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Background</label>
                      <Input
                        name="backgroundColor"
                        type="color"
                        value={newBanner.backgroundColor}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Text Color</label>
                      <Input
                        name="textColor"
                        type="color"
                        value={newBanner.textColor}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Icon</label>
                      <Input
                        name="icon"
                        value={newBanner.icon}
                        onChange={handleInputChange}
                        placeholder="🎉"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPriority"
                      checked={newBanner.isPriority}
                      onCheckedChange={handleSwitchChange}
                    />
                    <label htmlFor="isPriority" className="text-sm font-medium">
                      Priority Banner
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPreviewMode(!previewMode)}
                    className="w-full"
                  >
                    {previewMode ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" /> Hide Preview
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-2" /> Show Preview
                      </>
                    )}
                  </Button>

                  {previewMode && <BannerPreview banner={newBanner} />}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Banner"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card>
            <CardHeader>
              <CardTitle>Active Promo Banners</CardTitle>
              <CardDescription>
                Manage your active promotional banners.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading banners...</div>
              ) : banners.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No active banners
                </div>
              ) : (
                <div className="space-y-4">
                  {banners.map((banner) => (
                    <div
                      key={banner._id}
                      className="border rounded-lg overflow-hidden"
                    >
                      <BannerPreview banner={banner} />
                      <div className="p-4 bg-gray-50 flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            Link: {banner.link}
                          </p>
                          <div className="flex gap-2">
                            {banner.isPriority && (
                              <Badge variant="outline" className="bg-yellow-500 text-white">
                                Priority
                              </Badge>
                            )}
                            {banner.icon && (
                              <Badge variant="outline">
                                Icon: {banner.icon}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(banner._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}