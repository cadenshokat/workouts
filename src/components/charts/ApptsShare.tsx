import React, { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from "recharts"
import type { WeeklyMetrics } from "@/hooks/usePartnerData"
import type { OverallWeeklyMetrics } from "@/hooks/useOverallData"

interface ApptsShareProps {
  partnerMetrics: WeeklyMetrics[]
  allMetrics:    OverallWeeklyMetrics[]
  currentWeek:   number
}

export const ApptsShare: React.FC<ApptsShareProps> = ({
  partnerMetrics,
  allMetrics,
  currentWeek,
}) => {
  const chartData = useMemo(() => {
    // build weeks array [currentWeek-10 … currentWeek]
    return Array.from({ length: 11 }, (_, i) => {
      const wk = currentWeek - 10 + i
      const p  = partnerMetrics.find((d) => d.week_num === wk)
      const t  = allMetrics   .find((d) => d.week_num === wk)

      const partActual   = p?.appts_lcd_actual   ?? 0
      const totalActual  = t?.appts_lcd_actual   ?? 0
      const partBizplan  = p?.appts_lcd_bizplan  ?? 0
      const totalBizplan = t?.appts_lcd_bizplan  ?? 0

      const actualShare = totalActual  > 0 ? partActual  / totalActual  : 0
      const planShare   = totalBizplan > 0 ? partBizplan / totalBizplan : 0

      return {
        week:        wk,
        actualShare,
        planShare,
      }
    })
  }, [partnerMetrics, allMetrics, currentWeek])

  const fmtPct = (v: number) => `${(v * 100).toFixed(1)}%`

  return (
    <div className="">
      <h3 className="text-lg font-semibold text-center my-4 text-foreground">
        APPTS SHARE
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
          >
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
              domain={[0, 1]}
              tickFormatter={fmtPct}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                fmtPct(value),
                name === "planShare" ? "Bizplan Share" : "Actual Share",
              ]}
              labelFormatter={(label) => `Week ${label}`}
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
                color: "hsl(var(--popover-foreground))",
              }}
            />
            <Bar
              dataKey="planShare"
              fill="hsl(var(--chart-planned))"
              radius={[2, 2, 0, 0]}
              maxBarSize={40}
            >
              <LabelList
                dataKey="planShare"
                position="top"
                formatter={fmtPct}
                style={{ fill: "#333", fontSize: 12 }}
              />
            </Bar>
            <Bar
              dataKey="actualShare"
              fill="hsl(var(--chart-actual))"
              radius={[2, 2, 0, 0]}
              maxBarSize={40}
            >
              <LabelList
                dataKey="actualShare"
                position="top"
                formatter={fmtPct}
                style={{ fill: "#333", fontSize: 12 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 my-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-chart-planned rounded-full" />
          Bizplan Share
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-chart-actual rounded-full" />
          Actual Share
        </div>
      </div>
    </div>
  )
}
