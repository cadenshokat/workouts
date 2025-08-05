// src/components/WeekFilter.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

interface WeeksFilterProps {
  availableWeeks: number[];
  selectedWeeks: number[];
  onChange: (selected: number[]) => void;
}

export const WeekFilter: React.FC<WeeksFilterProps> = ({
  availableWeeks,
  selectedWeeks,
  onChange,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Filter Weeks
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" className="w-48">
        <DropdownMenuLabel>Show Weeks</DropdownMenuLabel>
        {availableWeeks.map((week) => (
          <DropdownMenuCheckboxItem
            key={week}
            checked={selectedWeeks.includes(week)}
            onCheckedChange={(checked) => {
              if (checked) {
                onChange([...selectedWeeks, week].sort((a, b) => a - b));
              } else {
                onChange(selectedWeeks.filter((w) => w !== week));
              }
            }}
          >
            Week {week}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
