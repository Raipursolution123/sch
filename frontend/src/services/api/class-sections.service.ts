import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  ClassSection,
  CreateClassSectionPayload,
  UpdateClassSectionPayload,
} from '@app-types/academics/class-section';
import { type BackendPayload, extractCount, extractList } from '@utils/api-response';
import { classesService } from './classes.service';
import { sectionsService } from './sections.service';

interface ClassSectionRecord {
  id: number;
  class_id: number;
  section_id: number;
  is_active: ClassSection['is_active'];
  created_at: string;
  updated_at: string | null;
}

// TODO: Remove mock store when GET /api/v1/academics/class-sections/ is available
let mockClassSections: ClassSectionRecord[] = [
  {
    id: 1,
    class_id: 4,
    section_id: 1,
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 2,
    class_id: 4,
    section_id: 2,
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 3,
    class_id: 5,
    section_id: 1,
    is_active: 'yes',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 4,
    class_id: 5,
    section_id: 2,
    is_active: 'no',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: null,
  },
];
let nextMockId = 5;

const USE_MOCK = false; // TODO: Set to false when backend class-sections API is deployed

function delay<T>(value: T, ms = 300): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

async function enrich(records: ClassSectionRecord[]): Promise<ClassSection[]> {
  const [classes, sections] = await Promise.all([classesService.list(), sectionsService.list()]);
  const classMap = new Map(classes.results.map((c) => [c.id, c.class_name]));
  const sectionMap = new Map(sections.results.map((s) => [s.id, s.section_name]));

  return records.map((record) => ({
    ...record,
    class_name: classMap.get(record.class_id) ?? `Class #${record.class_id}`,
    section_name: sectionMap.get(record.section_id) ?? `Section #${record.section_id}`,
  }));
}

function mockList(): ClassSectionRecord[] {
  return [...mockClassSections];
}

async function validateReferences(classId: number, sectionId: number): Promise<void> {
  const [classes, sections] = await Promise.all([classesService.list(), sectionsService.list()]);
  const schoolClass = classes.results.find((c) => c.id === classId);
  if (!schoolClass) throw new Error('Selected class not found');
  if (schoolClass.is_active !== 'yes') throw new Error('Selected class is inactive');
  const section = sections.results.find((s) => s.id === sectionId);
  if (!section) throw new Error('Selected section not found');
  if (section.is_active !== 'yes') throw new Error('Selected section is inactive');
}

function assertUniquePair(classId: number, sectionId: number, excludeId?: number): void {
  const duplicate = mockClassSections.some(
    (cs) =>
      cs.class_id === classId &&
      cs.section_id === sectionId &&
      (excludeId === undefined || cs.id !== excludeId),
  );
  if (duplicate) {
    throw new Error('This class and section combination already exists');
  }
}

export const classSectionsService = {
  list: async (page = 1): Promise<{ results: ClassSection[]; count: number }> => {
    if (USE_MOCK) {
      const allData = await enrich(mockList());
      const sorted = allData.sort(
        (a, b) =>
          a.class_name.localeCompare(b.class_name) || a.section_name.localeCompare(b.section_name),
      );
      return delay({ results: sorted, count: sorted.length });
    }
    // TODO: Wire when backend exposes GET /api/v1/academics/class-sections/
    const { data } = await apiClient.get<BackendPayload>(
      `${API_ENDPOINTS.academics.classSections}?page=${page}`,
    );
    const results = extractList<ClassSection>(data, 'class_sections');
    const count = extractCount(data, results.length);
    return { results, count };
  },

  create: async (payload: CreateClassSectionPayload): Promise<ClassSection> => {
    if (USE_MOCK) {
      await validateReferences(payload.class_id, payload.section_id);
      assertUniquePair(payload.class_id, payload.section_id);
      const created: ClassSectionRecord = {
        id: nextMockId++,
        class_id: payload.class_id,
        section_id: payload.section_id,
        is_active: payload.is_active,
        created_at: new Date().toISOString(),
        updated_at: null,
      };
      mockClassSections = [...mockClassSections, created];
      const [enriched] = await enrich([created]);
      return delay(enriched);
    }
    // TODO: Wire when backend exposes POST /api/v1/academics/class-sections/
    const { data } = await apiClient.post<ApiSuccessResponse<ClassSection>>(
      API_ENDPOINTS.academics.classSections,
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateClassSectionPayload): Promise<ClassSection> => {
    if (USE_MOCK) {
      const index = mockClassSections.findIndex((cs) => cs.id === id);
      if (index === -1) throw new Error('Class section not found');
      const updated: ClassSectionRecord = {
        ...mockClassSections[index],
        is_active: payload.is_active,
        updated_at: new Date().toISOString().slice(0, 10),
      };
      mockClassSections = mockClassSections.map((cs) => (cs.id === id ? updated : cs));
      const [enriched] = await enrich([updated]);
      return delay(enriched);
    }
    const { data } = await apiClient.patch<ApiSuccessResponse<ClassSection>>(
      API_ENDPOINTS.academics.classSectionDetail(id),
      payload,
    );
    return data.data;
  },

  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      const target = mockClassSections.find((cs) => cs.id === id);
      if (!target) throw new Error('Class section not found');
      mockClassSections = mockClassSections.map((cs) =>
        cs.id === id
          ? { ...cs, is_active: 'no' as const, updated_at: new Date().toISOString().slice(0, 10) }
          : cs,
      );
      return delay(undefined);
    }
    await apiClient.delete(API_ENDPOINTS.academics.classSectionDetail(id));
  },
};
