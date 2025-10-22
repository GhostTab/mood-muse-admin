import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface UserRow {
  id: string;
  display_name: string | null;
  email: string | null;
  created_at: string | null;
}

const Users = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: users = [], isLoading, isError, error } = useQuery<UserRow[]>({
    queryKey: ["spotify-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("spotify_users")
        .select("id, display_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data || []).map((u: any) => ({
        id: String(u.id),
        display_name: u.display_name ?? null,
        email: u.email ?? null,
        created_at: u.created_at ?? null,
      }));
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("spotify_users")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: async (_res, id) => {
      await queryClient.refetchQueries({ queryKey: ["spotify-users"], type: "active" });
      const refreshed = queryClient.getQueryData<UserRow[]>(["spotify-users"]) || [];
      const stillExists = refreshed.some((u) => u.id === id);
      if (stillExists) {
        toast({ title: "Failed to delete user", description: "User still present after delete (RLS/permissions?)" });
      } else {
        toast({ title: "User deleted" });
      }
    },
    onError: (err: any) => {
      const message = err?.message || "Unknown error";
      toast({ title: "Failed to delete user", description: message });
    },
  });

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
          <CardDescription>
            {isLoading ? "Loading…" : isError ? (error as any)?.message || "Error" : `${users.length} registered users`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-muted-foreground">Loading users…</div>
            ) : isError ? (
              <div className="text-muted-foreground">Failed to load users.</div>
            ) : users.length === 0 ? (
              <div className="text-muted-foreground">No users found.</div>
            ) : users.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{user.display_name || "(no name)"}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email || "(no email)"}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</span>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Delete user">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this account?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove the user record from the database. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteUser.mutate(user.id)}>
                        {deleteUser.isPending ? "Deleting…" : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
