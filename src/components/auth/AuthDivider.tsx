'use client';

interface AuthDividerProps {
  text?: string;
}

export function AuthDivider({ text = 'o continúa con' }: AuthDividerProps) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="px-4 text-xs uppercase tracking-wider text-gray-500 bg-card">
          {text}
        </span>
      </div>
    </div>
  );
}

