import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">Mood-Based Playlist Generator</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Generate perfect playlists based on your mood
        </p>
        <Button onClick={() => navigate("/admin/login")} size="lg">
          <Shield className="w-5 h-5 mr-2" />
          Admin Access
        </Button>
      </div>
    </div>
  );
};

export default Index;
