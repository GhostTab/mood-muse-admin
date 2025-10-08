import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface PlaylistRow {
  id: string;
  name: string | null;
  mood: string | null;
  created_at: string | null;
  spotify_user_id: string | null;
}

const Playlists = () => {
  const { data: playlists = [], isLoading, isError, error } = useQuery<PlaylistRow[]>({
    queryKey: ["saved-playlists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_playlists")
        .select("id, name, mood, created_at, spotify_user_id")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []).map((p: any) => ({
        id: String(p.id),
        name: p.name ?? null,
        mood: p.mood ?? null,
        created_at: p.created_at ?? null,
        spotify_user_id: p.spotify_user_id ?? null,
      }));
    },
    staleTime: 15_000,
  });

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      Happy: "default",
      Sad: "secondary",
      Calm: "outline",
      Energetic: "default",
      Focus: "secondary",
      Romantic: "outline",
    };
    return colors[mood] || "secondary";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Playlists</h1>
        <p className="text-muted-foreground mt-2">View all generated playlists</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Playlists</CardTitle>
          <CardDescription>
            {isLoading ? "Loading…" : isError ? (error as any)?.message || "Error" : `${playlists.length} saved playlists`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-muted-foreground">Loading playlists…</div>
            ) : isError ? (
              <div className="text-muted-foreground">Failed to load playlists.</div>
            ) : playlists.length === 0 ? (
              <div className="text-muted-foreground">No saved playlists yet.</div>
            ) : playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Music className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold">{playlist.name || "(no name)"}</h3>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Playlists;
