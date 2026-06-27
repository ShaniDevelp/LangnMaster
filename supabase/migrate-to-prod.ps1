# Migrate dev Supabase project -> new empty prod project.
# Dumps schema + data (incl. auth.users) from DEV, restores into fresh PROD.
#
# Prereqs:
#   - Node (npx supabase) available
#   - psql on PATH (winget install --id PostgreSQL.PostgreSQL.16 -e)
#   - PROD project must be brand new / empty
#
# Get URIs from each dashboard:
#   Project Settings -> Database -> Connection string -> URI (port 5432, with password)

param(
    [Parameter(Mandatory = $true)] [string]$DevUrl,
    [Parameter(Mandatory = $true)] [string]$ProdUrl,
    [string]$PsqlPath = "psql",
    [switch]$ResetProd  # WIPE public schema in prod before restore (idempotent reruns)
)

$ErrorActionPreference = "Stop"
$dumpDir = Join-Path $PSScriptRoot "_dump"
New-Item -ItemType Directory -Force -Path $dumpDir | Out-Null

$roles  = Join-Path $dumpDir "roles.sql"
$schema = Join-Path $dumpDir "schema.sql"
$data   = Join-Path $dumpDir "data.sql"

Write-Host "==> [1/4] Dumping DEV roles..." -ForegroundColor Cyan
npx supabase db dump --db-url $DevUrl -f $roles --role-only
if ($LASTEXITCODE -ne 0) { throw "roles dump failed" }

Write-Host "==> [2/4] Dumping DEV schema..." -ForegroundColor Cyan
npx supabase db dump --db-url $DevUrl -f $schema
if ($LASTEXITCODE -ne 0) { throw "schema dump failed" }

Write-Host "==> [3/4] Dumping DEV data (incl. auth.users)..." -ForegroundColor Cyan
npx supabase db dump --db-url $DevUrl -f $data --use-copy --data-only
if ($LASTEXITCODE -ne 0) { throw "data dump failed" }

if ($ResetProd) {
    Write-Host "==> Resetting PROD public schema..." -ForegroundColor Yellow
    & $PsqlPath $ProdUrl -v ON_ERROR_STOP=1 -c "drop schema if exists public cascade; create schema public; grant usage on schema public to anon, authenticated, service_role; grant all on schema public to postgres, service_role;"
    if ($LASTEXITCODE -ne 0) { throw "prod reset failed" }
}

Write-Host "==> [4/4] Restoring into PROD (roles -> schema -> data)..." -ForegroundColor Cyan
& $PsqlPath $ProdUrl -v ON_ERROR_STOP=1 -f $roles
if ($LASTEXITCODE -ne 0) { throw "roles restore failed" }
& $PsqlPath $ProdUrl -v ON_ERROR_STOP=1 -f $schema
if ($LASTEXITCODE -ne 0) { throw "schema restore failed" }
& $PsqlPath $ProdUrl -v ON_ERROR_STOP=1 -f $data
if ($LASTEXITCODE -ne 0) { throw "data restore failed" }

Write-Host "`n==> Verify counts:" -ForegroundColor Green
& $PsqlPath $ProdUrl -c "select count(*) as users from auth.users;"
& $PsqlPath $ProdUrl -c "select schemaname, count(*) as tables from pg_tables where schemaname='public' group by schemaname;"

Write-Host "`nDone. Next: update .env.local + Vercel with new project URL + anon + service_role keys." -ForegroundColor Green
Write-Host "Note: storage FILE bytes (avatars) NOT migrated - re-upload separately." -ForegroundColor Yellow
