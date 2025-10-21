import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import Spinner from "@/components/Spinner";
import { useAllPartners } from "@/hooks/useAllPartners";
import { usePartnerData } from "@/hooks/usePartnerData";
import { useData } from "@/hooks/useData"
import { usePartnerManagers } from "@/hooks/usePartnerManagers";
import { supabase } from "@/integrations/supabase/client";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Table as TableIcon, ChartBar, LineChartIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {NotesPanel} from "@/components/NotesPanel";
import {MetricChart} from "@/components/charts/MetricChart";
import {MetricTable} from "@/components/tables/MetricTable";
import {LeversTable} from "@/components/tables/LeversTable";
import { ApptsShare } from "@/components/charts/ApptsShare";
import { useOverallData } from "@/hooks/useOverallData";
import { getISOWeek } from "@/lib/iso-week"
import { MetricLineChart } from "@/components/charts/MetricLineChart"
import { ApptsShareLine } from "@/components/charts/ApptsShareLineChart";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function PartnersPage() {
  const { partnerSlug } = useParams<{ partnerSlug: string }>();

  const { data: partners, isLoading: loadingP } = useAllPartners();
  const entry = partners?.find((p) => p.slug === partnerSlug);

  const {
    data: partnerData,
    isLoading: loadingData,
    error: dataError,
  } = usePartnerData(partnerSlug, entry?.id);

  const {
    data: mgrData,
    isLoading: loadingMgrs,
    error: mgrError,
  } = usePartnerManagers();

  const { data: overallData, isLoading, error } = useOverallData();

  const [viewMode, setViewMode] = useState<"chart" | "table" | "line">("chart");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [leverQuery, setLeverQuery] = useState("");

  const {
    data: window,
    isLoading: loading,
    error: windowErr,
    refetch
  } = useData(partnerSlug, entry?.id);

  const crmOnlySlugs = ["crm-email", "crm-sms"];
  const isCRMPartner = crmOnlySlugs.includes(partnerSlug || "");

  if (loadingP || loadingData || loadingMgrs) return <Spinner />;
  if (dataError) return <div>Error loading data: {dataError.message}</div>;
  if (mgrError)  return <div>Error loading managers: {mgrError.message}</div>;
  if (!partnerData)  return <div>No data for “{partnerSlug}”</div>;

  const { partnerName: name, weeklyMetrics: metrics, levers } = window

  const managerBadges =
    mgrData
      .filter((m) => m.partner === entry?.id)
      .map((m) => ({ name: m.manager_name, color: m.manager_color }))
      .filter((x) => x.name);

  {/* Even Workout Weeks */}
  /*  UNCOMMENT FOR EVEN WEEKS
    const currentWeek = getISOWeek(new Date());  
    const fixedCurrentWeek =
      currentWeek % 2 === 0 ? currentWeek : currentWeek === 53 ? 52 : currentWeek + 1;

    const displayWeek = fixedCurrentWeek + currentWeekOffset;
    const toWorkoutWeek = (w: number) => (w % 2 === 0 ? w : Math.max(2, w - 1));

    const baseWeek = toWorkoutWeek(displayWeek);

    const leverWeeks = levers
      .map((l: { week_number?: number }) => l.week_number)
      .filter((w): w is number => typeof w === "number" && !Number.isNaN(w));

    const minWeek = leverWeeks.length ? Math.min(...leverWeeks) : 2;
    const earliestWorkoutWeek = Math.max(2, toWorkoutWeek(minWeek));
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
        const weekMatch =
          digitPart.length > 0 && week.toString().includes(digitPart);
        const textMatch = levers.some(
          (l) =>
            l.week_number === week &&
            (l.description || "")
              .toLowerCase()
              .includes(q)
        );
        return weekMatch || textMatch;
      })
    : workoutWeeks;

  const handlePreviousWeek = () => {
    setCurrentWeekOffset(prev => prev - 2);
  };

  const handleNextWeek = () => {
    setCurrentWeekOffset(prev => prev + 2);
  };

  const handleCellUpdate = async (
    id: string,
    column: keyof Omit<typeof metrics[0], "id"|"partner"|"week_num"|"year_num">,
    value: number
  ) => {
    const { error: upErr } = await supabase
      .from("partner_data_override")
      .upsert({ id, [column]: value });
    if (upErr) {
      console.error("Update failed:", upErr.message);
    } else {
      await refetch();  
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center mt-4 gap-4">
        <div className="flex items-center gap-4 ml-6">
          <h1 className="text-xl font-bold">{name}</h1>
          {managerBadges.length > 0 && (
            <div className="flex gap-1 mt-1">
              {managerBadges.map((b, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  style={{ backgroundColor: b.color }}
                >
                  {b.name}
                </Badge>
              ))}
            </div>
          )}
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
              className="h-8 w-10 rounded-sm transition-colors data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <ChartBar className="h-full w-full" />
            </ToggleGroupItem>

            <ToggleGroupItem
              value="line"
              aria-label="Line view"
              className="h-8 w-10 rounded-full transition-colors data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <LineChartIcon className="h-4 w-4" />
            </ToggleGroupItem>

            <ToggleGroupItem
              value="table"
              aria-label="Table view"
              className="h-8 w-10 rounded-full transition-colors data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <TableIcon className="h-4 w-4" />
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
            partnerId={entry!.id}
            partnerName={name}
            weekNumber={displayWeek}
          />
        </div>
      </div>

      {viewMode === "chart" ? (
        <div className={
          isCRMPartner
            ? "grid grid-cols-[1fr_auto_1fr] gap-x-2 items-stretch"
            : "grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-x-2 pt-4 items-stretch"
          }
        >
          <MetricChart
            data={metrics}
            metric="appts"
            title="APPTS"
            currentWeek={displayWeek}
          />
         
          <Separator orientation="vertical" className="h-full" />
          {isCRMPartner ? (
            <ApptsShare
              partnerMetrics={metrics}
              allMetrics={overallData}
              currentWeek={displayWeek}
            />
          ) : (
          <>          
            <MetricChart
              data={metrics}
              metric="cpl"
              title="CPL"
              currentWeek={displayWeek}
            />
            <Separator orientation="vertical" className="h-full w-[.5px]" />
            <MetricChart
              data={metrics}
              metric="cpa"
              title="CPA"
              currentWeek={displayWeek}
            />
          </>
          )}
        </div>
      ) : viewMode === "line" ? (
          <div
            className={
              isCRMPartner
                ? "grid grid-cols-[1fr_auto_1fr] gap-x-2 items-stretch"
                : "grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-x-2 pt-4 items-stretch"
            }
          >
            <MetricLineChart data={metrics} metric="appts" title="APPTS" currentWeek={displayWeek} />
            <Separator orientation="vertical" className="h-full" />
            {isCRMPartner ? (
              <ApptsShareLine partnerMetrics={metrics} allMetrics={overallData} currentWeek={displayWeek} />
            ) : (
              <>
                <MetricLineChart data={metrics} metric="cpl" title="CPL" currentWeek={displayWeek} />
                <Separator orientation="vertical" className="h-full" />
                <MetricLineChart data={metrics} metric="cpa" title="CPA" currentWeek={displayWeek} />
              </>
            )}
          </div>
      ) : (
        <MetricTable 
          data={metrics} 
          currentWeek={displayWeek}
          onCellUpdate={handleCellUpdate}
        />
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
              {filteredWorkoutWeeks.length} result{filteredWorkoutWeeks.length === 1 ? "" : "s"}
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
              partnerId={entry!.id}
              weekNumber={week}
              onUpdate={refetch}
              title={`Levers – Week ${week}${week === fixedCurrentWeek ? " (Current Week)" : ""}`}
              highlightQuery={leverQuery}
            />
          ))
        )}
      </div>
  );
}
