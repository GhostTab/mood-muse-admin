import {} from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
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
