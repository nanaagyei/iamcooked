"use client";

import { useState, useCallback } from "react";
import { Filter, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { Severity } from "@prisma/client";

export interface IncidentFilters {
  severity?: Severity | "ALL";
  ecosystem?: string | "ALL";
  incidentType?: string | "ALL";
  sort?: "latest" | "severity";
  search?: string;
}

interface IncidentFiltersProps {
  onFilterChange: (filters: IncidentFilters) => void;
  ecosystems?: string[];
  incidentTypes?: string[];
}

const severityOptions: Array<{ value: Severity | "ALL"; label: string }> = [
  { value: "ALL", label: "All severities" },
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
  { value: "INFO", label: "Info" },
];

const sortOptions: Array<{ value: NonNullable<IncidentFilters["sort"]>; label: string }> = [
  { value: "latest", label: "Latest" },
  { value: "severity", label: "Highest severity" },
];

const defaultFilters: IncidentFilters = {
  severity: "ALL",
  ecosystem: "ALL",
  incidentType: "ALL",
  sort: "latest",
};

function FilterControls({
  severity,
  ecosystem,
  incidentType,
  sort,
  ecosystems,
  incidentTypes,
  onSeverityChange,
  onEcosystemChange,
  onIncidentTypeChange,
  onSortChange,
}: {
  severity: IncidentFilters["severity"];
  ecosystem: IncidentFilters["ecosystem"];
  incidentType: IncidentFilters["incidentType"];
  sort: IncidentFilters["sort"];
  ecosystems: string[];
  incidentTypes: string[];
  onSeverityChange: (v: string) => void;
  onEcosystemChange: (v: string) => void;
  onIncidentTypeChange: (v: string) => void;
  onSortChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Select value={severity} onValueChange={onSeverityChange}>
        <SelectTrigger className="h-9 w-full text-xs sm:w-[150px]">
          <SelectValue placeholder="Severity" />
        </SelectTrigger>
        <SelectContent>
          {severityOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={ecosystem} onValueChange={onEcosystemChange}>
        <SelectTrigger className="h-9 w-full text-xs sm:w-[150px]">
          <SelectValue placeholder="Ecosystem" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All ecosystems</SelectItem>
          {ecosystems.map((eco) => (
            <SelectItem key={eco} value={eco}>{eco}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {incidentTypes.length > 0 && (
        <Select value={incidentType} onValueChange={onIncidentTypeChange}>
          <SelectTrigger className="h-9 w-full text-xs sm:w-[170px]">
            <SelectValue placeholder="Incident type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All types</SelectItem>
            {incidentTypes.map((type) => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <Select value={sort} onValueChange={onSortChange}>
        <SelectTrigger className="h-9 w-full text-xs sm:w-[150px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function IncidentFilters({
  onFilterChange,
  ecosystems = [],
  incidentTypes = [],
}: IncidentFiltersProps) {
  const [severity, setSeverity] = useState<IncidentFilters["severity"]>(defaultFilters.severity);
  const [ecosystem, setEcosystem] = useState<IncidentFilters["ecosystem"]>(defaultFilters.ecosystem);
  const [incidentType, setIncidentType] = useState<IncidentFilters["incidentType"]>(defaultFilters.incidentType);
  const [sort, setSort] = useState<IncidentFilters["sort"]>(defaultFilters.sort);
  const [search, setSearch] = useState("");

  const hasActiveFilters =
    severity !== "ALL" || ecosystem !== "ALL" || incidentType !== "ALL" || search.length > 0;

  const emit = useCallback(
    (overrides: Partial<IncidentFilters>) => {
      const next = { severity, ecosystem, incidentType, sort, search, ...overrides };
      onFilterChange({
        severity: next.severity === "ALL" ? undefined : next.severity,
        ecosystem: next.ecosystem === "ALL" ? undefined : next.ecosystem,
        incidentType: next.incidentType === "ALL" ? undefined : next.incidentType,
        sort: next.sort,
        search: next.search || undefined,
      });
    },
    [severity, ecosystem, incidentType, sort, search, onFilterChange],
  );

  const clearFilters = () => {
    setSeverity(defaultFilters.severity);
    setEcosystem(defaultFilters.ecosystem);
    setIncidentType(defaultFilters.incidentType);
    setSort(defaultFilters.sort);
    setSearch("");
    onFilterChange({ sort: defaultFilters.sort });
  };

  const filterProps = {
    severity,
    ecosystem,
    incidentType,
    sort,
    ecosystems,
    incidentTypes,
    onSeverityChange: (v: string) => { setSeverity(v as IncidentFilters["severity"]); emit({ severity: v as IncidentFilters["severity"] }); },
    onEcosystemChange: (v: string) => { setEcosystem(v); emit({ ecosystem: v }); },
    onIncidentTypeChange: (v: string) => { setIncidentType(v); emit({ incidentType: v }); },
    onSortChange: (v: string) => { setSort(v as IncidentFilters["sort"]); emit({ sort: v as IncidentFilters["sort"] }); },
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search incidents or packages..."
          className="pl-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            emit({ search: e.target.value });
          }}
        />
      </div>

      <div className="hidden sm:flex sm:items-center sm:gap-3 sm:flex-wrap">
        <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
        <FilterControls {...filterProps} />
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 text-xs">
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>

      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="contrast" size="sm" className="w-full">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-auto">
            <SheetHeader>
              <SheetTitle>Filter incidents</SheetTitle>
            </SheetHeader>
            <div className="mt-4 pb-4">
              <FilterControls {...filterProps} />
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-4 w-full">
                  Clear filters
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
