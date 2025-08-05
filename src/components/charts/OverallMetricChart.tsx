import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList } from "recharts";
import { OverallWeeklyMetrics } from "@/hooks/useOverallData";

interface OverallMetricChartProps {
  data: OverallWeeklyMetrics[];
  metric: "appts_ocd" | "cpa";
  title: string;
  currentWeek: number;
}

export const OverallMetricChart = ({ data, metric, title, currentWeek }: OverallMetricChartProps) => {
  const chartData = [];
  
  for (let i = currentWeek - 10; i <= currentWeek + 0; i++) {
    const weekData = data.find(d => d.week_num === i);
    const isPastWeek = i <= currentWeek;
    
    let actualValue = null;
    let plannedValue = null;
    
    if (weekData) {
      if (metric === "appts_ocd") {
        actualValue = isPastWeek ? weekData.appts_ocd_actual : null;
        plannedValue = weekData.appts_ocd_bizplan;
      } else if (metric === "cpa") {
        actualValue = isPastWeek ? weekData.cpa_actual : null;
        plannedValue = weekData.cpa_bizplan;
      }
    }
    
    chartData.push({
      week: i,
      actual: actualValue,
      planned: plannedValue,
      isPast: isPastWeek,
    });
  }

  const formatValue = (value: number) => {
    if (value == null) return "";
    const formatted = value.toLocaleString("en-US");
    return metric === "appts_ocd"
      ? formatted
      : `$${formatted}`;
   };

  return (
    <div className="bg-card rounded-lg border p-6">
      <h3 className="text-lg font-semibold text-center mb-4 text-foreground">
        {title}
      </h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
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
              <LabelList dataKey="planned" position="top" formatter={(value) => formatValue(value)} style={{ fill: "#333", fontSize: 12 }} />
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