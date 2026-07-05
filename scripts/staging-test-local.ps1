# PowerShell — local staging stack smoke test (HTTP on port 8080)
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

# Docker/MySQL write warnings to stderr; do not treat as terminating errors.
$WarningPreference = "Continue"

$Dc = @("compose", "--env-file", ".env.staging.local", "-f", "docker-compose.staging.yml")

function Invoke-Dc {
  param([string[]]$ComposeArgs)
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  & docker @Dc @ComposeArgs 2>&1 | ForEach-Object { if ($_ -is [System.Management.Automation.ErrorRecord]) { $_.ToString() } else { $_ } }
  $code = $LASTEXITCODE
  $ErrorActionPreference = $prev
  if ($code -ne 0) { throw "docker compose failed (exit $code): $ComposeArgs" }
}

Write-Host "==> Starting local staging stack on http://localhost:8080" -ForegroundColor Cyan

Invoke-Dc @("up", "-d", "mysql", "redis")
Write-Host "==> Waiting for MySQL..."
for ($i = 1; $i -le 30; $i++) {
  $ErrorActionPreference = "Continue"
  & docker @Dc @("exec", "-T", "mysql", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-pstaging_local_root", "--silent") 2>$null | Out-Null
  $ErrorActionPreference = "Stop"
  if ($LASTEXITCODE -eq 0) { break }
  Start-Sleep -Seconds 2
}

$ErrorActionPreference = "Continue"
$tableOut = & docker @Dc @("exec", "-T", "mysql", "mysql", "-u", "school_erp", "-pstaging_local_db", "-N", "-e", "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='school_erp';") 2>$null
$ErrorActionPreference = "Stop"
$tableCount = [int](($tableOut -split "`n" | Where-Object { $_ -match '^\d+$' } | Select-Object -First 1))

if ($tableCount -lt 50) {
  Write-Host "==> Loading schema.sql (large file, please wait)..."
  cmd /c "docker compose --env-file .env.staging.local -f docker-compose.staging.yml exec -T mysql mysql -u school_erp -pstaging_local_db school_erp < backend\seeds\schema.sql"
  if ($LASTEXITCODE -ne 0) { throw "schema.sql load failed" }
  Write-Host "==> Loading basic_seed.sql..."
  cmd /c "docker compose --env-file .env.staging.local -f docker-compose.staging.yml exec -T mysql mysql -u school_erp -pstaging_local_db school_erp < backend\seeds\basic_seed.sql"
  if ($LASTEXITCODE -ne 0) { throw "basic_seed.sql load failed" }
} else {
  Write-Host "==> Schema already present ($tableCount tables)"
}

Write-Host "==> Building and starting application services..."
Invoke-Dc @("up", "-d", "--build", "--wait", "backend", "frontend", "nginx", "celery_worker", "celery_beat")

Write-Host "==> Running initial_setup (skipped if school already exists)..."
$ErrorActionPreference = "Continue"
& docker @Dc @("run", "--rm", "backend", "python", "manage.py", "initial_setup", "--base-url", "http://localhost:8080") | Out-Null
$ErrorActionPreference = "Stop"

Write-Host "==> Health checks..."
$healthOk = $false
for ($i = 1; $i -le 20; $i++) {
  try {
    $r = Invoke-WebRequest -Uri "http://localhost:8080/health/" -UseBasicParsing -TimeoutSec 5
    if ($r.StatusCode -eq 200) { $healthOk = $true; break }
  } catch { }
  Write-Host "    waiting... ($i/20)"
  Start-Sleep -Seconds 5
}

& docker @Dc @("ps")

if ($healthOk) {
  Write-Host ""
  Write-Host "SUCCESS: Local staging is running" -ForegroundColor Green
  Write-Host "  App:     http://localhost:8080"
  Write-Host "  Health:  http://localhost:8080/health/"
  Write-Host "  API:     http://localhost:8080/api/v1/"
  Write-Host "  Admin:   http://localhost:8080/admin/"
  Write-Host "  Login:   admin@demo.com / Admin@123"
} else {
  Write-Host "FAILED: Health check did not pass. Logs:" -ForegroundColor Red
  Write-Host "  docker compose --env-file .env.staging.local -f docker-compose.staging.yml logs backend nginx"
  exit 1
}
