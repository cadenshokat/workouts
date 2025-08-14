import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";

export function ColorPickerCell({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (hexOrNull: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState<string>(value || "#9ca3af"); 

  useEffect(() => {
    setHex(value || "#9ca3af");
  }, [value]);

  const apply = (v: string | null) => {
    onChange(v);
    if (v) setHex(v);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 px-2 rounded-md border border-gray-200 flex items-center gap-2"
          title="Click to choose a color"
        >
          <span
            className="inline-block h-6 w-6 rounded-md border"
            style={{ backgroundColor: value ?? "#ffffff" }}
          />
          <span className="text-xs text-gray-700">
            {value ?? "Set color"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 space-y-3">
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          className="h-10 w-full cursor-pointer rounded-md border p-0"
        />
        <div className="flex items-center gap-2">
          <Input
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="h-9"
            placeholder="#ffffff"
          />
          <Button size="sm" onClick={() => apply(hex)}>
            Save
          </Button>
          <Button size="sm" variant="ghost" onClick={() => apply(null)}>
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
