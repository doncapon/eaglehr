"use client";

import { EMPLOYMENT_TYPES, NIGERIA_STATE_LABELS, NIGERIA_STATES, WORK_MODES } from "@eaglehr/types";
import { useState, type FormEvent } from "react";
import { bucketKey, formatBucketLabel, type SalaryBucket } from "@/lib/salary-buckets";

interface FilterCount {
  value: string;
  count: number;
}

interface FilterFacets {
  employmentType: FilterCount[];
  workMode: FilterCount[];
  state: FilterCount[];
  industry: FilterCount[];
}

export interface JobFiltersProps {
  q?: string;
  state?: string;
  employmentType: string[];
  workMode: string[];
  industry: string[];
  facets: FilterFacets;
  minSalary?: string;
  maxSalary?: string;
  salaryBuckets: SalaryBucket[];
  hasActiveFilters: boolean;
  onNavigate: (params: URLSearchParams, options?: { scrollToResults?: boolean }) => void;
  isPending: boolean;
}

function countsByValue(counts: FilterCount[]): Map<string, number> {
  return new Map(counts.map(({ value, count }) => [value, count]));
}

/** A bucket is "selected" if it fits inside the currently-applied [minSalary, maxSalary] window. */
function isBucketChecked(bucket: SalaryBucket, minSalary?: string, maxSalary?: string): boolean {
  if (minSalary === undefined && maxSalary === undefined) return false;
  const min = minSalary !== undefined ? Number(minSalary) : -Infinity;
  const max = maxSalary !== undefined ? Number(maxSalary) : Infinity;
  return bucket.min >= min && (bucket.max === null || bucket.max <= max);
}

/** Selecting several buckets filters by their combined envelope (lowest min to highest max). */
function envelopeFromBuckets(buckets: SalaryBucket[], selectedKeys: Set<string>): { min?: number; max?: number } {
  const selected = buckets.filter((b) => selectedKeys.has(bucketKey(b)));
  if (selected.length === 0) return {};
  const min = Math.min(...selected.map((b) => b.min));
  const hasOpenEnd = selected.some((b) => b.max === null);
  const max = hasOpenEnd ? undefined : Math.max(...selected.map((b) => b.max as number));
  return { min, max };
}

/** Builds a query string from the form's current field values, dropping empty ones. */
function paramsFromForm(form: HTMLFormElement): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of new FormData(form).entries()) {
    if (typeof value === "string" && value !== "") params.append(key, value);
  }
  return params;
}

export function JobFilters({
  q,
  state,
  employmentType,
  workMode,
  industry,
  facets,
  minSalary,
  maxSalary,
  salaryBuckets,
  hasActiveFilters,
  onNavigate,
  isPending,
}: JobFiltersProps) {
  const employmentTypeCounts = countsByValue(facets.employmentType);
  const workModeCounts = countsByValue(facets.workMode);
  const stateCounts = countsByValue(facets.state);
  const [selectedBuckets, setSelectedBuckets] = useState<Set<string>>(
    () => new Set(salaryBuckets.filter((b) => isBucketChecked(b, minSalary, maxSalary)).map(bucketKey)),
  );

  // Salary buckets aren't native form fields (a checked set can't map onto a single
  // name="minSalary" input), so every navigation folds in the current bucket
  // selection on top of whatever the form itself serializes.
  function buildParams(form: HTMLFormElement, buckets: Set<string>): URLSearchParams {
    const params = paramsFromForm(form);
    const { min, max } = envelopeFromBuckets(salaryBuckets, buckets);
    if (min !== undefined) params.set("minSalary", String(min));
    if (max !== undefined) params.set("maxSalary", String(max));
    return params;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onNavigate(buildParams(event.currentTarget, selectedBuckets), { scrollToResults: true });
  }

  // Checkboxes/selects apply immediately on change, same as before — just via a
  // client-side transition now instead of a full-page form submission.
  function handleFieldChange(event: FormEvent<HTMLInputElement | HTMLSelectElement>) {
    const form = event.currentTarget.form;
    if (form) onNavigate(buildParams(form, selectedBuckets));
  }

  function handleSalaryBucketChange(bucket: SalaryBucket, checked: boolean) {
    const next = new Set(selectedBuckets);
    checked ? next.add(bucketKey(bucket)) : next.delete(bucketKey(bucket));
    setSelectedBuckets(next);

    const form = document.getElementById("job-filters-form") as HTMLFormElement | null;
    if (form) onNavigate(buildParams(form, next));
  }

  function handleClear() {
    setSelectedBuckets(new Set());
    onNavigate(new URLSearchParams());
  }

  return (
    <form id="job-filters-form" onSubmit={handleSubmit} className="flex flex-col gap-6">
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
          <label
            key={type}
            className="flex items-center justify-between gap-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                name="employmentType"
                value={type}
                defaultChecked={employmentType.includes(type)}
                onChange={handleFieldChange}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
              />
              {type.replace("_", " ")}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{employmentTypeCounts.get(type) ?? 0}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Work mode
        </legend>
        {WORK_MODES.map((mode) => (
          <label
            key={mode}
            className="flex items-center justify-between gap-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                name="workMode"
                value={mode}
                defaultChecked={workMode.includes(mode)}
                onChange={handleFieldChange}
                className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
              />
              {mode}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500">{workModeCounts.get(mode) ?? 0}</span>
          </label>
        ))}
      </fieldset>

      {facets.industry.length > 0 ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Sector
          </legend>
          {facets.industry.map(({ value, count }) => (
            <label key={value} className="flex items-center justify-between gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="industry"
                  value={value}
                  defaultChecked={industry.includes(value)}
                  onChange={handleFieldChange}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                />
                {value}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{count}</span>
            </label>
          ))}
        </fieldset>
      ) : null}

      {salaryBuckets.length > 0 ? (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Salary range (₦/month)
          </legend>
          {salaryBuckets.map((bucket) => {
            const key = bucketKey(bucket);
            return (
              <label key={key} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={selectedBuckets.has(key)}
                  onChange={(e) => handleSalaryBucketChange(bucket, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800"
                />
                {formatBucketLabel(bucket)}
              </label>
            );
          })}
        </fieldset>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="state" className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          State
        </label>
        <select
          id="state"
          name="state"
          defaultValue={state ?? ""}
          onChange={handleFieldChange}
          className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm transition-colors focus:border-brand-400 focus:outline-none dark:border-gray-700 dark:bg-gray-900"
        >
          <option value="">All states</option>
          {NIGERIA_STATES.map((stateOption) => (
            <option key={stateOption} value={stateOption}>
              {NIGERIA_STATE_LABELS[stateOption]} ({stateCounts.get(stateOption) ?? 0})
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="h-10 rounded-md bg-brand-600 text-sm font-medium text-white shadow-soft transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-lift active:scale-[0.97] disabled:pointer-events-none disabled:opacity-70"
      >
        {isPending ? "Applying..." : "Apply filters"}
      </button>
      {hasActiveFilters ? (
        <button
          type="button"
          onClick={handleClear}
          className="text-center text-sm text-gray-500 hover:text-brand-600 dark:text-gray-400 dark:hover:text-brand-400"
        >
          Clear all filters
        </button>
      ) : null}
    </form>
  );
}
