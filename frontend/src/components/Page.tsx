import type { ReactNode } from 'react';

interface PageProps {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

// Standard page shell: header (title + description + optional action) and a
// consistent vertical rhythm. Every page wraps its content in <Page> so
// padding and spacing are defined in exactly one place.
export function Page({ title, description, action, children }: PageProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </div>
  );
}
