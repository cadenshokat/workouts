// src/components/settings/PartnerManagerAssignments.tsx

import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePartnerManagers } from "@/hooks/usePartnerManagers";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { Plus, X } from "lucide-react";

type Manager = { id: string; name: string; color: string | null };
type Partner = { id: string; name: string; active: boolean };

type PartnerRow = {
  id: string;
  name: string;
  active: boolean;
  assignedManagers: string[]; 
};

export function PartnerManagerAssignments() {
  const { data: pmRows, isLoading: pmLoading, error: pmError } = usePartnerManagers();

  const [partners, setPartners] = useState<Partner[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingLists(true);
      try {
        const [{ data: pData, error: pErr }, { data: mData, error: mErr }] = await Promise.all([
          supabase.from("partners").select("id,name,active").order("name", { ascending: true }),
          supabase.from("managers").select("id,name,color").order("name", { ascending: true }),
        ]);
        if (pErr) throw pErr;
        if (mErr) throw mErr;
        if (!cancelled) {
          setPartners(pData || []);
          setManagers(mData || []);
        }
      } catch (e: any) {
        if (!cancelled) setListError(e.message);
      } finally {
        if (!cancelled) setLoadingLists(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const rows: PartnerRow[] = useMemo(() => {
    const byPartner = new Map<string, string[]>();
    for (const r of pmRows || []) {
      if (!byPartner.has(r.partner)) byPartner.set(r.partner, []);
      byPartner.get(r.partner)!.push(r.manager);
    }
    return partners.map((p) => ({
      id: p.id,
      name: p.name,
      active: p.active,
      assignedManagers: byPartner.get(p.id) || [],
    }));
  }, [partners, pmRows]);

  const setRow = (partnerId: string, patch: Partial<PartnerRow>) => {
    setPartners((cur) =>
      cur.map((p) => (p.id === partnerId ? { ...p, ...(patch.active !== undefined ? { active: patch.active } : {}) } : p))
    );
  };

  const toggleActive = async (partnerId: string, next: boolean) => {
    setRow(partnerId, { active: next }); // optimistic
    const { error } = await supabase.from("partners").update({ active: next }).eq("id", partnerId);
    if (error) console.error("Failed to update partner.active:", error);
  };

  const toggleManager = async (partnerId: string, managerId: string, currentlyAssigned: boolean) => {
    const optimistic = (pmRows || []).slice();
    if (currentlyAssigned) {
      const idx = optimistic.findIndex((r) => r.partner === partnerId && r.manager === managerId);
      if (idx >= 0) optimistic.splice(idx, 1);
    } else {
      optimistic.push({
        partner: partnerId,
        manager: managerId,
        partner_name: "",
        manager_name: "",
        manager_color: "",
      });
    }

    if (currentlyAssigned) {
      const { error } = await supabase.from("partner_managers").delete().match({ partner: partnerId, manager: managerId });
      if (error) console.error("Remove link error:", error);
    } else {
      const { error } = await supabase.from("partner_managers").insert({ partner: partnerId, manager: managerId });
      if (error) console.error("Insert link error:", error);
    }

    setPartners((p) => p.slice());
  };

  if (pmLoading || loadingLists) return <div className="text-sm text-gray-500 p-2">Loading…</div>;
  if (pmError || listError) return <div className="text-sm text-red-600 p-2">Error: {(pmError?.message || listError) as string}</div>;

  return (
    <div className="overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="text-sm">
              <TableHead className="w-[40%]">Partner</TableHead>
              <TableHead className="w-[12%]">Active</TableHead>
              <TableHead>Managers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const assigned = new Set(row.assignedManagers);
              const availableManagers = managers.filter((m) => !assigned.has(m.id));
              return (
                <TableRow key={row.id}>
                  <TableCell className="text-sm">{row.name}</TableCell>
                  <TableCell>
                    <Switch checked={row.active} onCheckedChange={(v) => toggleActive(row.id, v)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      {Array.from(assigned).map((mgrId) => {
                        const mgr = managers.find((m) => m.id === mgrId);
                        if (!mgr) return null;
                        return (
                          <Badge
                            key={mgr.id}
                            variant="secondary"
                            className="group flex items-center gap-1 rounded-md"
                            style={{ backgroundColor: mgr.color || undefined }}
                            title={mgr.name}
                          >
                            {mgr.name}
                            <X
                              className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              onClick={() => toggleManager(row.id, mgr.id, true)}
                            />
                          </Badge>
                        );
                      })}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6" title="Add manager">
                            <Plus className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {availableManagers.length === 0 ? (
                            <div className="px-2 py-1 text-xs text-gray-500">No managers to add</div>
                          ) : (
                            availableManagers.map((m) => (
                              <DropdownMenuItem key={m.id} onSelect={() => toggleManager(row.id, m.id, false)}>
                                {m.name}
                              </DropdownMenuItem>
                            ))
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
  );
}
