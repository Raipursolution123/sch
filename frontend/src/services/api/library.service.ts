import { apiClient } from '@services/api/client';
import { API_ENDPOINTS } from '@constants/index';
import type { ApiSuccessResponse } from '@app-types/api';
import type {
  BookIssue,
  CreateLibraryBookPayload,
  CreateLibraryMemberPayload,
  IssueBookPayload,
  LibraryBook,
  LibraryMember,
  UpdateLibraryBookPayload,
} from '@app-types/library';
import { type BackendPayload, extractList } from '@utils/api-response';

export const libraryService = {
  listBooks: async (query?: string): Promise<LibraryBook[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.library.books, {
      params: { page_size: 100, ...(query ? { q: query } : {}) },
    });
    return extractList<LibraryBook>(data);
  },

  createBook: async (payload: CreateLibraryBookPayload): Promise<LibraryBook> => {
    const { data } = await apiClient.post<ApiSuccessResponse<LibraryBook>>(
      API_ENDPOINTS.library.books,
      payload,
    );
    return data.data;
  },

  updateBook: async (id: number, payload: UpdateLibraryBookPayload): Promise<LibraryBook> => {
    const { data } = await apiClient.patch<ApiSuccessResponse<LibraryBook>>(
      API_ENDPOINTS.library.bookDetail(id),
      payload,
    );
    return data.data;
  },

  deleteBook: async (id: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.library.bookDetail(id));
  },

  listIssues: async (status = 'open', query?: string): Promise<BookIssue[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.library.issues, {
      params: { status, page_size: 100, ...(query ? { q: query } : {}) },
    });
    return extractList<BookIssue>(data);
  },

  issueBook: async (payload: IssueBookPayload): Promise<BookIssue> => {
    const { data } = await apiClient.post<ApiSuccessResponse<BookIssue>>(
      API_ENDPOINTS.library.issues,
      payload,
    );
    return data.data;
  },

  returnBook: async (id: number, returnDate?: string): Promise<BookIssue> => {
    const { data } = await apiClient.post<ApiSuccessResponse<BookIssue>>(
      API_ENDPOINTS.library.issueReturn(id),
      returnDate ? { return_date: returnDate } : {},
    );
    return data.data;
  },

  listMembers: async (query?: string): Promise<LibraryMember[]> => {
    const { data } = await apiClient.get<BackendPayload>(API_ENDPOINTS.library.members, {
      params: { page_size: 100, ...(query ? { q: query } : {}) },
    });
    return extractList<LibraryMember>(data);
  },

  createMember: async (payload: CreateLibraryMemberPayload): Promise<LibraryMember> => {
    const { data } = await apiClient.post<ApiSuccessResponse<LibraryMember>>(
      API_ENDPOINTS.library.members,
      payload,
    );
    return data.data;
  },
};
