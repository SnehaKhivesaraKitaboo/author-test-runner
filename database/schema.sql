-- Kitaboo Authoring Test Runner — MySQL schema (XAMPP / MariaDB)
-- Database: authoring_test_runner (port 3306)

CREATE DATABASE IF NOT EXISTS authoring_test_runner
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE authoring_test_runner;

-- ── Users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NULL COMMENT 'NULL when Google-only account',
  full_name     VARCHAR(150) NOT NULL,
  google_sub    VARCHAR(128) NULL,
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL,
  UNIQUE KEY uk_users_email (email),
  UNIQUE KEY uk_users_google (google_sub)
) ENGINE=InnoDB;

-- ── Sessions (Bearer tokens) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS user_sessions (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  token_hash   CHAR(64) NOT NULL COMMENT 'SHA-256 of raw session token',
  remember_me  TINYINT(1) NOT NULL DEFAULT 0,
  expires_at   DATETIME NOT NULL,
  ip_address   VARCHAR(45) NULL,
  user_agent   VARCHAR(512) NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_sessions_token (token_hash),
  KEY idx_sessions_user (user_id),
  KEY idx_sessions_expires (expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Test runs (metadata; PDF/HTML/video files stay on disk under runs/) ──
CREATE TABLE IF NOT EXISTS test_runs (
  id               BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  run_id           VARCHAR(64) NOT NULL,
  user_id          INT UNSIGNED NULL,
  status           ENUM('running','done','failed','stopped','error') NOT NULL DEFAULT 'running',
  percent          TINYINT UNSIGNED NOT NULL DEFAULT 0,
  launch_url       TEXT NULL,
  test_mode        VARCHAR(32) NOT NULL DEFAULT 'e2e',
  test_components  VARCHAR(500) NULL,
  module_id        VARCHAR(32) NOT NULL DEFAULT 'ela',
  summary_passed   INT UNSIGNED NOT NULL DEFAULT 0,
  summary_failed   INT UNSIGNED NOT NULL DEFAULT 0,
  summary_skipped  INT UNSIGNED NOT NULL DEFAULT 0,
  completed_tests  INT UNSIGNED NOT NULL DEFAULT 0,
  total_tests      INT UNSIGNED NOT NULL DEFAULT 0,
  exit_code        INT NULL,
  started_at       DATETIME NOT NULL,
  finished_at      DATETIME NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_test_runs_run_id (run_id),
  KEY idx_test_runs_user_started (user_id, started_at DESC),
  KEY idx_test_runs_status (status),
  CONSTRAINT fk_test_runs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── Artifacts index (paths relative to runs/<run_id>/) ─────────
CREATE TABLE IF NOT EXISTS run_artifacts (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  run_id          VARCHAR(64) NOT NULL,
  file_name       VARCHAR(255) NOT NULL,
  file_type       VARCHAR(32) NOT NULL,
  storage_path    VARCHAR(512) NOT NULL,
  file_size_bytes BIGINT UNSIGNED NULL,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_artifacts_run (run_id),
  CONSTRAINT fk_artifacts_run FOREIGN KEY (run_id) REFERENCES test_runs(run_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── Login audit ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS login_audit (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NULL,
  email      VARCHAR(255) NOT NULL,
  success    TINYINT(1) NOT NULL,
  message    VARCHAR(255) NULL,
  ip_address VARCHAR(45) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_login_audit_email (email, created_at),
  CONSTRAINT fk_login_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ── App settings (tunable without code changes) ──────────────
CREATE TABLE IF NOT EXISTS app_settings (
  setting_key   VARCHAR(64) NOT NULL PRIMARY KEY,
  setting_value TEXT NOT NULL,
  description   VARCHAR(255) NULL,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
