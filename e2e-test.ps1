$base = "https://greenx-backend-yyti.onrender.com/api"
$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host " GreenX E2E Data Flow Test" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow

# ── 1. Register users ──
Write-Host "[1] REGISTER USERS" -ForegroundColor Cyan
$ts = Get-Date -Format "MMddHHmmss"
$adminReg = (Invoke-WebRequest -Uri "$base/auth/register" -Method POST -Body "{`"email`":`"e2e_${ts}_admin@test.com`",`"password`":`"Test9876!`",`"name`":`"E2E Admin`",`"role`":`"admin`"}" -ContentType "application/json" -UseBasicParsing -TimeoutSec 15).Content | ConvertFrom-Json
$fmReg = (Invoke-WebRequest -Uri "$base/auth/register" -Method POST -Body "{`"email`":`"e2e_${ts}_fm@test.com`",`"password`":`"Test9876!`",`"name`":`"E2E FieldMgr`",`"role`":`"fieldmanager`"}" -ContentType "application/json" -UseBasicParsing -TimeoutSec 15).Content | ConvertFrom-Json
$exReg = (Invoke-WebRequest -Uri "$base/auth/register" -Method POST -Body "{`"email`":`"e2e_${ts}_ex@test.com`",`"password`":`"Test9876!`",`"name`":`"E2E Expert`",`"role`":`"expert`"}" -ContentType "application/json" -UseBasicParsing -TimeoutSec 15).Content | ConvertFrom-Json
$loReg = (Invoke-WebRequest -Uri "$base/auth/register" -Method POST -Body "{`"email`":`"e2e_${ts}_lo@test.com`",`"password`":`"Test9876!`",`"name`":`"E2E LandOwner`",`"role`":`"landowner`"}" -ContentType "application/json" -UseBasicParsing -TimeoutSec 15).Content | ConvertFrom-Json

$at = $adminReg.data.token; $ft = $fmReg.data.token; $et = $exReg.data.token; $lt = $loReg.data.token
$adminId = $adminReg.data.user.id; $fmId = $fmReg.data.user.id; $exId = $exReg.data.user.id; $loId = $loReg.data.user.id

Write-Host "  Admin:  OK (role=$($adminReg.data.user.role), id=$adminId)" -ForegroundColor Green
Write-Host "  FM:     OK (role=$($fmReg.data.user.role), id=$fmId)" -ForegroundColor Green
Write-Host "  Expert: OK (role=$($exReg.data.user.role), id=$exId)" -ForegroundColor Green
Write-Host "  LO:     OK (role=$($loReg.data.user.role), id=$loId)" -ForegroundColor Green

