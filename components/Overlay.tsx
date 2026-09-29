"use client";

/**
 * Full-screen panel used for every end-of-state moment. Never a browser
 * alert/confirm: those are text-only and unreadable for this player.
 */
export default function Overlay({
  testId,
  tint,
  children,
}: {
  testId: string;
  tint: string;
  children: React.ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      data-testid={testId}
      className="fixed inset-0 z-10 flex flex-col items-center justify-center gap-6 px-6"
      style={{ background: tint }}
    >
      {children}
    </div>
  );
}

export function BigButton({
  testId,
  label,
  icon,
  onClick,
  className,
}: {
  testId: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      data-testid={testId}
      aria-label={label}
      onClick={onClick}
      className={`flex h-24 w-24 items-center justify-center rounded-full border-b-8 shadow-lg active:translate-y-1 active:border-b-4 roomy:h-32 roomy:w-32 ${className}`}
    >
      {icon}
    </button>
  );
}
