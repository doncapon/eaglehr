"use client";

import { EMPLOYMENT_TYPES, NIGERIA_STATE_LABELS, NIGERIA_STATES, WORK_MODES } from "@eaglehr/types";
import Link from "next/link";
import type { FormEvent } from "react";

interface IndustryCount {
  industry: string;
  count: number;
}

interface JobFiltersProps {
  q?: string;
  state?: string;
  employmentType: string[];
  workMode: string[];
  industry: string[];
  industries: IndustryCount[];
  minSalary?: string;
  maxSalary?: string;
  salaryFloor: number;
  salaryCeiling: number;
  hasActiveFilters: boolean;
}

function submitOnChange(event: FormEvent<HTMLInputElement | HTMLSelectElement>) {
  event.currentTarget.form?.requestSubmit();
}

export function JobFilters({
  q,
  state,
  employmentType,
  workMode,
  industry,
  industries,
  minSalary,
  maxSalary,
  salaryFloor,
  salaryCeiling,
  hasActiveFilters,
}: JobFiltersProps) {
  return (
    <form method="get" className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="q" className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Search
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Job title or keyword..."
          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm transition-colors focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Employment type
        </legend>
        {EMPLOYMENT_TYPES.map((type) => (
          <label key={type} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              name="employmentType"
              value={type}
              defaultChecked={employmentType.includes(type)}
              onChange={submitOnChange}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
            />
            {type.replace("_", " ")}
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Work mode
        </legend>
        {WORK_MODES.map((mode) => (
          <label key={mode} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              name="workMode"
              value={mode}
              defaultChecked={workMode.includes(mode)}
              onChange={submitOnChange}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
            />
            {mode}
          </label>
        ))}
      </fieldset>

      {industries.length > 0 ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Sector
          </legend>
          {industries.map(({ industry: value, count }) => (
            <label key={value} className="flex items-center justify-between gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="industry"
                  value={value}
                  defaultChecked={industry.includes(value)}
                  onChange={submitOnChange}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                />
                {value}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{count}</span>
            </label>
          ))}
        </fieldset>
      ) : null}

      {salaryCeiling > salaryFloor ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Salary range (₦/month)
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="minSalary"
              min={salaryFloor}
              max={salaryCeiling}
              defaultValue={minSalary ?? ""}
              placeholder={salaryFloor.toLocaleString("en-NG")}
              className="h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-2 text-sm transition-colors focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
            />
            <span className="text-gray-400">–</span>
            <input
              type="number"
              name="maxSalary"
              min={salaryFloor}
              max={salaryCeiling}
              defaultValue={maxSalary ?? ""}
              placeholder={salaryCeiling.toLocaleString("en-NG")}
              className="h-10 w-full min-w-0 rounded-md border border-gray-300 bg-white px-2 text-sm transition-colors focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="state" className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          State
        </label>
        <select
          id="state"
          name="state"
          defaultValue={state ?? ""}
          onChange={submitOnChange}
          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm transition-colors focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="">All states</option>
          {NIGERIA_STATES.map((stateOption) => (
            <option key={stateOption} value={stateOption}>
              {NIGERIA_STATE_LABELS[stateOption]}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="h-10 rounded-md bg-brand-600 text-sm font-medium text-white shadow-soft transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lift active:scale-[0.97]"
      >
        Apply filters
      </button>
      {hasActiveFilters ? (
        <Link href="/jobs" className="text-center text-sm text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400">
          Clear all filters
        </Link>
      ) : null}
    </form>
  );
}
