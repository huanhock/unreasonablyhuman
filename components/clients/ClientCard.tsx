'use client';

import Link from 'next/link';
import type { Client } from '@/lib/types';
import { getInitials, getAvatarGradient } from '@/lib/avatar';

const statusStyles: Record<Client['status'], string> = {
  cold: 'bg-rose-100 text-rose-700 ring-rose-200',
  warm: 'bg-amber-100 text-amber-700 ring-amber-200',
  hot: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
};

function formatDate(date: string) {
  const [year, month, day] = date.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[Number(month) - 1]} ${Number(day)}, ${year}`;
}

interface ClientCardProps {
  client: Client;
}

export default function ClientCard({ client }: ClientCardProps) {
  return (
    <Link
      href={`/clients/${client.id}`}
      className="glass block p-4 transition hover:-translate-y-0.5 hover:bg-white/35 focus:outline-none focus:ring-2 focus:ring-orange-300"
    >
      <div className="flex items-center gap-4">
        <div className={`flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getAvatarGradient(client.name)} text-base font-bold text-white shadow-sm`}>
          {getInitials(client.name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-[#1a1a2e]">
                {client.name}
              </h2>
              <p className="truncate text-sm text-slate-600">{client.company}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusStyles[client.status]}`}
            >
              {client.status}
            </span>
          </div>

          <p className="mt-3 text-sm text-slate-500">
            Last contacted{' '}
            <span className="font-medium text-slate-700">
              {formatDate(client.lastContacted)}
            </span>
          </p>
        </div>
      </div>
    </Link>
  );
}
