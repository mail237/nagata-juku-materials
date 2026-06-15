import { GRADES } from "@/lib/constants";

type GradeFilterProps = {
  selected: string;
  onChange: (grade: string) => void;
};

export function GradeFilter({ selected, onChange }: GradeFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {GRADES.map((grade) => {
        const active = selected === grade;
        return (
          <button
            key={grade}
            type="button"
            onClick={() => onChange(grade)}
            className={`min-h-10 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {grade}
          </button>
        );
      })}
    </div>
  );
}
