import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { OverallWeeklyMetrics } from "@/hooks/useOverallData";

interface OverallMetricTableProps {
  data: OverallWeeklyMetrics[];
  currentWeek: number;
}

export const OverallMetricTable: React.FC<OverallMetricTableProps> = ({
  data,
  currentWeek,
}) => {
  const rows = [];
  for (let w = currentWeek - 10; w <= currentWeek; w++) {
    const weekData = data.find((d) => d.week_num === w);
    rows.push({
      week: w,
      appts_ocd_actual:  weekData?.appts_ocd_actual  ?? null,
      appts_ocd_bizplan: weekData?.appts_ocd_bizplan ?? null,
      cpa_actual:        weekData?.cpa_actual        ?? null,
      cpa_bizplan:       weekData?.cpa_bizplan       ?? null,
    });
  }

  const formatNum = (n: number | null) =>
    n == null ? "–" : n.toLocaleString("en-US");

  return (
    <Table className="table-fixed">
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/5 text-left">Week</TableHead>
          <TableHead className="w-1/5 text-center">Appts OCD (Actual)</TableHead>
          <TableHead className="w-1/5 text-center">Appts OCD (Bizplan)</TableHead>
          <TableHead className="w-1/5 text-center">CPA (Actual)</TableHead>
          <TableHead className="w-1/5 text-center">CPA (Bizplan)</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.week}>
            <TableCell className="text-left p-1">Week {row.week}</TableCell>
            <TableCell className="text-center p-1">
              {formatNum(row.appts_ocd_actual)}
            </TableCell>
            <TableCell className="text-center p-1">
              {formatNum(row.appts_ocd_bizplan)}
            </TableCell>
            <TableCell className="text-center p-1">
              {formatNum(row.cpa_actual)}
            </TableCell>
            <TableCell className="text-center p-1">
              {formatNum(row.cpa_bizplan)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
