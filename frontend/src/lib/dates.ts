export const formatDate = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString();
};

export const formatTime = (iso: string | null | undefined): string => {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatHours = (h: number | null | undefined): string => {
  if (h === null || h === undefined) return '—';
  return `${h.toFixed(2)} h`;
};

export const todayString = (): string =>
  new Date().toISOString().slice(0, 10);
