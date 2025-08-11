// src/pages/SettingsPage.tsx

import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card, CardHeader, CardTitle, CardContent
} from "@/components/ui/card";
import {
  Table, TableHeader, TableBody, TableRow,
  TableHead, TableCell
} from "@/components/ui/table";
import { X, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface Manager {
  id: string;
  name: string;
  color: string | null;
}

interface Partner {
  id: string;
  name: string;
  active: boolean;
}

interface PMLink {
  partner: string;
  manager: string;
}

interface PartnerSettings {
  id: string;
  name: string;
  active: boolean;
  assignedManagers: string[];
}

export function Settings() {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [partners, setPartners]   = useState<PartnerSettings[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string|null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data: mData, error: mErr } = 
          await supabase.from("managers").select("id,name,color");
        if (mErr) throw mErr;

        const { data: pData, error: pErr } =
          await supabase
            .from("partners")
            .select("id,name,active")
            .order("name", { ascending: true });
        if (pErr) throw pErr;

        const { data: pmData, error: pmErr } =
          await supabase.from("partner_managers").select("partner,manager");
        if (pmErr) throw pmErr;

        const settings: PartnerSettings[] = (pData || []).map(p => ({
          id: p.id,
          name: p.name,
          active: p.active,
          assignedManagers: (pmData || [])
            .filter(link => link.partner === p.id)
            .map(link => link.manager),
        }));

        setManagers(mData || []);
        setPartners(settings);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div>Loading settings…</div>;
  if (error)   return <div className="text-red-600">Error: {error}</div>;

  const toggleActive = async (partnerId: string, newVal: boolean) => {
    setPartners(ps =>
      ps.map(p => p.id === partnerId ? { ...p, active: newVal } : p)
    );
    const { error } = await supabase
      .from("partners")
      .update({ active: newVal })
      .eq("id", partnerId);
    if (error) console.error("Failed to update active flag:", error);
  };

  const handleManagerSelect = async (partnerId: string, newManagers: string[]) => {
      setPartners(ps =>
        ps.map(p =>
          p.id !== partnerId
            ? p
            : { ...p, assignedManagers: newManagers }
        )
      );

      // find old vs. new
      const oldManagers = partners.find(p => p.id === partnerId)?.assignedManagers || [];
      const toAdd    = newManagers.filter(id => !oldManagers.includes(id));
      const toRemove = oldManagers.filter(id => !newManagers.includes(id));

      // remove links
      await Promise.all(toRemove.map(managerId =>
        supabase
          .from("partner_managers")
          .delete()
          .match({ partner: partnerId, manager: managerId })
          .then(({ error }) => error && console.error("Remove link error:", error))
      ));

      // add links
      await Promise.all(toAdd.map(managerId =>
        supabase
          .from("partner_managers")
          .insert({ partner: partnerId, manager: managerId })
          .then(({ error }) => error && console.error("Insert link error:", error))
      ));
    };

    const toggleManager = async (
    partnerId: string,
    managerId: string,
    currentlyAssigned: boolean
  ) => {
    setPartners(ps =>
      ps.map(p => {
        if (p.id !== partnerId) return p;
        const assigned = new Set(p.assignedManagers);
        if (currentlyAssigned) assigned.delete(managerId);
        else assigned.add(managerId);
        return { ...p, assignedManagers: Array.from(assigned) };
      })
    );

    if (currentlyAssigned) {
      const { error } = await supabase
        .from("partner_managers")
        .delete()
        .match({ partner: partnerId, manager: managerId });
      if (error) console.error("Remove link error:", error);
    } else {
      const { error } = await supabase
        .from("partner_managers")
        .insert({ partner: partnerId, manager: managerId });
      if (error) console.error("Insert link error:", error);
    }
  };

  // -- Render

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>

      <Card className="overflow-auto shadow-md">
        <CardHeader>
          <CardTitle className="text-lg">Partner &amp; Manager Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="text-sm">
                <TableHead>Partner</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Managers</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partners.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm">{p.name}</TableCell>
                  <TableCell>
                    <Switch
                      checked={p.active}
                      onCheckedChange={val => toggleActive(p.id, val)}
                    />
                  </TableCell>
                  <TableCell className="flex flex-wrap gap-2">
                    <div className="flex flex-wrap items-center">
                      {p.assignedManagers.map(managerId => {
                        const mgr = managers.find(m => m.id === managerId);
                        if (!mgr) return null;
                        return (
                          <Badge
                        key={mgr.id}
                        variant="default"
                        className="group flex items-center gap-1"
                        style={{ backgroundColor: mgr.color || undefined }}
                      >
                        {mgr.name}
                        <X
                          className="
                            h-3 w-3 
                            text-gray-400
                            opacity-0 group-hover:opacity-100 
                            transition-opacity duration-150
                            cursor-pointer
                          "
                          onClick={() => toggleManager(p.id, mgr.id, true)}
                        />
                      </Badge>
                        );
                      })}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-6 w-4">
                            <Plus className="h-1 w-1 text-gray-600"/>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {managers
                            .filter(m => !p.assignedManagers.includes(m.id))
                            .map(m => (
                              <DropdownMenuItem
                                key={m.id}
                                onSelect={() => toggleManager(p.id, m.id, false)}
                              >
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
    </div>
  );
}
