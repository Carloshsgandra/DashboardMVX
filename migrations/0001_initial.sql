CREATE TABLE IF NOT EXISTS tasks (
  task_key TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  activity_id TEXT,
  reference_id TEXT,
  customer_code TEXT,
  filial TEXT NOT NULL,
  project_name TEXT NOT NULL,
  service TEXT NOT NULL,
  appointment_start TEXT,
  superset_equipment_status TEXT,
  erp_status TEXT NOT NULL DEFAULT 'NAO_VERIFICADO',
  erp_activity_id TEXT,
  manual_status TEXT NOT NULL DEFAULT 'PENDENTE',
  assigned_to TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  abatimento TEXT NOT NULL DEFAULT '',
  source_updated_at TEXT,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL DEFAULT 'sistema',
  revision INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_tasks_erp_status ON tasks(erp_status);
CREATE INDEX IF NOT EXISTS idx_tasks_filial ON tasks(filial);
CREATE INDEX IF NOT EXISTS idx_tasks_updated_at ON tasks(updated_at);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_key TEXT NOT NULL,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_task_key ON audit_log(task_key);
