"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { Bell, User, CreditCard, Shield, Palette, TrendingUp } from "lucide-react"
import { TagInput } from "@/components/tag-input"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    trending: true,
    contentGenerated: true,
    weeklyReport: false,
    marketing: false,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account preferences and application settings</p>
          </div>

          <Tabs defaultValue="monitoring" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Monitoring
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your personal information and profile settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="Sarah" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Johnson" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="sarah@example.com" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself..."
                      defaultValue="Content creator focused on productivity and AI tools. YouTuber with 50K subscribers."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" placeholder="https://yourwebsite.com" />
                  </div>

                  <Button>Save Changes</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Choose what notifications you want to receive</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Trending Topic Alerts</h4>
                        <p className="text-sm text-gray-600">
                          Get notified when new trending topics match your interests
                        </p>
                      </div>
                      <Switch
                        checked={notifications.trending}
                        onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, trending: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Content Generation Complete</h4>
                        <p className="text-sm text-gray-600">
                          Receive notifications when AI content generation is finished
                        </p>
                      </div>
                      <Switch
                        checked={notifications.contentGenerated}
                        onCheckedChange={(checked) =>
                          setNotifications((prev) => ({ ...prev, contentGenerated: checked }))
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Weekly Reports</h4>
                        <p className="text-sm text-gray-600">
                          Get weekly summaries of trending topics and your activity
                        </p>
                      </div>
                      <Switch
                        checked={notifications.weeklyReport}
                        onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, weeklyReport: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Marketing Updates</h4>
                        <p className="text-sm text-gray-600">
                          Receive updates about new features and product announcements
                        </p>
                      </div>
                      <Switch
                        checked={notifications.marketing}
                        onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, marketing: checked }))}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4">Alert Settings</h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Configure when and how you want to be notified about trending topics
                    </p>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="alert-threshold">Growth Threshold</Label>
                          <Select defaultValue="50">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="25">25% growth</SelectItem>
                              <SelectItem value="50">50% growth</SelectItem>
                              <SelectItem value="100">100% growth</SelectItem>
                              <SelectItem value="200">200% growth</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="alert-frequency">Alert Frequency</Label>
                          <Select defaultValue="realtime">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="realtime">Real-time</SelectItem>
                              <SelectItem value="hourly">Hourly</SelectItem>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Alert Types</h4>
                        <div className="space-y-3 border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">Viral Content Alerts</h5>
                              <p className="text-sm text-gray-600">Get notified when content reaches viral status</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">Competitor Monitoring</h5>
                              <p className="text-sm text-gray-600">Track when competitors post trending content</p>
                            </div>
                            <Switch />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">Niche Opportunities</h5>
                              <p className="text-sm text-gray-600">Alert for trending topics in your specific niches</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">Engagement Spikes</h5>
                              <p className="text-sm text-gray-600">Alert when content receives sudden engagement</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-medium">Notification Channels</h4>
                        <div className="space-y-3 border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">In-App Notifications</h5>
                              <p className="text-sm text-gray-600">Receive alerts within the application</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">Email Notifications</h5>
                              <p className="text-sm text-gray-600">Receive alerts via email</p>
                            </div>
                            <Switch defaultChecked />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium">Slack Integration</h5>
                              <p className="text-sm text-gray-600">Send alerts to your Slack workspace</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch />
                              <Button variant="outline" size="sm">
                                Configure
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button>Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Content Preferences</CardTitle>
                  <CardDescription>Customize how content is generated and displayed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contentTone">Default Content Tone</Label>
                      <Select defaultValue="professional">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="humorous">Humorous</SelectItem>
                          <SelectItem value="educational">Educational</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="targetAudience">Primary Audience</Label>
                      <Select defaultValue="creators">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="creators">Content Creators</SelectItem>
                          <SelectItem value="marketers">Digital Marketers</SelectItem>
                          <SelectItem value="entrepreneurs">Entrepreneurs</SelectItem>
                          <SelectItem value="smallbusiness">Small Business Owners</SelectItem>
                          <SelectItem value="ecommerce">E-commerce Brands</SelectItem>
                          <SelectItem value="coaches">Coaches & Consultants</SelectItem>
                          <SelectItem value="influencers">Social Media Influencers</SelectItem>
                          <SelectItem value="agencies">Marketing Agencies</SelectItem>
                          <SelectItem value="saas">SaaS Companies</SelectItem>
                          <SelectItem value="general">General Audience</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brandVoice">Brand Voice Guidelines</Label>
                    <Textarea id="brandVoice" placeholder="Describe your brand voice and style..." rows={4} />
                  </div>

                  <Button>Save Preferences</Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Monitoring</CardTitle>
                    <CardDescription>
                      Configure what topics, keywords, and sources to monitor across platforms
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Tabs defaultValue="reddit" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="reddit">Reddit</TabsTrigger>
                        <TabsTrigger value="twitter">Twitter</TabsTrigger>
                        <TabsTrigger value="tiktok">TikTok</TabsTrigger>
                      </TabsList>

                      <TabsContent value="reddit" className="space-y-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="subreddits">Subreddits to Monitor</Label>
                            <TagInput
                              defaultValue={["artificial", "productivity", "entrepreneur", "socialmedia", "marketing"]}
                              placeholder="Add subreddit..."
                            />
                            <p className="text-sm text-gray-600">Monitor specific subreddits for trending posts</p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="reddit-keywords">Keywords</Label>
                            <TagInput
                              defaultValue={["AI tools", "content creation", "remote work", "productivity hacks"]}
                              placeholder="Add keyword..."
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="reddit-min-upvotes">Minimum Upvotes</Label>
                              <Input id="reddit-min-upvotes" type="number" defaultValue="100" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="reddit-timeframe">Time Frame</Label>
                              <Select defaultValue="24h">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="1h">Last Hour</SelectItem>
                                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                                  <SelectItem value="7d">Last 7 Days</SelectItem>
                                  <SelectItem value="30d">Last 30 Days</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="twitter" className="space-y-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="twitter-hashtags">Hashtags to Monitor</Label>
                            <TagInput
                              defaultValue={[
                                "AIRevolution",
                                "CreatorEconomy",
                                "TechTrends",
                                "ContentCreation",
                                "DigitalMarketing",
                              ]}
                              placeholder="Add hashtag (without #)..."
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="twitter-accounts">Accounts to Monitor</Label>
                            <TagInput
                              defaultValue={["elonmusk", "sundarpichai", "satyanadella"]}
                              placeholder="Add account (without @)..."
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="twitter-min-engagement">Minimum Engagement</Label>
                              <Input id="twitter-min-engagement" type="number" defaultValue="1000" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="twitter-language">Language</Label>
                              <Select defaultValue="en">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="en">English</SelectItem>
                                  <SelectItem value="es">Spanish</SelectItem>
                                  <SelectItem value="fr">French</SelectItem>
                                  <SelectItem value="de">German</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="tiktok" className="space-y-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="tiktok-hashtags">TikTok Hashtags</Label>
                            <TagInput
                              defaultValue={[
                                "productivity",
                                "morningroutine",
                                "contentcreator",
                                "smallbusiness",
                                "entrepreneur",
                              ]}
                              placeholder="Add hashtag (without #)..."
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tiktok-sounds">Trending Sounds</Label>
                            <Switch />
                            <p className="text-sm text-gray-600">Monitor trending audio and music</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="tiktok-min-views">Minimum Views</Label>
                              <Input id="tiktok-min-views" type="number" defaultValue="10000" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="tiktok-region">Region</Label>
                              <Select defaultValue="us">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="us">United States</SelectItem>
                                  <SelectItem value="uk">United Kingdom</SelectItem>
                                  <SelectItem value="ca">Canada</SelectItem>
                                  <SelectItem value="au">Australia</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="billing">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Plan</CardTitle>
                    <CardDescription>Manage your subscription and billing information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Pro Plan</h3>
                        <p className="text-sm text-gray-600">$29/month • Unlimited content generation</p>
                      </div>
                      <Button variant="outline">Change Plan</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                          VISA
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-gray-600">Expires 12/25</p>
                        </div>
                      </div>
                      <Button variant="outline">Update</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>Manage your account security and privacy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Change Password</h4>
                      <div className="space-y-3">
                        <Input type="password" placeholder="Current password" />
                        <Input type="password" placeholder="New password" />
                        <Input type="password" placeholder="Confirm new password" />
                        <Button>Update Password</Button>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Two-Factor Authentication</h4>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline">Enable</Button>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">API Access</h4>
                          <p className="text-sm text-gray-600">Generate API keys for third-party integrations</p>
                        </div>
                        <Button variant="outline">Manage Keys</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
