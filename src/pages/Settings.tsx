import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, X } from "lucide-react";

interface Manager { id: string; name: string; color: string | null }
interface Partner { id: string; name: string; active: boolean }
interface PartnerSettings {
  id: string;
  name: string;
  active: boolean;
  assignedManagers: string[];
}

export function PartnerManagerAssignments() {
  const [managers, setManagers]   = useState<Manager[]>([]);
  const [partners, setPartners]   = useState<PartnerSettings[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data: mData, error: mErr } = await supabase.from("managers").select("id,name,color");
        if (mErr) throw mErr;

        const { data: pData, error: pErr } = await supabase
          .from("partners")
          .select("id,name,active")
          .order("name", { ascending: true });
        if (pErr) throw pErr;

        const { data: pmData, error: pmErr } = await supabase
          .from("partner_managers")
          .select("partner,manager");
        if (pmErr) throw pmErr;

        const settings: PartnerSettings[] = (pData || []).map((p) => ({
          id: p.id,
          name: p.name,
          active: p.active,
          assignedManagers: (pmData || [])
            .filter((link) => link.partner === p.id)
            .map((link) => link.manager),
        }));

        setManagers(mData || []);
        setPartners(settings);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-sm text-gray-500">Loading settings…</div>;
  if (error)   return <div className="text-sm text-red-600">Error: {error}</div>;

  const toggleActive = async (partnerId: string, next: boolean) => {
    setPartners((arr) => arr.map((p) => (p.id === partnerId ? { ...p, active: next } : p)));
    const { error } = await supabase.from("partners").update({ active: next }).eq("id", partnerId);
    if (error) console.error("Failed to update active:", error);
  };

  const toggleManager = async (partnerId: string, managerId: string, currentlyAssigned: boolean) => {
    setPartners((arr) =>
      arr.map((p) => {
        if (p.id !== partnerId) return p;
        const set = new Set(p.assignedManagers);
        currentlyAssigned ? set.delete(managerId) : set.add(managerId);
        return { ...p, assignedManagers: Array.from(set) };
      })
    );

    if (currentlyAssigned) {
      const { error } = await supabase.from("partner_managers").delete().match({ partner: partnerId, manager: managerId });
      if (error) console.error("Remove link error:", error);
    } else {
      const { error } = await supabase.from("partner_managers").insert({ partner: partnerId, manager: managerId });
      if (error) console.error("Insert link error:", error);
    }
  };

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Partner &amp; Manager Assignments</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="text-sm">
              <TableHead className="w-[40%]">Partner</TableHead>
              <TableHead className="w-[10%]">Active</TableHead>
              <TableHead>Managers</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {partners.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="text-sm">{p.name}</TableCell>
                <TableCell>
                  <Switch checked={p.active} onCheckedChange={(val) => toggleActive(p.id, val)} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2">
                    {p.assignedManagers.map((managerId) => {
                      const mgr = managers.find((m) => m.id === managerId);
                      if (!mgr) return null;
                      return (
                        <Badge
                          key={mgr.id}
                          variant="secondary"
                          className="group flex items-center gap-1 rounded-md"
                          style={{ backgroundColor: mgr.color || undefined }}
                        >
                          {mgr.name}
                          <X
                            className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => toggleManager(p.id, mgr.id, true)}
                          />
                        </Badge>
                      );
                    })}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Plus className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {managers
                          .filter((m) => !p.assignedManagers.includes(m.id))
                          .map((m) => (
                            <DropdownMenuItem key={m.id} onSelect={() => toggleManager(p.id, m.id, false)}>
                              {m.name}
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
