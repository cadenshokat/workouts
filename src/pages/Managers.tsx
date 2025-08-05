// src/pages/Managers.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Edit2, X } from "lucide-react";
import { useAllPartners } from "@/hooks/useAllPartners";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ManagerWithPartners {
  id: string;
  name: string;
  color: string;
  partners: Array<{ id: string; name: string }>;
}

export const Managers: React.FC = () => {
  // 1. Local state
  const [managersData, setManagersData] = useState<ManagerWithPartners[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);
  const [removeSet, setRemoveSet] = useState<Set<string>>(new Set());
  const [addManagerId, setAddManagerId] = useState<string>("");

  // 2. External hooks
  const { data: allPartners = [] } = useAllPartners();
  const { toast } = useToast();

  // 3. Fetch managers + relationships on mount
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const { data: mgrs, error: mgrErr } = await supabase
          .from("managers")
          .select("*")
          .order("name", { ascending: true });
        if (mgrErr) throw mgrErr;

        const { data: rels, error: relErr } = await supabase
          .from("partner_managers")
          .select(`manager, partners!inner(id, name)`);
        if (relErr) throw relErr;

        const result = mgrs.map((mgr) => ({
          id: mgr.id,
          name: mgr.name,
          color: mgr.color,
          partners: rels
            .filter((r) => r.manager === mgr.id)
            .map((r) => ({ id: r.partners.id, name: r.partners.name })),
        }));
        if (!cancel) setManagersData(result);
      } catch (e: any) {
        if (!cancel) setError(e.message);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true };
  }, []);

  // 4. Group by partner (always called, even on loading)
  const partnerGroups = useMemo(() => {
    const map = new Map<
      string,
      { partnerName: string; managers: { id: string; name: string; color: string }[] }
    >();
    managersData.forEach((mgr) => {
      mgr.partners.forEach((p) => {
        if (!map.has(p.id)) {
          map.set(p.id, { partnerName: p.name, managers: [] });
        }
        map.get(p.id)!.managers.push({ id: mgr.id, name: mgr.name, color: mgr.color });
      });
    });
    return Array.from(map.entries())
      .map(([partnerId, { partnerName, managers }]) => ({
        partnerId,
        partnerName,
        managers,
      }))
      .sort((a, b) => a.partnerName.localeCompare(b.partnerName));
  }, [managersData]);

  const totalAssignments = useMemo(
    () => partnerGroups.reduce((sum, g) => sum + g.managers.length, 0),
    [partnerGroups]
  );

  // 5. Early returns (after all hooks & memos)
  if (loading) {
    return (
      <div className="p-6 animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-1/4" />
        <div className="h-40 bg-muted rounded" />
      </div>
    );
  }
  if (error) {
    return <div className="p-6 text-destructive">Error: {error}</div>;
  }

  // 6. Save/remove logic
  const handleSave = async (partnerId: string) => {
    try {
      for (let mgrId of removeSet) {
        const { error } = await supabase
          .from("partner_managers")
          .delete()
          .eq("partner", partnerId)
          .eq("manager", mgrId);
        if (error) throw error;
      }
      if (addManagerId) {
        const { error } = await supabase
          .from("partner_managers")
          .insert({ partner: partnerId, manager: addManagerId });
        if (error) throw error;
      }

      toast({ title: "Success", description: "Assignments updated." });
      setEditingPartnerId(null);
      setRemoveSet(new Set());
      setAddManagerId("");
      // re-fetch
      const { data: mgrs, error: mgrErr } = await supabase
        .from("managers")
        .select("*")
        .order("name", { ascending: true });
      const { data: rels } = await supabase
        .from("partner_managers")
        .select(`manager, partners!inner(id, name)`);
      setManagersData(
        mgrs!.map((mgr) => ({
          id: mgr.id,
          name: mgr.name,
          color: mgr.color,
          partners: rels!
            .filter((r) => r.manager === mgr.id)
            .map((r) => ({ id: r.partners.id, name: r.partners.name })),
        }))
      );
    } catch {
      toast({ title: "Error", description: "Update failed.", variant: "destructive" });
    }
  };

  // 7. Render
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Managers</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allPartners.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssignments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Partner–Manager Table */}
      <Card>
        <CardHeader>
          <CardTitle>Partner–Manager Assignments</CardTitle>
          <CardDescription>Manage assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Managers</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partnerGroups.map(({ partnerId, partnerName, managers }) => {
                const isEditing = editingPartnerId === partnerId;
                return (
                  <TableRow key={partnerId}>
                    <TableCell className="font-medium">{partnerName}</TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex flex-wrap gap-2">
                          {managers.map((m) => (
                            <Badge
                              key={m.id}
                              variant={removeSet.has(m.id) ? "destructive" : "secondary"}
                              className="flex items-center space-x-1"
                            >
                              <span>{m.name}</span>
                              <X
                                className="h-4 w-4 cursor-pointer"
                                onClick={() => {
                                  const newSet = new Set(removeSet);
                                  newSet.has(m.id) ? newSet.delete(m.id) : newSet.add(m.id);
                                  setRemoveSet(newSet);
                                }}
                              />
                            </Badge>
                          ))}
                          <Select
                            value={addManagerId}
                            onValueChange={setAddManagerId}
                          >
                            <SelectTrigger className="w-[160px]">
                              <SelectValue placeholder="Add manager" />
                            </SelectTrigger>
                            <SelectContent>
                              {managersData
                                .filter((m) => !managers.some((pm) => pm.id === m.id))
                                .map((m) => (
                                  <SelectItem key={m.id} value={m.id}>
                                    {m.name}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {managers.map((m) => (
                            <Badge
                              key={m.id}
                              variant="secondary"
                              style={{ backgroundColor: m.color }}
                            >
                              {m.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSave(partnerId)}
                            disabled={removeSet.size === 0 && !addManagerId}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPartnerId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingPartnerId(partnerId)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {partnerGroups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No assignments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
