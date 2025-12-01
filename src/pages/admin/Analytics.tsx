import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabase";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { RefreshCw, TrendingUp, Users, Activity, AlertCircle, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Smile, TrendingDown, Calendar, Filter } from "lucide-react";
import { useState, useMemo } from "react";

interface MoodEntry {
  id: string;
  user_id: string;
  mood: string;
  user_input: string;
  confidence: number | null;
  timestamp: string;
  date: string | null;
  day_of_week: string | null;
  hour: number | null;
  created_at: string;
  updated_at: string;
}

interface User {
  id: string;
  spotify_id: string | null;
  email: string | null;
  display_name: string | null;
  created_at: string | null;
}

// System monitoring removed

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

type DateRange = "today" | "last7days" | "thisMonth" | "allTime";

const Analytics = () => {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>("allTime");

  // Calculate date range filters
  const getDateRangeFilter = () => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    switch (dateRange) {
      case "today": {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return { gte: today.toISOString(), lte: now.toISOString() };
      }
      case "last7days": {
        const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        return { gte: sevenDaysAgo.toISOString(), lte: now.toISOString() };
      }
      case "thisMonth": {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        firstDay.setHours(0, 0, 0, 0);
        return { gte: firstDay.toISOString(), lte: now.toISOString() };
      }
      default:
        return null;
    }
  };

  // Fetch moods data from mood_entries table
  const { data: moodEntries = [], isLoading: moodsLoading, error: moodsError } = useQuery<MoodEntry[]>({
    queryKey: ["analytics-mood-entries", dateRange],
    queryFn: async () => {
      let query = supabaseAdmin
        .from("mood_entries")
        .select("id, user_id, mood, user_input, confidence, timestamp, date, day_of_week, hour, created_at, updated_at");
      
      const dateFilter = getDateRangeFilter();
      if (dateFilter) {
        query = query.gte("timestamp", dateFilter.gte).lte("timestamp", dateFilter.lte);
      }
      
      const { data, error } = await query.order("timestamp", { ascending: false });
      
      if (error) {
        console.error("Error fetching mood entries:", error);
        throw error;
      }
      
      const mappedEntries = (data || []).map((m: any) => ({
        id: String(m.id),
        user_id: String(m.user_id),
        mood: m.mood,
        user_input: m.user_input,
        confidence: m.confidence,
        timestamp: m.timestamp || m.created_at,
        date: m.date,
        day_of_week: m.day_of_week,
        hour: m.hour,
        created_at: m.created_at,
        updated_at: m.updated_at,
      })) as MoodEntry[];
      
      console.log("Fetched mood entries:", mappedEntries.length, mappedEntries);
      return mappedEntries;
    },
    staleTime: 30_000,
    retry: 1,
  });

  // Fetch users data from spotify_users (actual table name)
  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery<User[]>({
    queryKey: ["analytics-users"],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from("spotify_users")
        .select("id, spotify_id, email, display_name, created_at")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching users:", error);
        throw error;
      }
      const mappedUsers = (data || []).map((u: any) => ({
        id: String(u.id),
        spotify_id: u.spotify_id ? String(u.spotify_id) : null,
        email: u.email ?? null,
        display_name: u.display_name ?? null,
        created_at: u.created_at ?? null,
      })) as User[];
      console.log("Fetched users:", mappedUsers.length, mappedUsers);
      return mappedUsers;
    },
    staleTime: 30_000,
    retry: 1,
  });

  // System monitoring removed


  // Calculate mood distribution for pie chart - use ALL mood entries
  const moodDistribution = moodEntries.reduce((acc, entry) => {
    if (!entry.mood) return acc;
    const moodName = entry.mood.trim();
    if (!moodName) return acc;
    acc[moodName] = (acc[moodName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(moodDistribution)
    .map(([name, value]) => ({
      name: name.trim(),
      value,
    }))
    .filter(item => item.value > 0);

  // Top 3 moods - sorted by count (most common first)
  const top3Moods = [...pieData]
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  // Top 3 common user inputs (mood prompts)
  const userInputDistribution = moodEntries.reduce((acc, entry) => {
    if (!entry.user_input) return acc;
    const userInput = entry.user_input.trim();
    if (!userInput) return acc;
    acc[userInput] = (acc[userInput] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const top3UserInputs = Object.entries(userInputDistribution)
    .map(([input, count]) => ({ input: input.trim(), count }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  console.log("Mood distribution:", moodDistribution);
  console.log("Pie data:", pieData);
  console.log("Top 3 moods:", top3Moods);
  console.log("Top 3 user inputs:", top3UserInputs);

  // Calculate mood frequency over time based on date range
  const getLineChartDateRange = () => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    switch (dateRange) {
      case "today": {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return { start: today, end: now, days: 1 };
      }
      case "last7days": {
        const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        return { start: sevenDaysAgo, end: now, days: 7 };
      }
      case "thisMonth": {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        firstDay.setHours(0, 0, 0, 0);
        const daysInMonth = Math.ceil((now.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000)) + 1;
        return { start: firstDay, end: now, days: Math.min(daysInMonth, 31) };
      }
      default: {
        // For all time, show last 30 days
        const thirtyDaysAgo = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        return { start: thirtyDaysAgo, end: now, days: 30 };
      }
    }
  };

  const lineChartRange = getLineChartDateRange();
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  
  // Filter and count moods by date based on selected range
  const dailyMoods: Record<string, number> = {};
  
  // Initialize dates based on selected range
  const daysToShow = lineChartRange.days;
  for (let i = 0; i < daysToShow; i++) {
    const date = new Date(lineChartRange.end.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dailyMoods[dateStr] = 0;
  }

  // Count mood entries per day (filtered entries are already filtered by date range)
  moodEntries.forEach(entry => {
    if (!entry.timestamp && !entry.date) return;
    
    // Use date field if available, otherwise parse timestamp
    let entryDate: Date;
    if (entry.date) {
      entryDate = new Date(entry.date);
    } else {
      entryDate = new Date(entry.timestamp);
    }
    
    entryDate.setHours(0, 0, 0, 0);
    
    // Only include entries within the chart range
    if (entryDate >= lineChartRange.start && entryDate <= lineChartRange.end) {
      const dateStr = entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (dailyMoods.hasOwnProperty(dateStr)) {
        dailyMoods[dateStr]++;
      }
    }
  });

  // Convert to array and sort by date (oldest to newest)
  const lineData = Object.entries(dailyMoods)
    .map(([date, count]) => ({
      date,
      count,
    }))
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

  // Most common mood in selected date range
  const mostCommonMood = pieData.length > 0 
    ? pieData.reduce((max, current) => current.value > max.value ? current : max, pieData[0])
    : null;

  // Get date range label for display
  const getDateRangeLabel = () => {
    switch (dateRange) {
      case "today": return "Today";
      case "last7days": return "Last 7 Days";
      case "thisMonth": return "This Month";
      default: return "All Time";
    }
  };

  // User statistics - filter by date range
  const getActiveUsersInRange = () => {
    const dateFilter = getDateRangeFilter();
    if (!dateFilter) return users.length; // All time
    
    const startDate = new Date(dateFilter.gte);
    return users.filter(user => {
      if (!user.created_at) return false;
      const createdDate = new Date(user.created_at);
      return createdDate >= startDate;
    }).length;
  };

  // Users with mood entries in the selected date range
  const usersWithMoodsInRange = useMemo(() => {
    const uniqueUserIds = new Set(moodEntries.map(e => e.user_id));
    return users.filter(user => 
      user.spotify_id && uniqueUserIds.has(String(user.spotify_id))
    );
  }, [moodEntries, users]);

  const totalUsers = dateRange === "allTime" ? users.length : usersWithMoodsInRange.length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activeUsersToday = users.filter(user => {
    if (!user.created_at) return false;
    const createdDate = new Date(user.created_at);
    return createdDate >= today;
  }).length;

  // System monitoring removed

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ["analytics-mood-entries", dateRange] }),
      queryClient.refetchQueries({ queryKey: ["analytics-users"] }),
    ]);
    setRefreshing(false);
  };

  const isLoading = moodsLoading || usersLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Analytics</h1>
          <p className="text-muted-foreground mt-2">Comprehensive overview of Moodify system</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRange)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="last7days">Last 7 Days</SelectItem>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="allTime">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} disabled={refreshing || isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Error Messages */}
      {(moodsError || usersError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Data Loading Errors</AlertTitle>
          <AlertDescription>
            {moodsError && <div>Moods: {(moodsError as any)?.message || 'Failed to load moods'}</div>}
            {usersError && <div>Users: {(usersError as any)?.message || 'Failed to load users'}</div>}
          </AlertDescription>
        </Alert>
      )}


      {/* Mood Analytics Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-primary" />
          <h2 className="text-2xl font-semibold">Mood Analytics & Insights</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Most Common Mood ({getDateRangeLabel()})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : mostCommonMood ? (
                <>
                  <div className="flex items-center gap-2 mt-2">
                    <Smile className="h-8 w-8 text-primary" />
                    <div className="text-3xl font-bold">{mostCommonMood.name}</div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {mostCommonMood.value} {mostCommonMood.value === 1 ? 'entry' : 'entries'}
                  </p>
                </>
              ) : (
                <div className="text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>

          {/* Total Moods Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Total Mood Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold mt-2">{moodEntries.length}</div>
                  <p className="text-sm text-muted-foreground mt-1">All time</p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Top Moods Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Top 3 Moods
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : top3Moods.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {top3Moods.map((mood, idx) => (
                    <div key={mood.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs">
                          {idx + 1}
                        </span>
                        <span>{mood.name}</span>
                      </div>
                      <Badge variant="secondary">{mood.value}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Mood Distribution
              </CardTitle>
              <CardDescription>Percentage breakdown of all moods</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Loading chart...
                </div>
              ) : pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No mood data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5 text-primary" />
                Mood Frequency Over Time
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {getDateRangeLabel()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Loading chart...
                </div>
              ) : lineData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} name="Mood Entries" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No mood data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Activity Overview Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Users className="h-7 w-7 text-primary" />
          <h2 className="text-2xl font-semibold">User Activity Overview</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{totalUsers}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {dateRange === "allTime" ? "Total registered users" : "Users with mood entries"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                New Users Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{activeUsersToday}</div>
                  <p className="text-sm text-muted-foreground mt-1">Registered today</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Top 3 Common Mood Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-muted-foreground">Loading...</div>
              ) : top3UserInputs.length > 0 ? (
                <div className="space-y-2">
                  {top3UserInputs.map((item, idx) => (
                    <div key={item.input} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-semibold text-xs flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate">{item.input}</span>
                      </div>
                      <Badge variant="outline" className="ml-2 flex-shrink-0">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground">No data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users List</CardTitle>
            <CardDescription>All registered users with their last mood and login</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-muted-foreground">Loading users...</div>
            ) : users.length === 0 ? (
              <div className="text-muted-foreground">No users found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 font-medium">Name</th>
                      <th className="text-left p-2 font-medium">Email</th>
                      <th className="text-left p-2 font-medium">Last Mood</th>
                      <th className="text-left p-2 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(dateRange === "allTime" ? users : usersWithMoodsInRange).map((user) => {
                      // Find user's last mood from mood_entries data (already filtered by date range)
                      // Match user_id from mood_entries with spotify_id from spotify_users
                      const userMoodEntries = moodEntries.filter(m => {
                        if (!m.user_id) return false;
                        if (!user.spotify_id) return false;
                        
                        // Normalize both to strings and trim whitespace
                        const moodUserId = String(m.user_id).trim();
                        const userSpotifyId = String(user.spotify_id).trim();
                        
                        const matches = moodUserId === userSpotifyId;
                        if (matches) {
                          console.log(`Matched user ${user.display_name || user.email} (spotify_id: ${userSpotifyId}) with mood entry user_id: ${moodUserId}`);
                        }
                        return matches;
                      });
                      
                      console.log(`User ${user.display_name || user.email} (spotify_id: ${user.spotify_id}) has ${userMoodEntries.length} mood entries`);
                      
                      const lastMoodEntry = userMoodEntries.length > 0 
                        ? userMoodEntries.sort((a, b) => {
                            const timeA = new Date(a.timestamp || a.created_at || 0).getTime();
                            const timeB = new Date(b.timestamp || b.created_at || 0).getTime();
                            return timeB - timeA; // Most recent first
                          })[0]
                        : null;
                      
                      if (lastMoodEntry) {
                        console.log(`Last mood for ${user.display_name || user.email}:`, lastMoodEntry.mood);
                      }
                      
                      return (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">{user.display_name || "(no name)"}</td>
                          <td className="p-2">{user.email || "(no email)"}</td>
                          <td className="p-2">
                            {lastMoodEntry ? (
                              <Badge variant="secondary">{lastMoodEntry.mood}</Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="p-2 text-sm text-muted-foreground">
                            {user.created_at
                              ? new Date(user.created_at).toLocaleString()
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System monitoring removed */}
    </div>
  );
};

export default Analytics;

