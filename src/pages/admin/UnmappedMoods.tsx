import {} from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Users as UsersIcon, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface UnmappedMood {
  id: string;
  mood: string;
  count: number;
  lastUsed: string;
}

// Categories removed along with mapping controls

const UnmappedMoods = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch unmapped moods from Supabase
  const { data: unmappedMoods = [], isLoading, isError, error } = useQuery<UnmappedMood[]>({
    queryKey: ["unmapped-moods"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("unmapped_moods")
        .select("id, input_text, timestamp")
        .order("timestamp", { ascending: false });
      if (error) throw error;
      return (data || []).map((row: any) => ({
        id: String(row.id),
        mood: row.input_text,
        count: 0,
        lastUsed: row.timestamp ?? "",
      }));
    },
  });

  // Summary counts
  const { data: counts } = useQuery({
    queryKey: ["dashboard-counts"],
    queryFn: async () => {
      const [usersRes, unmappedRes] = await Promise.all([
        supabase.from("spotify_users").select("id"),
        supabase.from("unmapped_moods").select("id"),
      ]);
      const usersCount = usersRes.data?.length ?? 0;
      const unmappedCount = unmappedRes.data?.length ?? 0;
      return {
        users: usersCount,
        unmappedMoods: unmappedCount,
      };
    },
    staleTime: 30_000,
  });

  // Top unmapped inputs
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

  // Delete unmapped mood
  const deleteMutation = useMutation({
    mutationFn: async (moodId: string) => {
      const { error } = await supabase.from("unmapped_moods").delete().eq("id", moodId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["unmapped-moods"] });
    },
    onError: (e: any) => {
      toast({ title: "Delete failed", description: e.message, variant: "destructive" });
    },
  });

  // Inline deletion is handled in the button click using deleteMutation

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Unmapped Moods</h1>
        <p className="text-muted-foreground mt-2">
          Map user-submitted moods to existing categories to improve detection
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(counts?.users ?? 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Active users this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unmapped Moods</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(counts?.unmappedMoods ?? 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending moods to categorize</p>
          </CardContent>
        </Card>
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

      <Card>
        <CardHeader>
          <CardTitle>Pending Moods</CardTitle>
          <CardDescription>
            {unmappedMoods.length} unmapped mood{unmappedMoods.length !== 1 ? "s" : ""} waiting for categorization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading unmapped moods…</div>
            ) : isError ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Could not load unmapped moods.</p>
                <p className="text-sm mt-1">{(error as any)?.message || "Check your Supabase table `unmapped_moods`."}</p>
              </div>
            ) : unmappedMoods.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No unmapped moods at the moment</p>
                <p className="text-sm mt-1">All user moods are properly categorized!</p>
              </div>
            ) : (
              unmappedMoods.map((mood) => (
                <div
                  key={mood.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">"{mood.mood}"</h3>
                      <Badge variant="secondary">{mood.count} uses</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Last used: {mood.lastUsed}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" onClick={() => {
                      deleteMutation.mutate(mood.id, {
                        onSuccess: () => {
                          toast({ title: "Mood deleted", description: `"${mood.mood}" has been removed from database` });
                        }
                      });
                    }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnmappedMoods;
