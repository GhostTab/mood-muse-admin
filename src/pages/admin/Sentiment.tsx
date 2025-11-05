import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabaseAdmin } from "@/lib/supabase";
import { ResponsiveContainer, BarChart, Bar, Cell, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { Brain, Filter, RefreshCw } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

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

type DateRange = "today" | "last7days" | "thisMonth" | "allTime";

const Sentiment = () => {
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState<DateRange>("allTime");
  const [refreshing, setRefreshing] = useState(false);

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
  const { data: moodEntries = [], isLoading, error } = useQuery<MoodEntry[]>({
    queryKey: ["sentiment-mood-entries", dateRange],
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
      
      return (data || []).map((m: any) => ({
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
    },
    staleTime: 30_000,
    retry: 1,
  });

  // Categorize moods by sentiment
  const categorizeSentiment = (mood: string): "positive" | "neutral" | "negative" => {
    const moodLower = mood.toLowerCase().trim();
    
    // Positive moods: happy, excited, romantic, hopeful, energetic
    const positiveMoods = ["happy", "excited", "romantic", "hopeful", "energetic"];
    
    // Neutral moods: calm, serene
    const neutralMoods = ["calm", "serene"];
    
    // Negative moods: sad, heartbroken
    const negativeMoods = ["sad", "heartbroken"];
    
    if (positiveMoods.some(p => moodLower.includes(p))) return "positive";
    if (neutralMoods.some(n => moodLower.includes(n))) return "neutral";
    if (negativeMoods.some(n => moodLower.includes(n))) return "negative";
    
    // Default to neutral if not matching any category
    return "neutral";
  };

  // Calculate sentiment distribution
  const sentimentData = useMemo(() => {
    const sentimentCounts = moodEntries.reduce((acc, entry) => {
      if (!entry.mood) return acc;
      const sentiment = categorizeSentiment(entry.mood);
      acc[sentiment] = (acc[sentiment] || 0) + 1;
      return acc;
    }, { positive: 0, neutral: 0, negative: 0 } as Record<string, number>);
    
    const total = moodEntries.filter(e => e.mood).length;
    if (total === 0) {
      return [
        { name: "Positive", value: 0, percentage: 0, color: "#22c55e" },
        { name: "Neutral", value: 0, percentage: 0, color: "#eab308" },
        { name: "Negative", value: 0, percentage: 0, color: "#ef4444" },
      ];
    }
    
    return [
      { 
        name: "Positive", 
        value: sentimentCounts.positive, 
        percentage: Math.round((sentimentCounts.positive / total) * 100),
        color: "#22c55e" 
      },
      { 
        name: "Neutral", 
        value: sentimentCounts.neutral, 
        percentage: Math.round((sentimentCounts.neutral / total) * 100),
        color: "#eab308" 
      },
      { 
        name: "Negative", 
        value: sentimentCounts.negative, 
        percentage: Math.round((sentimentCounts.negative / total) * 100),
        color: "#ef4444" 
      },
    ];
  }, [moodEntries]);

  // Get date range label for display
  const getDateRangeLabel = () => {
    switch (dateRange) {
      case "today": return "Today";
      case "last7days": return "Last 7 Days";
      case "thisMonth": return "This Month";
      default: return "All Time";
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await queryClient.refetchQueries({ queryKey: ["sentiment-mood-entries", dateRange] });
    setRefreshing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sentiment Analysis</h1>
          <p className="text-muted-foreground mt-2">AI-powered sentiment insights from user moods</p>
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
            Refresh
          </Button>
        </div>
      </div>

      {/* Sentiment Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Sentiment Summary (AI Insight)
          </CardTitle>
          <CardDescription>Overall user sentiment breakdown for {getDateRangeLabel().toLowerCase()}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-muted-foreground">Loading sentiment data...</div>
          ) : moodEntries.length === 0 ? (
            <div className="text-muted-foreground">No mood data available for the selected date range</div>
          ) : (
            <div className="space-y-6">
              {/* Percentage Summary */}
              <div className="grid grid-cols-3 gap-4">
                {sentimentData.map((sentiment) => (
                  <div key={sentiment.name} className="text-center p-4 rounded-lg border">
                    <div className="text-3xl font-bold mb-2" style={{ color: sentiment.color }}>
                      {sentiment.percentage}%
                    </div>
                    <div className="text-sm font-medium mb-1">{sentiment.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {sentiment.value} {sentiment.value === 1 ? 'entry' : 'entries'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Bars */}
              <div className="space-y-3">
                {sentimentData.map((sentiment) => (
                  <div key={sentiment.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{sentiment.name}</span>
                      <span className="text-muted-foreground">{sentiment.percentage}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                        style={{
                          width: `${sentiment.percentage}%`,
                          backgroundColor: sentiment.color,
                        }}
                      >
                        {sentiment.percentage > 5 && (
                          <span className="text-xs font-semibold text-white">
                            {sentiment.percentage}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bar Chart */}
              <div className="pt-4">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={sentimentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#8884d8" radius={[8, 8, 0, 0]}>
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Sentiment Breakdown */}
              <div className="pt-4 border-t">
                <h3 className="text-lg font-semibold mb-3">Sentiment Categories</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg border" style={{ borderColor: "#22c55e", backgroundColor: "#22c55e10" }}>
                    <div className="font-semibold mb-2" style={{ color: "#22c55e" }}>Positive</div>
                    <div className="text-sm text-muted-foreground">
                      Moods: Happy, Excited, Romantic, Hopeful, Energetic
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border" style={{ borderColor: "#eab308", backgroundColor: "#eab30810" }}>
                    <div className="font-semibold mb-2" style={{ color: "#eab308" }}>Neutral</div>
                    <div className="text-sm text-muted-foreground">
                      Moods: Calm, Serene
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border" style={{ borderColor: "#ef4444", backgroundColor: "#ef444410" }}>
                    <div className="font-semibold mb-2" style={{ color: "#ef4444" }}>Negative</div>
                    <div className="text-sm text-muted-foreground">
                      Moods: Sad, Heartbroken
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Sentiment;

