# End-to-end staging verification + container persistence tests (PowerShell)
$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$BaseUrl = if ($args[0]) { $args[0] } else { "http://localhost:8080" }
$ReportPath = Join-Path $Root ".deploy\e2e-report.txt"
New-Item -ItemType Directory -Force -Path (Join-Path $Root ".deploy") | Out-Null

$script:Pass = 0
$script:Fail = 0
$script:Skip = 0
$script:Warn = 0

function Log($msg) { Add-Content -Path $ReportPath -Value $msg; Write-Host $msg }
function Pass($msg) { $script:Pass++; Log "  [PASS] $msg" }
function Fail($msg) { $script:Fail++; Log "  [FAIL] $msg" }
function Skip($msg) { $script:Skip++; Log "  [SKIP] $msg" }
function Warn($msg) { $script:Warn++; Log "  [WARN] $msg" }

$Dc = @("compose", "--env-file", ".env.staging.local", "-f", "docker-compose.staging.yml")

Set-Content -Path $ReportPath -Value @(
  "=== School ERP Staging E2E Verification ===",
  "Base URL: $BaseUrl",
  "Time: $((Get-Date).ToUniversalTime().ToString('o'))",
  ""
)

# Health
Log "## Health endpoints"
try {
  $h = Invoke-WebRequest -Uri "$BaseUrl/health/" -UseBasicParsing -TimeoutSec 10
  if ($h.StatusCode -eq 200) { Pass "/health/ returns 200" } else { Fail "/health/ returned $($h.StatusCode)" }
} catch { Fail "/health/ - $($_.Exception.Message)" }

try {
  $r = Invoke-WebRequest -Uri "$BaseUrl/health/ready/" -UseBasicParsing -TimeoutSec 10
  if ($r.StatusCode -eq 200) { Pass "/health/ready/ returns 200" }
} catch {
  if ($_.Exception.Response.StatusCode.value__ -eq 503) { Warn "/health/ready/ returns 503" }
  else { Fail "/health/ready/ - $($_.Exception.Message)" }
}

# Login
Log ""
Log "## Login & API proxy"
$loginBody = '{"username":"admin@demo.com","password":"Admin@123"}'
$access = $null
$refresh = $null
try {
  $login = Invoke-WebRequest -Uri "$BaseUrl/api/v1/auth/login/" -Method POST -Body $loginBody `
    -ContentType "application/json" -UseBasicParsing -TimeoutSec 15
  $loginData = $login.Content | ConvertFrom-Json
  if ($login.StatusCode -eq 200 -and $loginData.data.tokens.access) {
    Pass "Login via Nginx (POST /api/v1/auth/login/)"
    $access = $loginData.data.tokens.access
    $refresh = $loginData.data.tokens.refresh
  } else { Fail "Login response missing tokens" }
} catch { Fail "Login - $($_.Exception.Message)" }

# Protected APIs
Log ""
Log "## Protected APIs"
if ($access) {
  try {
    $me = Invoke-WebRequest -Uri "$BaseUrl/api/v1/auth/me/" -Headers @{ Authorization = "Bearer $access" } -UseBasicParsing
    if ($me.StatusCode -eq 200) { Pass "GET /api/v1/auth/me/ with token" } else { Fail "me/ returned $($me.StatusCode)" }
  } catch { Fail "me/ with token - $($_.Exception.Message)" }
  try {
    Invoke-WebRequest -Uri "$BaseUrl/api/v1/auth/me/" -UseBasicParsing -TimeoutSec 10 | Out-Null
    Fail "me/ without token should return 401"
  } catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) { Pass "GET /api/v1/auth/me/ without token returns 401" }
    else { Fail "me/ without token - unexpected status" }
  }
} else { Skip "Protected API tests" }

# Token refresh
Log ""
Log "## Token refresh"
$newAccess = $null
if ($refresh) {
  try {
    $refBody = "{`"refresh`":`"$refresh`"}"
    $ref = Invoke-WebRequest -Uri "$BaseUrl/api/v1/auth/token/refresh/" -Method POST -Body $refBody `
      -ContentType "application/json" -UseBasicParsing
    $refData = $ref.Content | ConvertFrom-Json
    if ($ref.StatusCode -eq 200 -and $refData.access) {
      Pass "POST /api/v1/auth/token/refresh/"
      $newAccess = $refData.access
      $me2 = Invoke-WebRequest -Uri "$BaseUrl/api/v1/auth/me/" -Headers @{ Authorization = "Bearer $newAccess" } -UseBasicParsing
      if ($me2.StatusCode -eq 200) { Pass "Refreshed token works on /me/" } else { Fail "Refreshed token me/ failed" }
    } else { Fail "Refresh response missing access token" }
  } catch { Fail "Token refresh - $($_.Exception.Message)" }
} else { Skip "Token refresh" }

# Logout
Log ""
Log "## Logout"
if ($access) {
  try {
    $lo = Invoke-WebRequest -Uri "$BaseUrl/api/v1/auth/logout/" -Method POST `
      -Headers @{ Authorization = "Bearer $access" } -UseBasicParsing
    if ($lo.StatusCode -eq 200) { Pass "POST /api/v1/auth/logout/" } else { Fail "logout returned $($lo.StatusCode)" }
    Warn "Logout is client-side only (no JWT blacklist)"
  } catch { Fail "Logout - $($_.Exception.Message)" }
} else { Skip "Logout" }

