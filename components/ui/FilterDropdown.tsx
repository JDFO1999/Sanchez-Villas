// components/ui/FilterDropdown.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { SlidersHorizontal, X } from "lucide-react";

interface FilterDropdownProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  priceMin: string;
  priceMax: string;
  onPriceMinChange: (val: string) => void;
  onPriceMaxChange: (val: string) => void;
}

export default function FilterDropdown({
  categories,
  activeCategory,
  onCategoryChange,
  priceMin,
  priceMax,
  onPriceMinChange,
  onPriceMaxChange,
}: FilterDropdownProps) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasActiveFilter =
    activeCategory !== "Todas" || priceMin !== "" || priceMax !== "";

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        onClick={() => setShow(!show)}
        className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 text-sm font-medium ${
          hasActiveFilter
            ? "bg-primary/20 border-primary text-primary"
            : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-muted-foreground hover:bg-black/10 dark:hover:bg-white/10"
        }`}
        aria-haspopup="true"
        aria-expanded={show}
      >
        <SlidersHorizontal className="h-4 w-4" />
        <span className="hidden sm:inline">Filtros</span>
        {hasActiveFilter && (
          <span className="w-2 h-2 bg-primary rounded-full" />
        )}
      </button>

      {show && (
        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-xl shadow-2xl bg-card border border-black/10 dark:border-white/10 glass z-30 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <div className="p-4 space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm">Filtros</h4>
              {hasActiveFilter && (
                <button
                  onClick={() => {
                    onCategoryChange("Todas");
                    onPriceMinChange("");
                    onPriceMaxChange("");
                  }}
                  className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Limpiar
                </button>
              )}
            </div>

            {/* Categorías */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">
                Categoría
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => onCategoryChange(c)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${
                      activeCategory === c
                        ? "bg-primary text-primary-foreground"
                        : "bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Rango de precios */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-2">
                Rango de Precio
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Mín"
                  value={priceMin}
                  onChange={(e) => onPriceMinChange(e.target.value)}
                  className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
                  min="0"
                />
                <span className="text-xs text-muted-foreground">—</span>
                <input
                  type="number"
                  placeholder="Máx"
                  value={priceMax}
                  onChange={(e) => onPriceMaxChange(e.target.value)}
                  className="flex-1 bg-black/5 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-2 text-sm focus:outline-none focus:border-primary"
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
