import { useState } from "react";
import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lever } from "@/hooks/usePartnerData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Trash2, Pencil, Plus } from "lucide-react";

interface LeversTableProps {
  levers: Lever[];
  partnerId: string;
  weekNumber: number;
  title: string;
  onUpdate: () => void;
  /** optional: text to highlight in title/cells (case-insensitive) */
  highlightQuery?: string;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const highlight = (
  text: string | number | null | undefined,
  query?: string
): ReactNode => {
  const str = (text ?? "").toString();
  const q = (query ?? "").trim();
  if (!q) return str;

  const re = new RegExp(`(${escapeRegExp(q)})`, "ig");
  const parts = str.split(re); // captured groups are kept

  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="bg-yellow-200/60 text-foreground rounded px-0.5">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    )
  );
};

export const LeversTable = ({
  levers,
  partnerId,
  weekNumber,
  onUpdate,
  title,
  highlightQuery,
}: LeversTableProps) => {
  const [editingLevers, setEditingLevers] = useState<Record<string, Lever>>({});
  const [newLever, setNewLever] = useState({
    description: "",
    impactInput: "",
    confidenceInput: "",
    netImpact: 0,
  });

  const { toast } = useToast();

  const weekLevers = levers.filter((l) => l.week_number === weekNumber);

  const calculateNetImpact = (impact: number, confidence: number) => {
    return Math.round((impact * confidence) / 100);
  };

  const totalImpact = weekLevers.reduce((sum, lever) => sum + lever.impact, 0);

  const handleEdit = (lever: Lever) => {
    setEditingLevers((prev) => ({
      ...prev,
      [lever.id]: { ...lever },
    }));
  };

  const handleSave = async (leverId: string) => {
    const editedLever = editingLevers[leverId];
    if (!editedLever) return;

    const { error } = await supabase
      .from("levers")
      .update({
        description: editedLever.description,
        impact: editedLever.impact,
        confidence: editedLever.confidence,
        net_impact: editedLever.net_impact,
      })
      .eq("id", leverId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update lever",
        variant: "destructive",
      });
      return;
    }

    setEditingLevers((prev) => {
      const newState = { ...prev };
      delete newState[leverId];
      return newState;
    });

    onUpdate();
    toast({
      title: "Success",
      description: "Lever updated successfully",
    });
  };

  const handleCancel = (leverId: string) => {
    setEditingLevers((prev) => {
      const newState = { ...prev };
      delete newState[leverId];
      return newState;
    });
  };

  const handleAddLever = async () => {
    if (!newLever.description.trim()) return;

    const impact = parseFloat(newLever.impactInput) || 0;
    const confidence = parseFloat(newLever.confidenceInput) || 0;
    const netImpact = Math.round((impact * confidence) / 100);

    const { error } = await supabase.from("levers").insert({
      week_number: weekNumber,
      partner_id: partnerId,
      description: newLever.description,
      impact,
      confidence,
      net_impact: netImpact,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add lever",
        variant: "destructive",
      });
    } else {
      setNewLever({
        description: "",
        impactInput: "",
        confidenceInput: "",
        netImpact: 0,
      });
      onUpdate();
      toast({ title: "Success", description: "Lever added successfully" });
    }
  };

  const handleDelete = async (leverId: string) => {
    const { error } = await supabase.from("levers").delete().eq("id", leverId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete lever",
        variant: "destructive",
      });
      return;
    }

    onUpdate();
  };

  return (
    <div className="bg-card rounded-lg pr-6 pl-6 pt-2">
      <h3 className="text-lg font-semibold mb-4 text-foreground">
        {highlight(title, highlightQuery)}
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-2 text-sm text-muted-foreground font-medium">
                Lever
              </th>
              <th className="text-center py-2 px-2 text-sm text-muted-foreground font-medium">
                Impact
              </th>
              <th className="text-center py-2 px-2 text-sm text-muted-foreground font-medium">
                Confidence
              </th>
              <th className="text-center py-2 px-2 text-sm text-muted-foreground font-medium">
                Net Impact
              </th>
              <th className="text-center py-2 px-2 text-sm text-muted-foreground font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {weekLevers.map((lever) => (
              <tr key={lever.id} className="border-b">
                <td className="py-2 px-2">
                  {editingLevers[lever.id] ? (
                    <Input
                      value={editingLevers[lever.id].description}
                      onChange={(e) =>
                        setEditingLevers((prev) => ({
                          ...prev,
                          [lever.id]: {
                            ...prev[lever.id],
                            description: e.target.value,
                          },
                        }))
                      }
                      className="w-full"
                    />
                  ) : (
                    <span className="text-foreground text-sm">
                      {highlight(lever.description, highlightQuery)}
                    </span>
                  )}
                </td>

                <td className="py-2 px-2 text-center placeholder:text-center">
                  {editingLevers[lever.id] ? (
                    <Input
                      type="number"
                      value={editingLevers[lever.id].impact}
                      onChange={(e) => {
                        const impact = Number(e.target.value);
                        const confidence = editingLevers[lever.id].confidence;
                        const netImpact = calculateNetImpact(
                          impact,
                          confidence
                        );
                        setEditingLevers((prev) => ({
                          ...prev,
                          [lever.id]: {
                            ...prev[lever.id],
                            impact,
                            net_impact: netImpact,
                          },
                        }));
                      }}
                      className="w-20 mx-auto"
                    />
                  ) : (
                    <span className="text-foreground text-sm">
                      {highlight(lever.impact, highlightQuery)}
                    </span>
                  )}
                </td>

                <td className="py-2 px-2 text-center placeholder:text-center">
                  {editingLevers[lever.id] ? (
                    <Input
                      type="number"
                      value={editingLevers[lever.id].confidence}
                      onChange={(e) => {
                        const confidence = Number(e.target.value);
                        const impact = editingLevers[lever.id].impact;
                        const netImpact = calculateNetImpact(
                          impact,
                          confidence
                        );
                        setEditingLevers((prev) => ({
                          ...prev,
                          [lever.id]: {
                            ...prev[lever.id],
                            confidence,
                            net_impact: netImpact,
                          },
                        }));
                      }}
                      className="w-20 mx-auto"
                    />
                  ) : (
                    <span className="text-foreground text-sm">
                      {highlight(`${lever.confidence}%`, highlightQuery)}
                    </span>
                  )}
                </td>

                <td className="py-2 px-2 text-center">
                  {editingLevers[lever.id] ? (
                    <Input
                      type="number"
                      value={editingLevers[lever.id].net_impact || 0}
                      onChange={(e) =>
                        setEditingLevers((prev) => ({
                          ...prev,
                          [lever.id]: {
                            ...prev[lever.id],
                            net_impact: Number(e.target.value),
                          },
                        }))
                      }
                      className="w-20 mx-auto"
                    />
                  ) : (
                    <span className="text-foreground">
                      {highlight(lever.net_impact || 0, highlightQuery)}
                    </span>
                  )}
                </td>

                <td className="py-2 px-2 text-center">
                  {editingLevers[lever.id] ? (
                    <div className="flex gap-1 justify-center">
                      <Button
                        size="sm"
                        onClick={() => handleSave(lever.id)}
                        className="h-8 px-2"
                      >
                        <span className="text-sm">Save</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(lever.id)}
                        className="h-8 px-2"
                      >
                        <span className="text-sm">Cancel</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex justify-center gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleEdit(lever)}
                        className="h-8 px-2"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(lever.id)}
                        className="h-8 px-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}

            {/* Add new lever row */}
            <tr className="border-b">
              <td className="py-2 px-2">
                <Input
                  placeholder="Add new lever..."
                  value={newLever.description}
                  onChange={(e) =>
                    setNewLever((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="flex text-left placeholder:left"
                />
              </td>
              <td className="py-2 px-2">
                <Input
                  type="none"
                  placeholder="0"
                  value={newLever.impactInput}
                  onChange={(e) =>
                    setNewLever((prev) => {
                      const impactStr = e.target.value;
                      const impactNum = parseFloat(impactStr) || 0;
                      const confNum = parseFloat(prev.confidenceInput) || 0;
                      return {
                        ...prev,
                        impactInput: impactStr,
                        netImpact: Math.round((impactNum * confNum) / 100),
                      };
                    })
                  }
                  className="w-14 mx-auto text-center hover:bg-gray-100 focus:bg-gray-100"
                />
              </td>
              <td className="py-2 px-2 text-center">
                <Input
                  type="none"
                  placeholder="0"
                  value={newLever.confidenceInput}
                  onChange={(e) =>
                    setNewLever((prev) => {
                      const confStr = e.target.value;
                      const confNum = parseFloat(confStr) || 0;
                      const impNum = parseFloat(prev.impactInput) || 0;
                      return {
                        ...prev,
                        confidenceInput: confStr,
                        netImpact: Math.round((impNum * confNum) / 100),
                      };
                    })
                  }
                  className="w-14 mx-auto text-center hover:bg-gray-100 focus:bg-gray-100"
                />
              </td>
              <td className="py-2 px-2 text-center">
                <Input
                  type="none"
                  value={newLever.netImpact}
                  onChange={(e) =>
                    setNewLever((prev) => ({
                      ...prev,
                      netImpact: Number(e.target.value), // fixed key
                    }))
                  }
                  className="w-14 mx-auto justify-center text-center"
                />
              </td>
              <td className="py-2 px-2 text-center">
                <Button
                  size="sm"
                  onClick={handleAddLever}
                  disabled={!newLever.description.trim()}
                  className="h-8 px-2"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </td>
            </tr>

            {/* Total row */}
            <tr className="border-t-2 border-primary/20 bg-muted/30">
              <td className="py-2 px-2 font-semibold text-sm text-foreground">
                Total
              </td>
              <td className="py-2 px-2 text-center font-semibold text-sm text-foreground">
                {totalImpact}
              </td>
              <td className="py-2 px-2 text-center">-</td>
              <td className="py-2 px-2 text-center font-semibold text-sm text-foreground">
                {weekLevers.reduce(
                  (sum, lever) => sum + (lever.net_impact || 0),
                  0
                )}
              </td>
              <td className="py-2 px-2 text-center">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
