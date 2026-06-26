import { Round } from './models';

/** Render revealed rounds as RFC-4180-ish CSV text (story, votes, average, mode, consensus). */
export function roundsToCsv(rounds: Round[]): string {
  const header = ['Story', 'Votes', 'Average', 'Most common', 'Consensus'];
  const rows = rounds.map((r) => {
    const res = r.results;
    return [
      r.story.title || '(untitled)',
      res ? String(res.voterCount) : '',
      res?.mean !== undefined ? res.mean.toFixed(2) : '',
      res ? res.mode.join(' / ') : '',
      res ? (res.consensus ? 'yes' : 'no') : '',
    ];
  });
  return [header, ...rows].map((cols) => cols.map(csvCell).join(',')).join('\r\n');
}

function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
