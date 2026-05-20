"use client";

export function Topbar() {
  return (
    <header className="
      flex h-16 items-center justify-between
      border-b border-border bg-surface
      px-6 lg:px-8 xl:px-10
      flex-shrink-0
    ">
      {/* Left: Reserved for logo/app title */}
      <div className="flex items-center gap-3">
        {/* Logo can go here */}
      </div>

      {/* Right: Empty for now - can add actions like notifications, user menu */}
      <div />
    </header>
  );
}