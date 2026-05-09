const gradients = [
  'from-orange-300 via-rose-300 to-amber-200',
  'from-violet-300 via-purple-300 to-fuchsia-200',
  'from-cyan-300 via-teal-300 to-emerald-200',
  'from-rose-300 via-pink-300 to-red-200',
  'from-blue-300 via-indigo-300 to-violet-200',
  'from-emerald-300 via-green-300 to-lime-200',
  'from-amber-300 via-yellow-300 to-orange-200',
  'from-fuchsia-300 via-pink-300 to-rose-200',
  'from-teal-300 via-cyan-300 to-sky-200',
  'from-indigo-300 via-blue-300 to-cyan-200',
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getAvatarGradient(name: string): string {
  return gradients[hashName(name) % gradients.length];
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
