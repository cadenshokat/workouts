import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { WeeklyMetrics } from "@/hooks/useData";
import { useAuth } from "@/hooks/useAuth"
import {cn} from "@/lib/utils"

interface MetricTableProps {
  data: WeeklyMetrics[];
  currentWeek: number;
  onCellUpdate: (
    id: string,
    column: keyof Omit<WeeklyMetrics, "id"|"partner"|"week_num"|"year_num">,
    value: number
  ) => Promise<void>;
}

type CellKey = keyof Omit<WeeklyMetrics, "id"|"partner"|"week_num"|"year_num">;

export const MetricTable: React.FC<MetricTableProps> = ({ data, currentWeek, onCellUpdate }) => {
  const [editing, setEditing] = useState<{ week: number; key: CellKey }|null>(null);
  const [draft, setDraft] = useState<number|string>("");
  const { role } = useAuth();                        
  const canEdit = role === "elevated";

  const rows = [];
  for (let i = currentWeek - 10; i <= currentWeek; i++) {
    const w = data.find(d => d.week_num === i);
    rows.push({
      id: w?.id ?? "", week: i,
      appts_lcd_actual: w?.appts_lcd_actual ?? null,
      appts_lcd_bizplan: w?.appts_lcd_bizplan ?? null,
      cpl_actual: w?.cpl_actual ?? null,
      cpl_bizplan: w?.cpl_bizplan ?? null,
      cpa_actual: w?.cpa_actual ?? null,
      cpa_bizplan: w?.cpa_bizplan ?? null,
    });
  }


  const formatNum = (n: number|null) => n == null ? "–" : n.toLocaleString("en-US");

  const startEdit = (week: number, key: CellKey, value: number|null) => {
    if (!canEdit) return;
    setEditing({ week, key });
    setDraft(value != null ? value : "");
  };

  const finishEdit = async (row: typeof rows[0]) => {
    if (editing && canEdit) {
      const { week, key } = editing;
      const parsed = Number(draft);
      if (!isNaN(parsed)) {
        await onCellUpdate(row.id, key, parsed);
      }
    }
    setEditing(null);
    setDraft("");
  };

  const columns: Array<{ label: string; key: CellKey }> = [
    { label: "Appts LCD (actual)", key: "appts_lcd_actual" },
    { label: "Appts LCD (bizplan)", key: "appts_lcd_bizplan" },
    { label: "CPL (actual)",        key: "cpl_actual" },
    { label: "CPL (bizplan)",       key: "cpl_bizplan" },
    { label: "CPA (actual)",        key: "cpa_actual" },
    { label: "CPA (bizplan)",       key: "cpa_bizplan" },
  ];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-1/7 text-left">Week</TableHead>
          {columns.map(c => (
            <TableHead key={c.key} className="w-1/7 text-center">{c.label}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(row => (
          <TableRow key={row.week}>
            <TableCell className="text-left p-1">Week {row.week}</TableCell>
            {columns.map(col => {
              const isEditing = editing?.week === row.week && editing.key === col.key;
              const value = (row as any)[col.key] as number|null;
              return (
                <TableCell
                  key={col.key}
                  className="text-center cursor-pointer p-1 hover:bg-gray-100"
                  onClick={() => startEdit(row.week, col.key, value)}
                > 
                  {isEditing ? (
                    <input
                      type="none"
                      className={cn(
                        "w-8 text-center rounded-sm focus-visible:outline-none",
                        canEdit && "w-10 text-center rounded-sm cursor-pointer bg-gray-200"
                      )}
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      onBlur={() => finishEdit(row)}
                      onKeyDown={e => e.key === "Enter" && finishEdit(row)}
                      autoFocus
                    />
                  ) : (
                    formatNum(value)
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

