CREATE TABLE `audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_key` text NOT NULL,
	`action` text NOT NULL,
	`actor` text NOT NULL,
	`detail` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_task_key` ON `audit_log` (`task_key`);--> statement-breakpoint
CREATE TABLE `tasks` (
	`task_key` text PRIMARY KEY NOT NULL,
	`project_id` text NOT NULL,
	`activity_id` text,
	`reference_id` text,
	`customer_code` text,
	`filial` text NOT NULL,
	`project_name` text NOT NULL,
	`service` text NOT NULL,
	`appointment_start` text,
	`superset_equipment_status` text,
	`erp_status` text DEFAULT 'NAO_VERIFICADO' NOT NULL,
	`erp_activity_id` text,
	`manual_status` text DEFAULT 'PENDENTE' NOT NULL,
	`assigned_to` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`abatimento` text DEFAULT '' NOT NULL,
	`source_updated_at` text,
	`updated_at` text NOT NULL,
	`updated_by` text DEFAULT 'sistema' NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_tasks_erp_status` ON `tasks` (`erp_status`);--> statement-breakpoint
CREATE INDEX `idx_tasks_filial` ON `tasks` (`filial`);--> statement-breakpoint
CREATE INDEX `idx_tasks_updated_at` ON `tasks` (`updated_at`);
