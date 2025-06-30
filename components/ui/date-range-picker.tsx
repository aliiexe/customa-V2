"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DateRange {
  from: Date;
  to: Date;
}

interface DatePickerWithRangeProps {
  className?: string;
  dateRange: DateRange;
  onUpdate: (range: DateRange) => void;
}

export function DatePickerWithRange({
  className,
  dateRange,
  onUpdate,
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<{ from: Date; to: Date } | undefined>({
    from: dateRange.from,
    to: dateRange.to,
  });

  React.useEffect(() => {
    if (date?.from && date?.to) {
      onUpdate(date);
    }
  }, [date, onUpdate]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-primary"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Also export as DatePickerRange for backward compatibility
export const DatePickerRange = DatePickerWithRange;
