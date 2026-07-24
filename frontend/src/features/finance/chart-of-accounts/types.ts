import type { Ledger, LedgerGroup } from '@app-types/finance';

export type ChartOfAccountsRow =
  | {
      kind: 'group';
      id: string;
      group_id: number;
      name: string;
      code: string;
      ledger_count: number;
      parent_id: number | null;
    }
  | {
      kind: 'ledger';
      id: string;
      ledger_id: number;
      group_id: number;
      group_name: string;
      name: string;
      code: string;
      op_balance: string;
      op_balance_dc: 'D' | 'C';
    };

export function buildChartOfAccountsRows(
  groups: LedgerGroup[],
  ledgers: Ledger[],
  search: string,
): ChartOfAccountsRow[] {
  const term = search.trim().toLowerCase();
  const byGroup = new Map<number, Ledger[]>();
  for (const ledger of ledgers) {
    const list = byGroup.get(ledger.group_id) ?? [];
    list.push(ledger);
    byGroup.set(ledger.group_id, list);
  }

  const sortedGroups = [...groups].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }),
  );

  const rows: ChartOfAccountsRow[] = [];
  for (const group of sortedGroups) {
    const groupLedgers = (byGroup.get(group.id) ?? []).sort((a, b) =>
      (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }),
    );

    const groupMatches =
      !term ||
      group.name.toLowerCase().includes(term) ||
      (group.code || '').toLowerCase().includes(term);

    const matchingLedgers = term
      ? groupLedgers.filter(
          (l) =>
            l.name.toLowerCase().includes(term) ||
            (l.code || '').toLowerCase().includes(term) ||
            groupMatches,
        )
      : groupLedgers;

    if (term && !groupMatches && matchingLedgers.length === 0) {
      continue;
    }

    rows.push({
      kind: 'group',
      id: `group-${group.id}`,
      group_id: group.id,
      name: group.name,
      code: group.code || '',
      ledger_count: groupLedgers.length,
      parent_id: group.parent_id ?? null,
    });

    for (const ledger of matchingLedgers) {
      rows.push({
        kind: 'ledger',
        id: `ledger-${ledger.id}`,
        ledger_id: ledger.id,
        group_id: group.id,
        group_name: group.name,
        name: ledger.name,
        code: ledger.code || '',
        op_balance: ledger.op_balance,
        op_balance_dc: ledger.op_balance_dc,
      });
    }
  }

  // Orphan ledgers (group missing from list)
  const knownGroupIds = new Set(groups.map((g) => g.id));
  const orphans = ledgers
    .filter((l) => !knownGroupIds.has(l.group_id))
    .filter(
      (l) =>
        !term || l.name.toLowerCase().includes(term) || (l.code || '').toLowerCase().includes(term),
    )
    .sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));

  if (orphans.length > 0) {
    rows.push({
      kind: 'group',
      id: 'group-orphan',
      group_id: 0,
      name: 'Unassigned',
      code: '',
      ledger_count: orphans.length,
      parent_id: null,
    });
    for (const ledger of orphans) {
      rows.push({
        kind: 'ledger',
        id: `ledger-${ledger.id}`,
        ledger_id: ledger.id,
        group_id: ledger.group_id,
        group_name: 'Unassigned',
        name: ledger.name,
        code: ledger.code || '',
        op_balance: ledger.op_balance,
        op_balance_dc: ledger.op_balance_dc,
      });
    }
  }

  return rows;
}
