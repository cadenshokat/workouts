import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PartnerManagerAssignments } from "@/components/PartnerManagers";
import { Managers } from "@/components/Managers"
import { PartnersAdmin } from "@/components/PartnersAdmin"

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

type SectionKey = "general" | "assignments" | "managers" | "partners";

const sections: { key: SectionKey; label: string }[] = [
  { key: "general",     label: "General" },
  { key: "assignments", label: "Manager Assignments" },
  { key: "managers", label: "Managers" },
  { key: "partners", label: "Partners" }
];

export function SettingsDialog({ open, onOpenChange }: Props) {
  const [active, setActive] = React.useState<SectionKey>("assignments");

  React.useEffect(() => {
    if (open) return;
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-[960px] w-full p-0 overflow-hidden",
          "rounded-2xl border border-gray-200"
        )}
        aria-describedby={undefined}
      >
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg">Settings</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-[220px_1fr] gap-0 h-[70vh]">
          <aside className="border-r border-gray-200 px-2 py-2 overflow-y-auto">
            <div className="px-2 pb-2 text-[11px] uppercase tracking-wide text-gray-500">
              Workspace
            </div>
            <nav className="flex flex-col">
              {sections.map((s) => (
                <Button
                  key={s.key}
                  variant={active === s.key ? "secondary" : "ghost"}
                  className={cn(
                    "justify-start h-8 rounded-lg mx-1 mb-1 text-sm",
                    active === s.key ? "font-medium" : "text-gray-600"
                  )}
                  onClick={() => setActive(s.key)}
                >
                  {s.label}
                </Button>
              ))}
            </nav>
          </aside>

          <section className="overflow-y-auto">
            {active === "general" && (
              <div className="p-6 space-y-4">
                <div className="text-sm text-gray-600">
                  Add general workspace fields here (name, icon, allowed domains, etc.).
                </div>
              </div>
            )}

            {active === "assignments" && (
              <div className="p-6 space-y-4">
                <h1 className="text-md font-medium mb-4">Partner Manager Assignments</h1>
                <PartnerManagerAssignments />
              </div>
            )}

            {active === "managers" && (
              <div className="p-6">
                <Managers />
              </div>
            )}

            {active === "partners" && (
              <div className="p-6 space-y-4">
                <PartnersAdmin />
              </div>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
