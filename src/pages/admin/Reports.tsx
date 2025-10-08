import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertCircle, BarChart3 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

const Reports = () => {
  const { data: counts } = useQuery({
    queryKey: ["dashboard-counts"],
    queryFn: async () => {
      const [usersRes, playbackRes, unmappedRes] = await Promise.all([
        supabase.from("spotify_users").select("id"),
        supabase.from("user_playback_history").select("id"),
        supabase.from("unmapped_moods").select("id"),
      ]);
      const usersCount = usersRes.data?.length ?? 0;
      const playbackHistory = playbackRes.data?.length ?? 0;
      const unmappedCount = unmappedRes.data?.length ?? 0;
      return {
        users: usersCount,
        playbackHistory,
        unmappedMoods: unmappedCount,
      };
    },
    staleTime: 30_000,
  });

  const stats = [
    {
      title: "Total Users",
      value: (counts?.users ?? 0).toLocaleString(),
      icon: Users,
      description: "Active users this month",
    },
    {
      title: "Unmapped Moods",
      value: (counts?.unmappedMoods ?? 0).toLocaleString(),
      icon: AlertCircle,
      description: "Pending moods to categorize",
    },
  ];

  // Replace with Most Common Unmapped Mood from `unmapped_moods.input_text`
  const { data: topUnmapped = [] } = useQuery<{ text: string; count: number }[]>({
    queryKey: ["top-unmapped"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unmapped_moods")
        .select("input_text");
      if (error) throw error;
      const counts: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        const t = (r.input_text || "").trim();
        if (!t) return;
        counts[t] = (counts[t] || 0) + 1;
      });
      return Object.entries(counts)
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    },
    staleTime: 60_000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-2">Overview of your mood playlist platform</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              {/* Change delta removed per request */}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Most Common Unmapped Moods</CardTitle>
          <CardDescription>Top input texts from unmapped moods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topUnmapped.length === 0 ? (
              <div className="text-sm text-muted-foreground">No unmapped moods yet.</div>
            ) : (
              topUnmapped.map((u) => (
                <div key={u.text} className="flex items-center justify-between text-sm p-2 border rounded-md">
                  <span className="font-medium truncate max-w-[60%]">{u.text}</span>
                  <span className="text-muted-foreground">{u.count}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
