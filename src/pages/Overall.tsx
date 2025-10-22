import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Table as TableIcon,
  ChartBar,
  LineChart as LineChartIcon, 
  Search,
} from "lucide-react";
import { OverallMetricChart } from "@/components/charts/OverallMetricChart";
import { OverallMetricLineChart } from "@/components/charts/OverallMetricLineChart";
import { OverallMetricTable } from "@/components/tables/OverallMetricTable";
import { LeversTable } from "@/components/tables/LeversTable";
import { NotesPanel } from "@/components/NotesPanel";
import { useOverallData } from "@/hooks/useOverallData";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { getISOWeek } from "@/lib/iso-week";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";

export interface Lever {
  id: string;
  week_number: number;
  partner_id: string;
  description: string;
  impact: number;
  confidence: number;
  net_impact: number | null;
}

export const Overall = () => {
  const { data: overallData, isLoading, error } = useOverallData();
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [viewMode, setViewMode] = useState<"chart" | "table" | "line">("chart");

  const [levers, setLevers] = useState<Lever[]>([]);
  const [leverQuery, setLeverQuery] = useState("");

  const refreshLevers = async () => {
    const { data, error } = await supabase
      .from("levers")
      .select("*")
      .eq("partner_id", "e01d35db-1330-4d8b-a71f-5696fceeef8d")
      .order("week_number", { ascending: true });
    if (!error && data) setLevers(data as Lever[]);
  };

  useEffect(() => {
    refreshLevers();
  }, []);

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

  {/* Even Workout Weeks */}
  /*
  const currentWeek = getISOWeek(new Date());  
  const fixedCurrentWeek = currentWeek % 2 === 0 ? currentWeek : currentWeek === 53 ? 52 : currentWeek + 1;
  
  const displayWeek = fixedCurrentWeek + currentWeekOffset;
  const toWorkoutWeek = (w: number) => (w % 2 === 0 ? w : Math.max(2, w - 1));
  const baseWeek = toWorkoutWeek(displayWeek);

  const leverWeeks = levers
    .map((l) => l.week_number)
    .filter((w): w is number => typeof w === "number" && !Number.isNaN(w));

  const minWeek = leverWeeks.length ? Math.min(...leverWeeks) : 2;
  const earliestWorkoutWeek = Math.max(2, toWorkoutWeek(minWeek));

  const workoutWeeks: number[] = [];
  for (let w = baseWeek; w >= earliestWorkoutWeek; w -= 2) workoutWeeks.push(w);
  */

  {/* Odd Workout Weeks */}
  const currentWeek = getISOWeek(new Date());
  const fixedCurrentWeek =
    currentWeek % 2 === 1 ? currentWeek : Math.max(1, currentWeek - 1);

  const displayWeek = fixedCurrentWeek + currentWeekOffset;

  const toWorkoutWeek = (w: number) => (w % 2 === 1 ? w : Math.max(1, w - 1));
  const baseWeek = toWorkoutWeek(displayWeek);

  const leverWeeks = levers
  .map((l: { week_number?: number }) => l.week_number)
  .filter((w): w is number => typeof w === "number" && !Number.isNaN(w));

  const minWeek = leverWeeks.length ? Math.min(...leverWeeks) : 1;
  const earliestWorkoutWeek = Math.max(1, toWorkoutWeek(minWeek));
  
  const workoutWeeks: number[] = [];
  for (let w = baseWeek; w >= earliestWorkoutWeek; w --) { workoutWeeks.push(w); }

  const q = leverQuery.trim().toLowerCase();
  const digitPart = q.replace(/\D+/g, "");
  const filteredWorkoutWeeks = q
    ? workoutWeeks.filter((week) => {
        const weekMatch = digitPart.length > 0 && week.toString().includes(digitPart);
        const textMatch = levers.some(
          (l) =>
            l.week_number === week &&
            (l.description || "").toLowerCase().includes(q)
        );
        return weekMatch || textMatch;
      })
    : workoutWeeks;

  const handlePreviousWeek = () => setCurrentWeekOffset((prev) => prev - 2);
  const handleNextWeek = () => setCurrentWeekOffset((prev) => prev + 2);

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center mt-4 gap-4 pb-4">
        <div className="flex items-center gap-4 ml-6">
          <h1 className="text-xl font-bold">Overall</h1>
        </div>

        <div className="flex justify-center">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(v) => v && setViewMode(v as "chart" | "line" | "table")}
            className="inline-flex rounded-full bg-muted p-1 shadow-sm"
          >
            <ToggleGroupItem
              value="chart"
              aria-label="Bar view"
              className="h-8 w-10 rounded-full transition-colors data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <ChartBar className="h-4 w-4 mx-auto" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="line"
              aria-label="Line view"
              className="h-8 w-10 rounded-full transition-colors data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <LineChartIcon className="h-4 w-4 mx-auto" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="table"
              aria-label="Table view"
              className="h-8 w-10 rounded-full transition-colors data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <TableIcon className="h-4 w-4 mx-auto" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex items-center justify-end gap-4 mr-6">
          <Button variant="outline" size="sm" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-2 w-2" />
          </Button>
          <div className="px-4 py-2 bg-primary text-sm text-primary-foreground rounded-md font-semibold">
            Week {displayWeek}
          </div>
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            <ChevronRight className="h-2 w-2" />
          </Button>

          <NotesPanel
            partnerId="e01d35db-1330-4d8b-a71f-5696fceeef8d"
            partnerName="Overall"
            weekNumber={displayWeek}
          />
        </div>
      </div>

      {viewMode === "chart" ? (
        <div className="grid grid-cols-[1fr_auto_1fr] gap-x-2 items-stretch">
          <OverallMetricChart
            data={overallData}
            metric="appts_ocd"
            title="APPTS OCD"
            currentWeek={displayWeek}
          />
          <Separator orientation="vertical" className="h-full" />
          <OverallMetricChart
            data={overallData}
            metric="cpa"
            title="CPA OCD"
            currentWeek={displayWeek}
          />
        </div>
      ) : viewMode === "line" ? (
        <div className="grid grid-cols-[1fr_auto_1fr] gap-x-2 items-stretch">
          <OverallMetricLineChart
            data={overallData}
            metric="appts_ocd"
            title="APPTS OCD"
            currentWeek={displayWeek}
          />
          <Separator orientation="vertical" className="h-full" />
          <OverallMetricLineChart
            data={overallData}
            metric="cpa"
            title="CPA OCD"
            currentWeek={displayWeek}
          />
        </div>
      ) : (
        <OverallMetricTable data={overallData} currentWeek={displayWeek} />
      )}

      <Separator />
      <div className="pt-2 px-6">
        <div className="flex items-center justify-center gap-2 mt-2">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={leverQuery}
              onChange={(e) => setLeverQuery(e.target.value)}
              placeholder="Search levers or week number…"
              className="pl-8"
            />
          </div>
          {leverQuery && (
            <Button variant="ghost" onClick={() => setLeverQuery("")}>
              Clear
            </Button>
          )}
          <span className="text-xs text-muted-foreground">
            {filteredWorkoutWeeks.length} result
            {filteredWorkoutWeeks.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {filteredWorkoutWeeks.length === 0 ? (
        <div className="px-6 py-8 text-sm text-muted-foreground">
          No matching weeks or levers.
        </div>
      ) : (
        filteredWorkoutWeeks.map((week, idx) => (
          <LeversTable
            key={week}
            levers={levers}
            partnerId="e01d35db-1330-4d8b-a71f-5696fceeef8d"
            weekNumber={week}
            onUpdate={refreshLevers}
            title={`Levers – Week ${week}${week === fixedCurrentWeek ? " (Current)" : ""}`}
            highlightQuery={leverQuery}
          />
        ))
      )}
    </div>
  );
};