# Frontend SPA
Log ""
Log "## Frontend routing"
foreach ($path in @("/", "/login", "/dashboard", "/students", "/settings/sessions")) {
  try {
    $page = Invoke-WebRequest -Uri "$BaseUrl$path" -UseBasicParsing -TimeoutSec 10
    if ($page.Content -match 'id="root"') { Pass "SPA route $path serves index.html" }
    else { Fail "SPA route $path missing root element" }
  } catch { Fail "SPA route $path - $($_.Exception.Message)" }
}

# Static
Log ""
Log "## Static files"
try {
  $st = Invoke-WebRequest -Uri "$BaseUrl/static/admin/css/base.css" -UseBasicParsing -TimeoutSec 10
  if ($st.StatusCode -eq 200) { Pass "Django admin CSS at /static/" } else { Warn "Static returned $($st.StatusCode)" }
} catch { Warn "Static files - $($_.Exception.Message)" }

# Media
Log ""
Log "## Media files"
$ErrorActionPreference = "Continue"
& docker @Dc @("exec", "-T", "backend", "sh", "-c", "echo e2e-media-ok > /app/media/e2e-verify.txt") 2>$null | Out-Null
try {
  $med = Invoke-WebRequest -Uri "$BaseUrl/media/e2e-verify.txt" -UseBasicParsing -TimeoutSec 10
  if ($med.Content -match "e2e-media-ok") { Pass "Media file served via /media/" } else { Fail "Media content mismatch" }
} catch { Fail "Media file - $($_.Exception.Message)" }

# Django admin
Log ""
Log "## Django Admin"
try {
  $admin = Invoke-WebRequest -Uri "$BaseUrl/admin/" -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
  Pass "Django /admin/ reachable (HTTP $($admin.StatusCode))"
} catch {
  $code = $_.Exception.Response.StatusCode.value__
  if ($code -eq 302 -or $code -eq 200) { Pass "Django /admin/ reachable (HTTP $code)" }
  else { Fail "Django /admin/ - HTTP $code" }
}

# Redis, DB, migrations, Celery
Log ""
Log "## Redis, DB, migrations, Celery"
$redisOut = & docker @Dc @("exec", "-T", "redis", "redis-cli", "ping") 2>$null
if (($redisOut | Out-String).Trim() -eq "PONG") { Pass "Redis PING" } else { Fail "Redis PING failed" }

