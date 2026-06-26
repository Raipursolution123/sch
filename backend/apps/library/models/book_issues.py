from django.db import models


class BookIssues(models.Model):
    """Maps to `book_issues` in db_current."""

    id = models.AutoField(primary_key=True)
    book_id = models.IntegerField(blank=False, null=False, db_index=True)
    member_id = models.IntegerField(blank=True, null=True, db_index=True)
    duereturn_date = models.DateField(blank=True, null=True)
    return_date = models.DateField(blank=True, null=True)
    issue_date = models.DateField(blank=True, null=True)
    is_returned = models.IntegerField(blank=True, null=True, default=0)
    is_active = models.CharField(max_length=10, default='no')
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = "book_issues"

    def __str__(self):
        return f"BookIssues {self.pk}"
