import { describe, expect, it } from 'vitest';
import { legacyPermissionAllows, legacyViewableCategories } from './legacy-permissions';

describe('legacyPermissionAllows', () => {
  const permissions = {
    student: { can_view: true, can_add: false, can_edit: false, can_delete: false },
    collect_fees: { can_view: true, can_add: true, can_edit: false, can_delete: false },
  };

  it('returns false when permissions map is empty', () => {
    expect(legacyPermissionAllows({}, 'students.view')).toBe(false);
  });

  it('grants view when legacy category allows can_view', () => {
    expect(legacyPermissionAllows(permissions, 'students.view')).toBe(true);
  });

  it('denies create when can_add is false', () => {
    expect(legacyPermissionAllows(permissions, 'students.create')).toBe(false);
  });

  it('grants fees.manage via collect_fees category', () => {
    expect(legacyPermissionAllows(permissions, 'fees.manage')).toBe(true);
  });
});

describe('legacyViewableCategories', () => {
  it('lists categories with can_view', () => {
    const categories = legacyViewableCategories({
      student: { can_view: true, can_add: false, can_edit: false, can_delete: false },
      hostel: { can_view: false, can_add: false, can_edit: false, can_delete: false },
    });
    expect(categories).toEqual(['student']);
  });
});
