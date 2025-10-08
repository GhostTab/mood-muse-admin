import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Music, TrendingUp, Heart } from "lucide-react";

const Reports = () => {
  const stats = [
    {
      title: "Total Users",
      value: "1,234",
      change: "+12.5%",
      icon: Users,
      description: "Active users this month",
    },
    {
      title: "Playlists Generated",
      value: "5,678",
      change: "+23.1%",
      icon: Music,
      description: "Total playlists created",
    },
    {
      title: "Avg. Satisfaction",
      value: "4.8/5",
      change: "+0.3",
      icon: Heart,
      description: "User rating average",
    },
    {
      title: "Most Used Mood",
      value: "Happy",
      change: "45% of requests",
      icon: TrendingUp,
      description: "Top mood category",
    },
  ];

  const topMoods = [
    { mood: "Happy", count: 2543, percentage: 45 },
    { mood: "Calm", count: 1678, percentage: 29 },
    { mood: "Energetic", count: 892, percentage: 16 },
    { mood: "Sad", count: 445, percentage: 8 },
    { mood: "Focus", count: 120, percentage: 2 },
  ];

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
              <p className="text-xs text-green-600 mt-2">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Most Common Moods</CardTitle>
          <CardDescription>Distribution of mood categories used by users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topMoods.map((item) => (
              <div key={item.mood} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{item.mood}</span>
                  <span className="text-muted-foreground">
                    {item.count} uses ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
