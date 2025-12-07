import React from "react";
import { PlanKey } from "../types";

interface PlanTabsProps {
  activePlan: PlanKey;
  onPlanChange: (key: PlanKey) => void;
}

export const PlanTabs: React.FC<PlanTabsProps> = ({ activePlan, onPlanChange }) => {
  const tabs: PlanKey[] = ["A", "B", "C", "D"];

  return (
    <div className="bg-gray-100 border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex space-x-1">
          {tabs.map((key) => (
            <button
              key={key}
              onClick={() => onPlanChange(key)}
              className={`px-6 py-3 font-semibold transition ${
                activePlan === key
                  ? "bg-white text-blue-600 border-t-4 border-blue-600"
                  : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              Plan {key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
