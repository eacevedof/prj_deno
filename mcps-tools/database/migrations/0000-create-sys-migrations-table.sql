CREATE TABLE "sys_migrations"
(
    "id" SERIAL PRIMARY KEY,
    "migration_file" VARCHAR(350) NOT NULL UNIQUE,
    "batch" INTEGER NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);