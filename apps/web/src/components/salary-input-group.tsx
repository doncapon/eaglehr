"use client";

import { Input, Label } from "@eaglehr/ui";
import { useState } from "react";

interface SalaryInputGroupProps {
  defaultMinKobo?: number | null;
  defaultMaxKobo?: number | null;
}

function koboToNaira(kobo: number | null | undefined): string {
  return kobo ? String(kobo / 100) : "";
}

export function SalaryInputGroup({ defaultMinKobo, defaultMaxKobo }: SalaryInputGroupProps) {
  const isRange = Boolean(defaultMinKobo && defaultMaxKobo && defaultMinKobo !== defaultMaxKobo);
  const [mode, setMode] = useState<"fixed" | "range">(isRange ? "range" : "fixed");
  const [fixed, setFixed] = useState(koboToNaira(defaultMinKobo ?? defaultMaxKobo));
  const [min, setMin] = useState(koboToNaira(defaultMinKobo));
  const [max, setMax] = useState(koboToNaira(defaultMaxKobo));

  return (
    <div className="flex flex-col gap-2">
      <Label>Salary (NGN/month, optional)</Label>
      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-300">
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            checked={mode === "fixed"}
            onChange={() => setMode("fixed")}
            className="h-3.5 w-3.5 text-brand-600 focus:ring-brand-500"
          />
          Fixed amount
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="radio"
            checked={mode === "range"}
            onChange={() => setMode("range")}
            className="h-3.5 w-3.5 text-brand-600 focus:ring-brand-500"
          />
          Range
        </label>
      </div>
      {mode === "fixed" ? (
        <>
          <Input type="number" min={0} placeholder="800000" value={fixed} onChange={(e) => setFixed(e.target.value)} />
          <input type="hidden" name="salaryMinKobo" value={fixed} />
          <input type="hidden" name="salaryMaxKobo" value={fixed} />
        </>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="salaryMinKobo"
            type="number"
            min={0}
            placeholder="800000"
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
          <Input
            name="salaryMaxKobo"
            type="number"
            min={0}
            placeholder="1200000"
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