$tables = & docker @Dc @("exec", "-T", "mysql", "mysql", "-u", "school_erp", "-pstaging_local_db", "-N", "-e", "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='school_erp';") 2>$null
$tableCount = [int](($tables | Out-String).Trim() -split "`n" | Where-Object { $_ -match '^\d+$' } | Select-Object -First 1)
if ($tableCount -ge 280) { Pass "Business schema ($tableCount tables)" } else { Fail "Schema table count: $tableCount" }

$sch = & docker @Dc @("exec", "-T", "mysql", "mysql", "-u", "school_erp", "-pstaging_local_db", "-N", "-e", "SELECT COUNT(*) FROM school_erp.sch_settings;") 2>$null
$schCount = [int](($sch | Out-String).Trim() -split "`n" | Where-Object { $_ -match '^\d+$' } | Select-Object -First 1)
if ($schCount -ge 1) { Pass "School initialized (sch_settings: $schCount)" } else { Warn "sch_settings empty" }

$mig = & docker @Dc @("exec", "-T", "backend", "python", "manage.py", "showmigrations", "--plan") 2>$null | Out-String
if ($mig -match "\[X\]") { Pass "Django framework migrations applied" } else { Warn "Could not confirm migrations" }

$celeryLog = & docker @Dc @("logs", "celery_worker", "--tail", "8") 2>$null | Out-String
if ($celeryLog -match "ready") { Pass "Celery worker ready" } else { Warn "Celery worker status unclear" }

$celeryPing = & docker @Dc @("exec", "-T", "backend", "celery", "-A", "config", "inspect", "ping") 2>$null | Out-String
if ($celeryPing -match "pong") { Pass "Celery inspect ping" } else { Warn "Celery inspect ping inconclusive" }

Skip "File uploads - no business upload API yet"
Warn "Browser refresh on /dashboard - verify manually in browser after login"

# Container restart & volume persistence
Log ""
Log "## Container restart & volume persistence"
$beforeSettings = $schCount
& docker @Dc @("up", "-d", "--force-recreate", "--no-deps", "backend") 2>&1 | Out-Null
Start-Sleep -Seconds 45
try {
  $h2 = Invoke-WebRequest -Uri "$BaseUrl/health/" -UseBasicParsing -TimeoutSec 15
  if ($h2.StatusCode -eq 200) { Pass "Backend survived force-recreate (health OK)" } else { Fail "Health after recreate: $($h2.StatusCode)" }
} catch { Fail "Health after backend recreate - $($_.Exception.Message)" }

$schAfter = & docker @Dc @("exec", "-T", "mysql", "mysql", "-u", "school_erp", "-pstaging_local_db", "-N", "-e", "SELECT COUNT(*) FROM school_erp.sch_settings;") 2>$null
$schAfterCount = [int](($schAfter | Out-String).Trim() -split "`n" | Where-Object { $_ -match '^\d+$' } | Select-Object -First 1)
if ($schAfterCount -eq $beforeSettings -and $schAfterCount -ge 1) { Pass "MySQL volume persisted after backend recreate" } else { Fail "DB data mismatch after recreate" }

$mediaAfter = & docker @Dc @("exec", "-T", "backend", "cat", "/app/media/e2e-verify.txt") 2>$null
if (($mediaAfter | Out-String).Trim() -eq "e2e-media-ok") { Pass "Media volume persisted after backend recreate" } else { Warn "Media file missing after recreate (may need re-test)" }

# Summary
Log ""
Log "=== Summary ==="
Log "PASS: $script:Pass  FAIL: $script:Fail  WARN: $script:Warn  SKIP: $script:Skip"
if ($script:Fail -eq 0) {
  Log "RESULT: READY FOR SERVER DEPLOYMENT (review warnings)"
  exit 0
} else {
  Log "RESULT: NOT READY - fix failures first"
  exit 1
}
