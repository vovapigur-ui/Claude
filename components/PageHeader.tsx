interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export default function PageHeader({ title, subtitle, right }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-900">
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="min-w-0">
          <h1 className="font-archivo font-black text-2xl tracking-tight leading-none text-zinc-100">
            {title}
          </h1>
          {subtitle && (
            <p className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {right}
      </div>
    </div>
  );
}
