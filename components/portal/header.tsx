import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

interface HeaderProps {
  nombreColegio?: string;
  logo?: string | null;
  colorPrimario?: string;
}

export default function PortalHeader({ nombreColegio = 'Portal Educativo', logo, colorPrimario = '#3B82F6' }: HeaderProps) {
  return (
    <header className="border-b bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {logo ? (
              <img
                src={logo}
                alt={nombreColegio}
                className="h-12 w-12 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colorPrimario }}
              >
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-xl md:text-2xl font-bold" style={{ color: colorPrimario }}>
                {nombreColegio}
              </h1>
              <p className="text-xs text-muted-foreground hidden md:block">
                Portal educativo para familias
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
