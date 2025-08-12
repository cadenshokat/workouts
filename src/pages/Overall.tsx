import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Table as TableIcon, ChartBar } from "lucide-react";
import { OverallMetricChart } from "@/components/charts/OverallMetricChart";
import { LeversTable } from "@/components/tables/LeversTable";
import { NotesPanel } from "@/components/NotesPanel";
import { useOverallData } from "@/hooks/useOverallData";
import { OverallMetricTable } from "@/components/tables/OverallMetricTable"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getISOWeek } from "@/lib/iso-week"

export const Overall = () => {
  const { data: overallData, isLoading, error } = useOverallData();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Overall Performance</h2>
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Overall Performance</h2>
        <div className="flex items-center justify-center h-32">
          <div className="text-destructive">Error loading data: {error.message}</div>
        </div>
      </div>
    );
  }

  if (!overallData || overallData.length === 0) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-foreground">Overall Performance</h2>
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">No data found</div>
        </div>
      </div>
    );
  }

  const currentWeek = getISOWeek(new Date());  
  const displayWeek = currentWeek + currentWeekOffset;


  const handlePreviousWeek = () => {
    setCurrentWeekOffset(prev => prev - 2);
  };

  const handleNextWeek = () => {
    setCurrentWeekOffset(prev => prev + 2);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Overall Performance</h2>
        
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v: "table" | "chart") => v && setViewMode(v)}
            className="inline-flex bg-muted rounded-full"
          >
            <ToggleGroupItem value="chart" aria-label="Chart view">
              <ChartBar className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table view">
              <TableIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <NotesPanel
            partnerId="e01d35db-1330-4d8b-a71f-5696fceeef8d"
            partnerName="Overall"
            weekNumber={displayWeek}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousWeek}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-2 w-2" />
          </Button>
          
          <div className="bg-primary text-sm text-primary-foreground px-4 py-2 rounded-md font-semibold">
            Week {displayWeek}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
            className="flex items-center gap-1"
          >
            <ChevronRight className="h-2 w-2" />
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      {viewMode === "chart" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <OverallMetricChart
            data={overallData}
            metric="appts_ocd"
            title="APPTS OCD"
            currentWeek={displayWeek}
          />
          <OverallMetricChart
            data={overallData}
            metric="cpa"
            title="CPA OCD"
            currentWeek={displayWeek}
          />
        </div>
        ) : (
            <OverallMetricTable  
              data={overallData!} 
              currentWeek={displayWeek}
            />
            )}
      
      {/* Levers Table - for overall section, use a generic partner ID */}
      <LeversTable
        levers={[]}
        partnerId="overall"
        weekNumber={displayWeek}
        onUpdate={() => {}}
      />
    </div>
  );
};