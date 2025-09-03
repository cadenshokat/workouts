import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList, Cell, CartesianGrid } from "recharts";
import { OverallWeeklyMetrics } from "@/hooks/useOverall";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";
import React, { useMemo, useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { getISOWeek } from "@/lib/iso-week";

interface OverallMetricChartProps {
  data: OverallWeeklyMetrics[];
  metric: "appts_ocd" | "cpa";
  title: string;
  currentWeek: number;
}

type ChartRow = {
  week: number;
  actual: number | null;
  planned: number | null;
  isPast: boolean;
};

function arraysEqual(a: number[], b: number[]) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

export const OverallMetricChart = ({ data, metric, title, currentWeek }: OverallMetricChartProps) => {
  const safeCPA = (costs: number | null | undefined, appts: number | null | undefined) => {
    if (costs == null || appts == null) return null;
    if (appts <= 0) return null; 
    const v = costs / appts;
    return Number.isFinite(v) ? Math.round(v) : null;
  };

  const toWorkoutWeek = (w: number) => (w % 2 === 0 ? w : Math.max(2, w - 1));

   const realIsoWeek = getISOWeek(new Date());
  const realCurrentWorkoutWeek = realIsoWeek % 2 === 0 ? realIsoWeek : realIsoWeek === 53 ? 52 : realIsoWeek + 1;

  const windowWeeks = useMemo(() => {
    const raw = [];
    for (let i = currentWeek - 4; i <= currentWeek + 4; i++) raw.push(i);
    return raw.filter((w, idx) => raw.indexOf(w) === idx);
  }, [currentWeek]);

  const chartData: ChartRow[] = useMemo(() => {
    return windowWeeks.map((w) => {
      const row = data.find(d => d.week_num === w);

      let actual: number | null = null;
      let planned: number | null = null;

      if (row) {
        // compute values per metric
        if (metric === "appts_ocd") {
          planned = row.appts_ocd_bizplan ?? null;

          if (w < realCurrentWorkoutWeek) {
            // past weeks: show actuals
            actual = row.appts_ocd_actual ?? null;
          } else if (w === realCurrentWorkoutWeek) {
            // current real week: hide or zero actuals to avoid implying completeness
            actual = 0; // or use `row.appts_ocd_actual ?? 0` if you want partial bars
          } else {
            // future weeks
            actual = null;
          }
        } else {
          planned = safeCPA(row.costs_bizplan, row.appts_ocd_bizplan);

          if (w < realCurrentWorkoutWeek) {
            actual = safeCPA(row.costs_actual, row.appts_ocd_actual);
          } else if (w === realCurrentWorkoutWeek) {
            actual = 0; // or safeCPA(row.costs_actual, row.appts_ocd_actual) if you want partial
          } else {
            actual = null;
          }
        }
      }

      const isPast = w < realCurrentWorkoutWeek;
      return { week: w, actual, planned, isPast };
    });
  }, [data, metric, windowWeeks, realCurrentWorkoutWeek]);


  const IsoWeek = getISOWeek(new Date());
  const fixedCurrentWeek =
    IsoWeek % 2 === 0 ? IsoWeek : IsoWeek === 53 ? 52 : IsoWeek + 1;

  const defaultWeeks = useMemo(() => chartData.map(d => d.week), [chartData]);

  const [visibleWeeks, setVisibleWeeks] = useState<number[]>([]);
  useEffect(() => {
    // reset to new default when the window changes
    setVisibleWeeks(defaultWeeks);
  }, [defaultWeeks]);

  const filteredData = useMemo(
    () => chartData.filter(d => visibleWeeks.includes(d.week)),
    [chartData, visibleWeeks]
  );



  const formatValue = (value: number) => {
    if (value == null) return "";
    const formatted = value.toLocaleString("en-US");
    return metric === "appts_ocd"
      ? formatted
      : `$${formatted}`;
   };

  return (
    <div className="p-6">
      <div className="relative flex items-center">
              <h3 className="text-lg font-semibold mx-auto my-3 text-foreground">
                {title}
              </h3>
              <div className="absolute right-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className="">
                      <Button variant="ghost" size="sm" className="p-2">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="p-2 space-y-1">
                      {chartData.map(d => (
                        <label key={d.week} className="flex items-center gap-2">
                          <Checkbox
                            className="h-4 w-4 rounded-none"
                            checked={visibleWeeks.includes(d.week)}
                            onCheckedChange={checked => {
                              setVisibleWeeks(v =>
                                checked
                                  ? [...v, d.week]
                                  : v.filter(w => w !== d.week)
                              );
                            }}
                          />
                          <span className="select-none">Week {d.week}</span>
                        </label>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filteredData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid
              stroke="hsl(var(--muted-foreground))"
              vertical={false}
              strokeOpacity={0.8}
              strokeWidth={.2}
              strokeDasharray="3 3"
            />
            <XAxis 
              dataKey="week" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={formatValue}
              
            />
            <Tooltip
              formatter={(value: any, name: string) => [
                value ? formatValue(value) : 'No data',
                name === 'planned' ? 'Bizplan' : 'Actual'
              ]}
              labelFormatter={(label) => `Week ${label}`}
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: 'hsl(var(--popover-foreground))'
              }}
            />
            <Bar 
              dataKey="planned" 
              fill="hsl(var(--chart-planned))" 
              radius={[2, 2, 0, 0]}
              maxBarSize={40}
            >
              
            {filteredData.map(d => (
              <Cell
                key={`planned-${d.week}`}
                strokeDasharray={d.week === fixedCurrentWeek ? "3 3" : undefined}
                stroke={d.week === fixedCurrentWeek ? "#1e3a8a" : undefined}
                fill={d.week === fixedCurrentWeek ? "transparent" : "hsl(var(--chart-planned))"}
              />
            ))}
              <LabelList dataKey="planned" position="top" stroke="" formatter={(value) => formatValue(value)} style={{ fill: "#333", fontSize: 12 }} />
            </Bar>
            <Bar 
              dataKey="actual" 
              fill="hsl(var(--chart-actual))" 
              radius={[2, 2, 0, 0]}
              maxBarSize={40}
            >
              <LabelList dataKey="actual" position="top" formatter={(value) => formatValue(value)} style={{ fill: "#333", fontSize: 12 }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-chart-planned rounded"></div>
          <span className="text-sm text-muted-foreground">Bizplan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-chart-actual rounded"></div>
          <span className="text-sm text-muted-foreground">Actual</span>
        </div>
      </div>
    </div>
  );
};