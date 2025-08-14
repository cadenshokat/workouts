import React, { useEffect, useState } from "react";
import { useManagers } from "@/hooks/useManagers";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client"
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react"
import { ColorPickerCell } from "@/components/ColorPicker"
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";

type Manager = {id: string, name: string, color: string | null }

export function Managers() {
    const { data } = useManagers()
    const [rows, setRows] = useState<Manager[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (data?.length) setRows(data as Manager[]);
    }, [data]);

    const setColorOptimistic = (id: string, color: string | null) => {
        setRows((prev) => prev.map((m) => (m.id === id ? { ...m, color } : m)));
    };

    const updateColor = async (id: string, color: string | null) => {
        const prev = rows.find((r) => r.id === id)?.color ?? null;
        setColorOptimistic(id, color);
        const { error } = await supabase.from("managers").update({ color }).eq("id", id);
        if (error) {
        console.error("Failed to update color:", error);
        setColorOptimistic(id, prev);
        }
    };


    const deleteManager = async (id: string) => {
        if (!window.confirm("Delete this manager? This will remove their partner assignments.")) return;
        setDeletingId(id);
        const prevRows = rows;
        setRows((r) => r.filter((m) => m.id !== id));

        try{
            const { error: linkErr } = await supabase
                .from("partner_managers")
                .delete()
                .eq("manager", id);
            if (linkErr) throw linkErr;

            const { error } = await supabase.from('managers').delete().match({id})
            if (error) console.error('Could not find manager')
        } catch (e) {
            console.error("Delete failed", e)
            setRows(prevRows)
        } finally {
            setDeletingId(null)
        }
    }

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
          setAddErr("Please enter a manager name.");
          return;
        }
        const exists = rows.some(r => r.name.toLowerCase() === name.toLowerCase());
        if (exists) {
          setAddErr("A manager with this name already exists.");
          return;
        }
    
        setAdding(true);
        try {
          const { data, error } = await supabase
            .from("managers")
            .insert({ name })
            .select("id,name")
            .single();
    
          if (error) throw error;
    
          setRows(prev => {
            const next = [...prev, data as Manager];
            next.sort((a, b) => a.name.localeCompare(b.name));
            return next;
          });
    
          resetAdd();
        } catch (e: any) {
          console.error("Failed to add manager:", e);
          setAddErr(e?.message ?? "Failed to add manager.");
        } finally {
          setAdding(false);
        }
      };

    return (
        <div className="overflow-hidden shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold">Managers</h2>
                <Button size="sm" onClick={() => setAddOpen(true)} style={{background: "#404040", color: "white"}}>
                <Plus className="h-4 w-4 mr-1" /> Add Manager
                </Button>
            </div>

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Manager</DialogTitle>
                    <DialogDescription>
                    Create a new manager. It will be enabled by default.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                    autoFocus
                    placeholder="e.g. Dave"
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
                        <TableHead>Name</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Delete</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => {
                        return (
                            <TableRow key={row.id}>
                                <TableCell className="text-sm">{row.name}</TableCell>
                                <TableCell>
                                    <ColorPickerCell value={row.color} onChange={(hex) => updateColor(row.id, hex)} />
                                </TableCell>
                                <TableCell>
                                    <Button 
                                    variant="ghost" 
                                    title="delete manager" 
                                    onClick={() => deleteManager(row.id)}
                                    disabled={deletingId === row.id}
                                    className="text-gray-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-6 w-6" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )

}