-- Grant School Admin (role_id=1 / ADMIN) access to school-level configuration.
-- Safe to run multiple times (INSERT IGNORE).

INSERT IGNORE INTO roles_permissions
  (id, role_id, perm_cat_id, can_view, can_add, can_edit, can_delete, created_at, is_central)
VALUES
  (2072, 1, 54, 1, 0, 1, 0, NOW(), NULL),
  (2073, 1, 55, 1, 1, 1, 0, NOW(), NULL);
