"use client"

import { useState, useEffect } from "react"
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
import { MonitoringSettings, getMonitoringSettings, saveMonitoringSettings, DEFAULT_MONITORING_SETTINGS, migrateAndValidateSettings } from "@/lib/settings-utils"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  
  const [notifications, setNotifications] = useState({
    trending: true,
    contentGenerated: true,
    weeklyReport: false,
    marketing: false,
  })

  const [monitoringSettings, setMonitoringSettings] = useState<MonitoringSettings>(DEFAULT_MONITORING_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)

  // Load and migrate settings on component mount
  useEffect(() => {
    const migratedSettings = migrateAndValidateSettings()
    setMonitoringSettings(migratedSettings)
  }, [])

  // Save monitoring settings
  const handleSaveMonitoring = async () => {
    setIsSaving(true)
    try {
      saveMonitoringSettings(monitoringSettings)
      toast({
        title: "Settings saved! ✅",
        description: "Your monitoring settings have been successfully updated.",
        duration: 3000,
      })
      console.log('Monitoring settings saved successfully')
    } catch (error) {
      console.error('Failed to save monitoring settings:', error)
      toast({
        title: "Error saving settings ❌",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive",
        duration: 4000,
      })
    } finally {
      setIsSaving(false)
    }
  }

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
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="reddit">Reddit</TabsTrigger>
                        <TabsTrigger value="twitter">Twitter</TabsTrigger>
                        <TabsTrigger value="tiktok">TikTok</TabsTrigger>
                        <TabsTrigger value="instagram">Instagram</TabsTrigger>
                      </TabsList>

                      <TabsContent value="reddit" className="space-y-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="subreddits">Subreddits to Monitor (Max 3)</Label>
                            <TagInput
                              value={monitoringSettings.reddit.subreddits}
                              onChange={(values) => setMonitoringSettings(prev => ({
                                ...prev,
                                reddit: { ...prev.reddit, subreddits: values.slice(0, 3) }
                              }))}
                              placeholder="Add subreddit"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="reddit-keywords">Keywords (Max 3)</Label>
                            <TagInput
                              value={monitoringSettings.reddit.keywords}
                              onChange={(values) => setMonitoringSettings(prev => ({
                                ...prev,
                                reddit: { ...prev.reddit, keywords: values.slice(0, 3) }
                              }))}
                              placeholder="Add keyword"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="reddit-min-upvotes">Minimum Upvotes</Label>
                              <Input 
                                id="reddit-min-upvotes" 
                                type="number" 
                                value={monitoringSettings.reddit.minUpvotes}
                                onChange={(e) => setMonitoringSettings(prev => ({
                                  ...prev,
                                  reddit: { ...prev.reddit, minUpvotes: parseInt(e.target.value) || 0 }
                                }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="reddit-timeframe">Time Frame</Label>
                              <Select 
                                value={monitoringSettings.reddit.timeframe}
                                onValueChange={(value: '1h' | '24h' | '7d' | '30d') => setMonitoringSettings(prev => ({
                                  ...prev,
                                  reddit: { ...prev.reddit, timeframe: value }
                                }))}
                              >
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
                            <Label htmlFor="twitter-search-terms">Search Terms to Monitor (Max 3)</Label>
                            <TagInput
                              value={monitoringSettings.twitter.searchTerms}
                              onChange={(values) => setMonitoringSettings(prev => ({
                                ...prev,
                                twitter: { ...prev.twitter, searchTerms: values.slice(0, 3) }
                              }))}
                              placeholder="Add search term"
                                              />
                </div>

                          <div className="space-y-2">
                            <Label htmlFor="twitter-accounts">Accounts to Monitor (Max 3)</Label>
                            <TagInput
                              value={monitoringSettings.twitter.accounts}
                              onChange={(values) => setMonitoringSettings(prev => ({
                                ...prev,
                                twitter: { ...prev.twitter, accounts: values.slice(0, 3) }
                              }))}
                              placeholder="Add account (without @)"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="twitter-min-engagement">Minimum Engagement</Label>
                              <Input 
                                id="twitter-min-engagement" 
                                type="number" 
                                value={monitoringSettings.twitter.minEngagement}
                                onChange={(e) => setMonitoringSettings(prev => ({
                                  ...prev,
                                  twitter: { ...prev.twitter, minEngagement: parseInt(e.target.value) || 0 }
                                }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="twitter-language">Language</Label>
                              <Select 
                                value={monitoringSettings.twitter.language}
                                onValueChange={(value) => setMonitoringSettings(prev => ({
                                  ...prev,
                                  twitter: { ...prev.twitter, language: value }
                                }))}
                              >
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
                            <Label htmlFor="tiktok-hashtags">TikTok Hashtags (Max 3)</Label>
                            <TagInput
                              value={monitoringSettings.tiktok.hashtags}
                              onChange={(values) => setMonitoringSettings(prev => ({
                                ...prev,
                                tiktok: { ...prev.tiktok, hashtags: values.slice(0, 3) }
                              }))}
                              placeholder="Add hashtag (without #)"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="tiktok-sounds">Trending Sounds</Label>
                            <Switch 
                              checked={monitoringSettings.tiktok.trending_sounds}
                              onCheckedChange={(checked) => setMonitoringSettings(prev => ({
                                ...prev,
                                tiktok: { ...prev.tiktok, trending_sounds: checked }
                              }))}
                            />
                            <p className="text-sm text-gray-600">Monitor trending audio and music</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="tiktok-min-views">Minimum Views</Label>
                              <Input 
                                id="tiktok-min-views" 
                                type="number" 
                                value={monitoringSettings.tiktok.minViews}
                                onChange={(e) => setMonitoringSettings(prev => ({
                                  ...prev,
                                  tiktok: { ...prev.tiktok, minViews: parseInt(e.target.value) || 0 }
                                }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="tiktok-region">Region</Label>
                              <Select 
                                value={monitoringSettings.tiktok.region}
                                onValueChange={(value) => setMonitoringSettings(prev => ({
                                  ...prev,
                                  tiktok: { ...prev.tiktok, region: value }
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {/* North America */}
                                  <SelectItem value="us">🇺🇸 United States</SelectItem>
                                  <SelectItem value="ca">🇨🇦 Canada</SelectItem>
                                  <SelectItem value="mx">🇲🇽 Mexico</SelectItem>
                                  
                                  {/* Europe */}
                                  <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
                                  <SelectItem value="de">🇩🇪 Germany</SelectItem>
                                  <SelectItem value="fr">🇫🇷 France</SelectItem>
                                  <SelectItem value="it">🇮🇹 Italy</SelectItem>
                                  <SelectItem value="es">🇪🇸 Spain</SelectItem>
                                  <SelectItem value="nl">🇳🇱 Netherlands</SelectItem>
                                  <SelectItem value="se">🇸🇪 Sweden</SelectItem>
                                  <SelectItem value="no">🇳🇴 Norway</SelectItem>
                                  <SelectItem value="dk">🇩🇰 Denmark</SelectItem>
                                  <SelectItem value="fi">🇫🇮 Finland</SelectItem>
                                  <SelectItem value="pl">🇵🇱 Poland</SelectItem>
                                  <SelectItem value="ru">🇷🇺 Russia</SelectItem>
                                  
                                  {/* Asia Pacific */}
                                  <SelectItem value="jp">🇯🇵 Japan</SelectItem>
                                  <SelectItem value="kr">🇰🇷 South Korea</SelectItem>
                                  <SelectItem value="cn">🇨🇳 China</SelectItem>
                                  <SelectItem value="in">🇮🇳 India</SelectItem>
                                  <SelectItem value="id">🇮🇩 Indonesia</SelectItem>
                                  <SelectItem value="th">🇹🇭 Thailand</SelectItem>
                                  <SelectItem value="vn">🇻🇳 Vietnam</SelectItem>
                                  <SelectItem value="ph">🇵🇭 Philippines</SelectItem>
                                  <SelectItem value="my">🇲🇾 Malaysia</SelectItem>
                                  <SelectItem value="sg">🇸🇬 Singapore</SelectItem>
                                  <SelectItem value="au">🇦🇺 Australia</SelectItem>
                                  <SelectItem value="nz">🇳🇿 New Zealand</SelectItem>
                                  
                                  {/* Middle East & Africa */}
                                  <SelectItem value="ae">🇦🇪 UAE</SelectItem>
                                  <SelectItem value="sa">🇸🇦 Saudi Arabia</SelectItem>
                                  <SelectItem value="eg">🇪🇬 Egypt</SelectItem>
                                  <SelectItem value="za">🇿🇦 South Africa</SelectItem>
                                  <SelectItem value="ng">🇳🇬 Nigeria</SelectItem>
                                  <SelectItem value="ke">🇰🇪 Kenya</SelectItem>
                                  
                                  {/* Latin America */}
                                  <SelectItem value="br">🇧🇷 Brazil</SelectItem>
                                  <SelectItem value="ar">🇦🇷 Argentina</SelectItem>
                                  <SelectItem value="cl">🇨🇱 Chile</SelectItem>
                                  <SelectItem value="co">🇨🇴 Colombia</SelectItem>
                                  <SelectItem value="pe">🇵🇪 Peru</SelectItem>
                                  
                                  {/* Global/Worldwide */}
                                  <SelectItem value="global">🌍 Global/Worldwide</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="instagram" className="space-y-4">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="instagram-hashtags">Instagram Hashtags (Max 3)</Label>
                            <TagInput
                              value={monitoringSettings.instagram.hashtags}
                              onChange={(values) => setMonitoringSettings(prev => ({
                                ...prev,
                                instagram: { ...prev.instagram, hashtags: values.slice(0, 3) }
                              }))}
                              placeholder="Add hashtag (without #)"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="instagram-accounts">Accounts to Monitor (Max 3)</Label>
                            <TagInput
                              value={monitoringSettings.instagram.accounts}
                              onChange={(values) => setMonitoringSettings(prev => ({
                                ...prev,
                                instagram: { ...prev.instagram, accounts: values.slice(0, 3) }
                              }))}
                              placeholder="Add account (without @)"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="instagram-min-likes">Minimum Likes</Label>
                              <Input 
                                id="instagram-min-likes" 
                                type="number" 
                                value={monitoringSettings.instagram.minLikes}
                                onChange={(e) => setMonitoringSettings(prev => ({
                                  ...prev,
                                  instagram: { ...prev.instagram, minLikes: parseInt(e.target.value) || 0 }
                                }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="instagram-content-types">Content Types</Label>
                              <Select 
                                value={monitoringSettings.instagram.contentTypes.join(',')}
                                onValueChange={(value) => {
                                  const types = value.split(',').filter(Boolean) as ('photo' | 'video' | 'carousel')[]
                                  setMonitoringSettings(prev => ({
                                    ...prev,
                                    instagram: { ...prev.instagram, contentTypes: types }
                                  }))
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="photo,video,carousel">All Types</SelectItem>
                                  <SelectItem value="photo">Photos Only</SelectItem>
                                  <SelectItem value="video">Videos Only</SelectItem>
                                  <SelectItem value="carousel">Carousels Only</SelectItem>
                                  <SelectItem value="photo,video">Photos & Videos</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                    
                    <div className="mt-6 pt-6 border-t">
                      <Button 
                        onClick={handleSaveMonitoring}
                        disabled={isSaving}
                        className="w-full"
                      >
                        {isSaving ? 'Saving...' : 'Save Monitoring Settings'}
                      </Button>
                    </div>
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
