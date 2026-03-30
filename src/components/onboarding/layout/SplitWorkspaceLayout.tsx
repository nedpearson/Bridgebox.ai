import React from "react";

interface SplitWorkspaceLayoutProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  leftWidth?: "1/2" | "2/3" | "3/4";
}

export default function SplitWorkspaceLayout({
  leftPanel,
  rightPanel,
  leftWidth = "1/2",
}: SplitWorkspaceLayoutProps) {
  const leftClasses = {
    "1/2": "lg:w-1/2",
    "2/3": "lg:w-2/3",
    "3/4": "lg:w-3/4",
  }[leftWidth];

  const rightClasses = {
    "1/2": "lg:w-1/2",
    "2/3": "lg:w-1/3",
    "3/4": "lg:w-1/4",
  }[leftWidth];

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-slate-950">
      {/* Left Payload (Client Input Boundary) */}
      <div
        className={`w-full ${leftClasses} p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-white/5 flex-1 lg:flex-none`}
      >
        {leftPanel}
      </div>

      {/* Right Payload (AI Inference Boundary) */}
      <div
        className={`w-full ${rightClasses} bg-slate-900/40 p-6 overflow-y-auto flex-1 lg:flex-none`}
      >
        {rightPanel}
      </div>
    </div>
  );
}
