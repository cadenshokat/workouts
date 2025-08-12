import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client'
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export const MasterData = () => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { session } = useAuth()
  const user = session?.user.id
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    
    const file = files[0];

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast({ title: "Invalid file type", description: "Please upload a CSV file.", variant: "destructive" });
      return;
    }

    setIsUploading(true);

    try {
      const csvText = await file.text();
      const headers: Record<string, string> = { "Content-Type": "text/csv" };
      headers.Authorization = `Bearer ${session.access_token}`;

      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/master-data`;

      const resp = await fetch(fnUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'text/csv', 
        },
        body: csvText,
      });

      toast({
        title: "Import successful",
        //description: `${upserted} rows upserted.`,
      });
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Master Data Upload</h1>
        <div className="w-full max-w-3xl mx-auto h-full">
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
              ${isUploading ? "opacity-50 pointer-events-none" : "hover:border-primary/50 hover:bg-primary/5"}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isUploading ? (
              <div className="space-y-4">
                <div className="animate-spin mx-auto h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
                <p className="text-muted-foreground">processing</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-md font-medium text-foreground">
                    Drag & drop CSV here
                  </p>
                  <p className="text-muted-foreground text-md">or click to browse</p>
                </div>
                <Button
                  variant="default"
                  onClick={() =>
                    document.getElementById("file-input")?.click()
                  }
                >
                  Browse Files
                </Button>
                <input
                  id="file-input"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>
      {/* Instructions Card */}
      
    </div>
  );
};