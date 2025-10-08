import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music, Eye } from "lucide-react";

interface Playlist {
  id: string;
  user: string;
  mood: string;
  createdAt: string;
  tracks: number;
  genre?: string;
}

const Playlists = () => {
  const playlists: Playlist[] = [
    { id: "1", user: "John Doe", mood: "Happy", createdAt: "2024-01-15 10:30", tracks: 25, genre: "Pop" },
    { id: "2", user: "Sarah Smith", mood: "Calm", createdAt: "2024-01-15 09:15", tracks: 20, genre: "Ambient" },
    { id: "3", user: "Mike Johnson", mood: "Energetic", createdAt: "2024-01-14 18:45", tracks: 30, genre: "Rock" },
    { id: "4", user: "Emma Wilson", mood: "Sad", createdAt: "2024-01-14 16:20", tracks: 15, genre: "Indie" },
    { id: "5", user: "Alex Brown", mood: "Focus", createdAt: "2024-01-14 14:00", tracks: 40, genre: "Classical" },
    { id: "6", user: "John Doe", mood: "Romantic", createdAt: "2024-01-13 20:30", tracks: 18, genre: "R&B" },
    { id: "7", user: "Sarah Smith", mood: "Happy", createdAt: "2024-01-13 12:15", tracks: 22, genre: "Dance" },
  ];

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
          <CardDescription>{playlists.length} playlists generated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {playlists.map((playlist) => (
              <div
                key={playlist.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Music className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{playlist.user}'s Playlist</h3>
                      <Badge variant={getMoodColor(playlist.mood) as any}>{playlist.mood}</Badge>
                      {playlist.genre && (
                        <Badge variant="outline" className="text-xs">
                          {playlist.genre}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-3 text-sm text-muted-foreground">
                      <span>{playlist.tracks} tracks</span>
                      <span>•</span>
                      <span>{playlist.createdAt}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Playlists;
