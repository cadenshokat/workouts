import React, { useState } from "react";
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
import { ChevronLeft, ChevronRight, Table as TableIcon, ChartBar } from "lucide-react";
import { WeekFilter } from "@/components/WeekFilter"
import {NotesPanel} from "@/components/NotesPanel";
import {MetricChart} from "@/components/charts/MetricChart";
import {MetricTable} from "@/components/tables/MetricTable";
import {LeversTable} from "@/components/tables/LeversTable";
import { ApptsShare } from "@/components/charts/ApptsShare";
import { useOverallData } from "@/hooks/useOverallData";

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

  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

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

  const currentWeek = Math.max(...metrics.map(m => m.week_num), 30);
  const displayWeek = currentWeek + currentWeekOffset;

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
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
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

        <div className="flex items-center gap-4">
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

          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousWeek}
          >
            <ChevronLeft className="h-2 w-2" />
          </Button>
          <div className="px-4 py-2 bg-primary text-sm text-primary-foreground rounded-md font-semibold">
            Week {displayWeek}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
          >
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
            ? "grid grid-cols-1 lg:grid-cols-2 gap-4"
            : "grid grid-cols-1 lg:grid-cols-3 gap-4"
          }
        >
          <MetricChart
            data={metrics}
            metric="appts"
            title="APPTS"
            currentWeek={displayWeek}
          />
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
            <MetricChart
              data={metrics}
              metric="cpa"
              title="CPA"
              currentWeek={displayWeek}
            />
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

      <LeversTable
        levers={levers}
        partnerId={entry!.id}
        weekNumber={displayWeek}
        onUpdate={refetch}
      />
    </div>
  );
}
