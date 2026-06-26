"""Base model for legacy db_current tables."""


class LegacyModel:
    """Mixin applied via Meta on all db_current-backed models."""

    class Meta:
        managed = False
        abstract = True
