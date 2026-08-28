-- Runs only when the pgdata volume is first created. The e2e suite points at
-- this database so tests never touch development data.
CREATE DATABASE kanban_test OWNER kanban;
