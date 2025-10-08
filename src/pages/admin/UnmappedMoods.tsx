import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UnmappedMood {
  id: string;
  mood: string;
  count: number;
  lastUsed: string;
}

const MOOD_CATEGORIES = ["Happy", "Sad", "Calm", "Energetic", "Angry", "Romantic", "Focus"];

const UnmappedMoods = () => {
  const { toast } = useToast();
  const [unmappedMoods, setUnmappedMoods] = useState<UnmappedMood[]>([
    { id: "1", mood: "vibing", count: 45, lastUsed: "2024-01-15" },
    { id: "2", mood: "chill vibes", count: 32, lastUsed: "2024-01-14" },
    { id: "3", mood: "pumped up", count: 28, lastUsed: "2024-01-13" },
    { id: "4", mood: "nostalgic", count: 19, lastUsed: "2024-01-12" },
    { id: "5", mood: "motivated", count: 15, lastUsed: "2024-01-11" },
    { id: "6", mood: "melancholic", count: 12, lastUsed: "2024-01-10" },
    { id: "7", mood: "hyped", count: 8, lastUsed: "2024-01-09" },
  ]);

  const [selectedCategories, setSelectedCategories] = useState<Record<string, string>>({});

  const handleMap = (moodId: string, mood: string) => {
    const category = selectedCategories[moodId];
    if (!category) {
      toast({
        title: "Select a category",
        description: "Please select a mood category first",
        variant: "destructive",
      });
      return;
    }

    setUnmappedMoods(unmappedMoods.filter((m) => m.id !== moodId));
    toast({
      title: "Mood mapped successfully",
      description: `"${mood}" has been mapped to ${category}`,
    });
  };

  const handleDelete = (moodId: string, mood: string) => {
    setUnmappedMoods(unmappedMoods.filter((m) => m.id !== moodId));
    toast({
      title: "Mood deleted",
      description: `"${mood}" has been removed`,
    });
  };

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
            {unmappedMoods.length === 0 ? (
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
                    <Select
                      value={selectedCategories[mood.id] || ""}
                      onValueChange={(value) =>
                        setSelectedCategories({ ...selectedCategories, [mood.id]: value })
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOOD_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      size="icon"
                      onClick={() => handleMap(mood.id, mood.mood)}
                      disabled={!selectedCategories[mood.id]}
                    >
                      <Check className="w-4 h-4" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(mood.id, mood.mood)}
                    >
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
