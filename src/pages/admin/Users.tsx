import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  playlists: number;
  status: "active" | "inactive";
}

const Users = () => {
  const users: User[] = [
    { id: "1", name: "John Doe", email: "john@example.com", joinDate: "2024-01-15", playlists: 12, status: "active" },
    { id: "2", name: "Sarah Smith", email: "sarah@example.com", joinDate: "2024-01-10", playlists: 8, status: "active" },
    { id: "3", name: "Mike Johnson", email: "mike@example.com", joinDate: "2024-01-05", playlists: 25, status: "active" },
    { id: "4", name: "Emma Wilson", email: "emma@example.com", joinDate: "2023-12-28", playlists: 5, status: "inactive" },
    { id: "5", name: "Alex Brown", email: "alex@example.com", joinDate: "2023-12-20", playlists: 15, status: "active" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground mt-2">Manage registered users</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>{users.length} registered users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{user.name}</h3>
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Joined: {user.joinDate}</span>
                    <span>•</span>
                    <span>{user.playlists} playlists</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