# ── 2. Login test ──
Write-Host "`n[2] LOGIN TEST" -ForegroundColor Cyan
$loginRes = (Invoke-WebRequest -Uri "$base/auth/login" -Method POST -Body "{`"email`":`"e2e_${ts}_fm@test.com`",`"password`":`"Test9876!`"}" -ContentType "application/json" -UseBasicParsing -TimeoutSec 15).Content | ConvertFrom-Json
Write-Host "  FM login: success=$($loginRes.success) role=$($loginRes.data.user.role)" -ForegroundColor Green

# ── 3. /auth/me test ──
Write-Host "`n[3] TOKEN VALIDATION (/auth/me)" -ForegroundColor Cyan
$meRes = (Invoke-WebRequest -Uri "$base/auth/me" -Headers @{Authorization = "Bearer $ft" } -UseBasicParsing -TimeoutSec 10).Content | ConvertFrom-Json
Write-Host "  /auth/me: success=$($meRes.success) email=$($meRes.data.email) role=$($meRes.data.role)" -ForegroundColor Green

# ── 4. Role-protected endpoint access ──
Write-Host "`n[4] ROLE-BASED ACCESS CONTROL" -ForegroundColor Cyan
$endpoints = @(
    @{role = "Admin"; token = $at; path = "/admin/farms" },
    @{role = "FM"; token = $ft; path = "/fieldmanager/farms" },
    @{role = "Expert"; token = $et; path = "/expert/farms" },
    @{role = "LO"; token = $lt; path = "/landowner/farms" }
)
foreach ($ep in $endpoints) {
    try {
        $r = Invoke-WebRequest -Uri "$base$($ep.path)" -Headers @{Authorization = "Bearer $($ep.token)" } -UseBasicParsing -TimeoutSec 15
        $d = ($r.Content | ConvertFrom-Json)
        Write-Host "  $($ep.role) -> $($ep.path): 200 OK (count=$($d.data.Count))" -ForegroundColor Green
    }
    catch {
        Write-Host "  $($ep.role) -> $($ep.path): $($_.Exception.Response.StatusCode.Value__) FAIL" -ForegroundColor Red
    }
}

# ── 5. Admin lists users & assigns FM/Expert to a farm ──
Write-Host "`n[5] ADMIN: LIST USERS" -ForegroundColor Cyan
$usersRes = (Invoke-WebRequest -Uri "$base/admin/users" -Headers @{Authorization = "Bearer $at" } -UseBasicParsing -TimeoutSec 15).Content | ConvertFrom-Json
Write-Host "  Users: success=$($usersRes.success) count=$($usersRes.data.Count)" -ForegroundColor Green

# Get the first farm
$farmsRes = (Invoke-WebRequest -Uri "$base/admin/farms" -Headers @{Authorization = "Bearer $at" } -UseBasicParsing -TimeoutSec 15).Content | ConvertFrom-Json
if ($farmsRes.data.Count -gt 0) {
    $farmId = $farmsRes.data[0].id
    Write-Host "  Using farm: $($farmsRes.data[0].name) (ID: $farmId)" -ForegroundColor Green

    # Assign FM to farm
    Write-Host "`n[6] ADMIN: ASSIGN FM & EXPERT TO FARM" -ForegroundColor Cyan
    try {
        $r = Invoke-WebRequest -Uri "$base/admin/farms/assign-manager" -Method POST -Body "{`"farmId`":`"$farmId`",`"managerId`":`"$fmId`"}" -Headers @{Authorization = "Bearer $at"; "Content-Type" = "application/json" } -UseBasicParsing -TimeoutSec 15
        Write-Host "  FM assigned: $($r.StatusCode)" -ForegroundColor Green
    }
    catch { Write-Host "  FM assign: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Yellow }

    try {
        $r = Invoke-WebRequest -Uri "$base/admin/farms/assign-expert" -Method POST -Body "{`"farmId`":`"$farmId`",`"expertId`":`"$exId`"}" -Headers @{Authorization = "Bearer $at"; "Content-Type" = "application/json" } -UseBasicParsing -TimeoutSec 15
        Write-Host "  Expert assigned: $($r.StatusCode)" -ForegroundColor Green
    }
    catch { Write-Host "  Expert assign: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Yellow }

    # PATCH farm status to ACTIVE so FM can log sample
    try {
        $patchBody = "{`"status`":`"ACTIVE`"}"
        $patchUrl = "$base/admin/farms/$farmId"
        $r = Invoke-WebRequest -Uri $patchUrl -Method PATCH -Body $patchBody -Headers @{Authorization = "Bearer $at"; "Content-Type" = "application/json" } -UseBasicParsing -TimeoutSec 15
        Write-Host "  Farm status set to ACTIVE: $($r.StatusCode)" -ForegroundColor Green
    }
    catch { Write-Host "  Farm status PATCH: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Yellow }
}
else {
    Write-Host "  No farms found to test assignment" -ForegroundColor Yellow
    $farmId = $null
}

# ── 7. FM: List assigned farms ──
Write-Host "`n[7] FM: LIST ASSIGNED FARMS" -ForegroundColor Cyan
$fmFarms = (Invoke-WebRequest -Uri "$base/fieldmanager/farms" -Headers @{Authorization = "Bearer $ft" } -UseBasicParsing -TimeoutSec 15).Content | ConvertFrom-Json
Write-Host "  FM farms: success=$($fmFarms.success) count=$($fmFarms.data.Count)" -ForegroundColor Green

# ── 8. FM: Log a soil sample (multipart/form-data with 'data' part) ──
Write-Host "`n[8] FM: LOG SOIL SAMPLE" -ForegroundColor Cyan
if ($farmId) {
    try {
        $dataJson = "{`"farmId`":`"$farmId`",`"fieldManagerId`":`"$fmId`",`"gpsCoordinates`":`"17.9784,79.5941`",`"depthCm`":30,`"notes`":`"E2E test sample`"}"
        $boundary = [System.Guid]::NewGuid().ToString()
        $LF = "`r`n"
        $bodyLines = @(
            "--$boundary",
            "Content-Disposition: form-data; name=`"data`"",
            "Content-Type: application/json",
            "",
            $dataJson,
            "--$boundary--"
        ) -join $LF
        $sr = Invoke-WebRequest -Uri "$base/fieldmanager/samples" -Method POST -Body $bodyLines -Headers @{Authorization = "Bearer $ft" } -ContentType "multipart/form-data; boundary=$boundary" -UseBasicParsing -TimeoutSec 15
        $sd = ($sr.Content | ConvertFrom-Json)
        Write-Host "  Sample logged: success=$($sd.success)" -ForegroundColor Green
        if ($sd.data) {
            $sampleId = $sd.data.id
            Write-Host "  Sample ID: $sampleId status=$($sd.data.status)" -ForegroundColor Green
        }
    }
    catch {
        Write-Host "  Sample log: $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
        try { $sr2 = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream()); Write-Host "  Body: $($sr2.ReadToEnd())" } catch {}
    }
}
else {
    Write-Host "  Skipped - no farm" -ForegroundColor Yellow
}

# ── 9. FM: List samples ──
Write-Host "`n[9] FM: LIST SAMPLES" -ForegroundColor Cyan
$fmSamples = (Invoke-WebRequest -Uri "$base/fieldmanager/samples" -Headers @{Authorization = "Bearer $ft" } -UseBasicParsing -TimeoutSec 15).Content | ConvertFrom-Json
Write-Host "  FM samples: success=$($fmSamples.success) count=$($fmSamples.data.Count)" -ForegroundColor Green

# ── 10. Expert: List pending samples ──
Write-Host "`n[10] EXPERT: PENDING SAMPLES" -ForegroundColor Cyan
$exSamples = (Invoke-WebRequest -Uri "$base/expert/samples/pending" -Headers @{Authorization = "Bearer $et" } -UseBasicParsing -TimeoutSec 15).Content | ConvertFrom-Json
Write-Host "  Expert pending: success=$($exSamples.success) count=$($exSamples.data.Count)" -ForegroundColor Green

# ── 11. Admin: Pending samples ──
Write-Host "`n[11] ADMIN: PENDING SAMPLES" -ForegroundColor Cyan
$adSamples = (Invoke-WebRequest -Uri "$base/admin/samples/pending" -Headers @{Authorization = "Bearer $at" } -UseBasicParsing -TimeoutSec 15).Content | ConvertFrom-Json
Write-Host "  Admin pending: success=$($adSamples.success) count=$($adSamples.data.Count)" -ForegroundColor Green

# ── 12. Landowner: List farms and samples ──
Write-Host "`n[12] LANDOWNER: FARMS & SAMPLES" -ForegroundColor Cyan
$loFarms = (Invoke-WebRequest -Uri "$base/landowner/farms" -Headers @{Authorization = "Bearer $lt" } -UseBasicParsing -TimeoutSec 15).Content | ConvertFrom-Json
Write-Host "  LO farms: success=$($loFarms.success) count=$($loFarms.data.Count)" -ForegroundColor Green
$loSamples = (Invoke-WebRequest -Uri "$base/landowner/samples" -Headers @{Authorization = "Bearer $lt" } -UseBasicParsing -TimeoutSec 15).Content | ConvertFrom-Json
Write-Host "  LO samples: success=$($loSamples.success) count=$($loSamples.data.Count)" -ForegroundColor Green

# ── 13. Notifications ──
Write-Host "`n[13] NOTIFICATIONS" -ForegroundColor Cyan
foreach ($ep in @(@{r = "Admin"; t = $at; p = "/admin" }, @{r = "FM"; t = $ft; p = "/fieldmanager" }, @{r = "Expert"; t = $et; p = "/expert" }, @{r = "LO"; t = $lt; p = "/landowner" })) {
    try {
        $nr = (Invoke-WebRequest -Uri "$base$($ep.p)/notifications" -Headers @{Authorization = "Bearer $($ep.t)" } -UseBasicParsing -TimeoutSec 15).Content | ConvertFrom-Json
        $ur = (Invoke-WebRequest -Uri "$base$($ep.p)/notifications/unread-count" -Headers @{Authorization = "Bearer $($ep.t)" } -UseBasicParsing -TimeoutSec 15).Content | ConvertFrom-Json
        Write-Host "  $($ep.r): notifications=$($nr.data.Count) unread=$($ur.data)" -ForegroundColor Green
    }
    catch {
        Write-Host "  $($ep.r): notifications FAIL $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
    }
}

# ── 14. Stats ──
Write-Host "`n[14] STATS ENDPOINTS" -ForegroundColor Cyan
foreach ($ep in @(@{r = "Admin"; t = $at; p = "/admin/stats" }, @{r = "FM"; t = $ft; p = "/fieldmanager/stats" }, @{r = "Expert"; t = $et; p = "/expert/stats" }, @{r = "LO"; t = $lt; p = "/landowner/stats" })) {
    try {
        $sr = (Invoke-WebRequest -Uri "$base$($ep.p)" -Headers @{Authorization = "Bearer $($ep.t)" } -UseBasicParsing -TimeoutSec 15).Content | ConvertFrom-Json
        Write-Host "  $($ep.r) stats: success=$($sr.success)" -ForegroundColor Green
    }
    catch {
        Write-Host "  $($ep.r) stats: FAIL $($_.Exception.Response.StatusCode.Value__)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Yellow
Write-Host " E2E TEST COMPLETE" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Yellow
