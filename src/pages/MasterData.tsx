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

        <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600 text-xl">
            <AlertCircle className="h-4 w-4" />
            Important Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium text-foreground text-md">File Format Requirements:</h4>
            <ul className="list-hyphen list-inside space-y-1 text-sm text-muted-foreground">
              <li>File must be in CSV format (.csv)</li>
              <li>Ensure proper column formatting and naming</li>
              <li>Include all required data fields</li>
              <li>Remove any empty rows or columns</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">Data Validation:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Verify all numeric values are properly formatted</li>
              <li>Check date formats are consistent</li>
              <li>Ensure partner names match existing records</li>
              <li>Review data for completeness before upload</li>
            </ul>
          </div>
        </CardContent>
      </Card>
        <div className="w-full max-w-3xl mx-auto">
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
                <p className="text-muted-foreground">Uploading & processing…</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium text-foreground">
                    Drag & drop CSV here
                  </p>
                  <p className="text-muted-foreground">or click to browse</p>
                </div>
                <Button
                  variant="outline"
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