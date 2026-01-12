"use client";

import { useToast } from "@/components/ToastProvider";

interface Subcategory {
  id: number;
  name: string;
  count: string;
}

interface Props {
  subcategories: Subcategory[];
}

export default function SkincareSubcategories({ subcategories }: Props) {
  const { showToast } = useToast();

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {subcategories.map((subcat) => (
        <button
          key={subcat.id}
          onClick={() =>
            showToast({
              message: `${subcat.name} clicked!`,
              type: "success",
            })
          }
          className="group p-4 rounded-xl bg-gray-50 hover:bg-gradient-to-r hover:from-[#e39a89] hover:to-[#d87a6a] transition-all duration-300 transform hover:-translate-y-1"
        >
          <h3 className="font-semibold text-gray-800 group-hover:text-white mb-1">
            {subcat.name}
          </h3>
          <p className="text-sm text-gray-500 group-hover:text-white/80">
            {subcat.count}
          </p>
        </button>
      ))}
    </div>
  );
}
