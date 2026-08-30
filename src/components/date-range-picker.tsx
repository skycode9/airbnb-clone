"use client";
import { addDays, addMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { DayPicker, type DateRange, type Matcher } from "react-day-picker";
type DateRangePickerProps = {
    selected?: DateRange;
    onSelect: (range: DateRange | undefined) => void;
    disabled?: Matcher | Matcher[];
    numberOfMonths?: number;
    className?: string;
};
export function DateRangePicker({ selected, onSelect, disabled, numberOfMonths = 2, className = "hero-daypicker mx-auto w-full max-w-full" }: DateRangePickerProps) {
    const [month, setMonth] = useState<Date>(selected?.from ?? new Date());
    return (<div className="w-full">
      
      <div className="mb-4 flex items-center justify-center gap-2">
        <button type="button" aria-label="Previous month" className="rounded-full border border-ink-300 p-2 text-ink-700 transition hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300" onClick={() => setMonth((prev) => addMonths(prev, -1))}>
          <ChevronLeft className="h-4 w-4"/>
        </button>
        <button type="button" aria-label="Next month" className="rounded-full border border-ink-300 p-2 text-ink-700 transition hover:bg-ink-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300" onClick={() => setMonth((prev) => addMonths(prev, 1))}>
          <ChevronRight className="h-4 w-4"/>
        </button>
      </div>

      
      <DayPicker mode="range" selected={selected} onSelect={onSelect} numberOfMonths={numberOfMonths} month={month} onMonthChange={setMonth} className={className} classNames={{
            months: "mx-auto flex flex-col items-center gap-6 md:flex-row md:gap-10",
            month: "mx-auto",
            caption: "relative flex items-center justify-center pb-3 pt-1",
            nav: "hidden",
            head_row: "mx-auto",
            row: "mx-auto",
            day_disabled: "text-ink-300 line-through opacity-70",
            day_selected: "bg-brand-500 text-white hover:bg-brand-600",
            day_range_middle: "bg-brand-50 text-ink-900",
            day_range_start: "bg-brand-500 text-white rounded-full",
            day_range_end: "bg-brand-500 text-white rounded-full",
            day_today: "font-semibold text-brand-700"
        }} disabled={[
            { before: addDays(new Date(), -1) },
            ...(Array.isArray(disabled) ? disabled : disabled ? [disabled] : [])
        ]} excludeDisabled/>
    </div>);
}
