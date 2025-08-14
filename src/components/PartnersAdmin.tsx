// src/pages/PartnersAdmin.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";

type Partner = { id: string; name: string; active: boolean };

export function PartnersAdmin() {
  const [rows, setRows] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("partners")
        .select("id,name,active")
        .order("name", { ascending: true });

      if (!cancelled) {
        if (error) {
          console.error("Failed to load partners:", error);
          setRows([]);
        } else {
          setRows((data || []) as Partner[]);
        }
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleActive = async (id: string, next: boolean) => {
    setTogglingId(id);
    const prev = rows;
    setRows(prev.map(p => (p.id === id ? { ...p, active: next } : p)));

    const { error } = await supabase.from("partners").update({ active: next }).eq("id", id);
    if (error) {
      console.error("Failed to update partner.active:", error);
      // revert
      setRows(prev);
    }
    setTogglingId(null);
  };

  const deletePartner = async (id: string) => {
    if (!window.confirm("Delete this partner? This removes any manager assignments.")) return;

    setDeletingId(id);
    const prev = rows;
    setRows(prev.filter(p => p.id !== id));

    try {
      const { error: linkErr } = await supabase.from("partner_managers").delete().eq("partner", id);
      if (linkErr) throw linkErr;

      const { error } = await supabase.from("partners").delete().eq("id", id);
      if (error) throw error;
    } catch (e) {
      console.error("Delete failed:", e);
      setRows(prev);
      alert("Couldn't delete partner. Check console for details.");
    } finally {
      setDeletingId(null);
    }
  };

  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [addErr, setAddErr] = useState<string | null>(null);

  const resetAdd = () => {
    setNewName("");
    setAddErr(null);
    setAddOpen(false);
  };

  const addPartner = async () => {
    const name = newName.trim();
    if (!name) {
      setAddErr("Please enter a partner name.");
      return;
    }
    const exists = rows.some(r => r.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      setAddErr("A partner with this name already exists.");
      return;
    }

    setAdding(true);
    try {
      const { data, error } = await supabase
        .from("partners")
        .insert({ name, active: true })
        .select("id,name,active")
        .single();

      if (error) throw error;

      setRows(prev => {
        const next = [...prev, data as Partner];
        next.sort((a, b) => a.name.localeCompare(b.name));
        return next;
      });

      resetAdd();
    } catch (e: any) {
      console.error("Failed to add partner:", e);
      setAddErr(e?.message ?? "Failed to add partner.");
    } finally {
      setAdding(false);
    }
  };


  return (
    <div className="overflow-hidden shadow-sm">
       <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold">Partners</h2>
        <Button size="sm" onClick={() => setAddOpen(true)} style={{background: "#404040", color: "white"}}>
          <Plus className="h-4 w-4 mr-1" /> Add Partner
        </Button>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add partner</DialogTitle>
            <DialogDescription>
              Create a new partner. It will be enabled by default.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input
              autoFocus
              placeholder="e.g. Taboola"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addPartner();
              }}
            />
            {addErr && <p className="text-sm text-red-600">{addErr}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={resetAdd} disabled={adding}>
              Cancel
            </Button>
            <Button onClick={addPartner} disabled={adding}>
              {adding ? "Adding…" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow className="text-sm">
            <TableHead className="w-[60%]">Partner</TableHead>
            <TableHead className="w-[20%]">Active</TableHead>
            <TableHead className="w-[20%]">Delete</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={3} className="text-sm text-muted-foreground">
                Loading partners…
              </TableCell>
            </TableRow>
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-sm text-muted-foreground">
                No partners found.
              </TableCell>
            </TableRow>
          ) : (
            rows.map(row => (
              <TableRow key={row.id}>
                <TableCell className="text-sm">{row.name}</TableCell>
                <TableCell>
                  <Switch
                    checked={row.active}
                    onCheckedChange={v => toggleActive(row.id, v)}
                    disabled={togglingId === row.id}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    title="Delete partner"
                    onClick={() => deletePartner(row.id)}
                    disabled={deletingId === row.id}
                    className="text-gray-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
