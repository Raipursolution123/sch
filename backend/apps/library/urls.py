from django.urls import path

from apps.library.api.views.book_issues import (
    BookIssueReturnView,
    BookIssuesListCreateView,
    LibraryMembersListCreateView,
)
from apps.library.api.views.books import BooksDetailView, BooksListCreateView

urlpatterns = [
    path("books/", BooksListCreateView.as_view(), name="library-books-list-create"),
    path("books/<int:pk>/", BooksDetailView.as_view(), name="library-books-detail"),
    path(
        "issues/",
        BookIssuesListCreateView.as_view(),
        name="library-issues-list-create",
    ),
    path(
        "issues/<int:pk>/return/",
        BookIssueReturnView.as_view(),
        name="library-issues-return",
    ),
    path(
        "members/",
        LibraryMembersListCreateView.as_view(),
        name="library-members-list-create",
    ),
]
