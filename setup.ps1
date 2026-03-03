<#
PowerShell setup script for the Farm Management project.
This will:
 1. Prompt for Oracle connection info and JWT secret
 2. Generate application.yml for backend
 3. Run the database migration script (requires sqlplus in PATH)
 4. Build the Java backend
 5. Generate .env.local for frontend
 6. (Optionally) start the backend and frontend servers

Usage:
  Open PowerShell, navigate to the repo root, and execute:
      .\setup.ps1

#>

function Prompt-Secret {
    param(
        [string]$Message
    )
    Write-Host $Message -NoNewline
    $secure = Read-Host -AsSecureString
    return [Runtime.InteropServices.Marshal]::PtrToStringAuto(
        [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    )
}

Write-Host "=== Farm Management Project Setup ===" -ForegroundColor Cyan

# Oracle connection
$oraHost = Read-Host "Oracle host (default localhost)"; if (-not $oraHost) { $oraHost = 'localhost' }
$oraPort = Read-Host "Oracle port (default 1521)"; if (-not $oraPort) { $oraPort = '1521' }
$oraService = Read-Host "Oracle service name (default ORCL)"; if (-not $oraService) { $oraService = 'ORCL' }
$oraUser = Read-Host "Oracle username (default oracle_user)"; if (-not $oraUser) { $oraUser = 'oracle_user' }
$oraPassword = Prompt-Secret "Oracle password: "

# JWT secret
$jwtSecret = Prompt-Secret "JWT secret (at least 32 characters, cannot be empty): "
if (-not $jwtSecret -or $jwtSecret.Length -lt 32) {
    Write-Host "JWT secret is too short, using default placeholder. Change it later." -ForegroundColor Yellow
    $jwtSecret = 'default_secret_change_me'
}

# Create backend application.yml
$applicationYml = @"
spring:
  datasource:
    url: jdbc:oracle:thin:@$oraHost:$oraPort:$oraService
    username: $oraUser
    password: $oraPassword

jwt:
  secret: $jwtSecret
  expiration: 86400000 # 24 hours in milliseconds

logging:
  level:
    root: INFO
    com.greenx: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
"@

$backendConfigPath = "java-backend\src\main\resources\application.yml"
Write-Host "Writing backend config to $backendConfigPath"
$applicationYml | Out-File -Encoding UTF8 $backendConfigPath

# Run migration script if sqlplus exists
$scriptPath = "java-backend\src\main\resources\db\migration\V1__init_schema.sql"
if (Get-Command sqlplus -ErrorAction SilentlyContinue) {
    Write-Host "Running migration script via sqlplus..."
    & sqlplus $oraUser/$oraPassword@$oraHost:$oraPort/$oraService @$scriptPath
} else {
    Write-Host "sqlplus not found in PATH; please run migration manually using SQLPlus or SQL Developer." -ForegroundColor Yellow
}

# Build backend
Write-Host "Building Java backend with Maven..."
Push-Location java-backend
if (Get-Command mvn -ErrorAction SilentlyContinue) {
    mvn clean package
} else {
    Write-Host "Maven not found. Please install Maven and rerun setup." -ForegroundColor Red
    Pop-Location
    exit 1
}
Pop-Location

# Create frontend environment file
$envContent = "VITE_JAVA_API_URL=http://localhost:8080/api`n"
Write-Host "Writing frontend environment file .env.local"
$envContent | Out-File -Encoding UTF8 ".env.local"

Write-Host "Setup complete. You can now start the backend and frontend servers." -ForegroundColor Green
Write-Host "Commands: `n  cd java-backend; java -jar target\farm-management-api-1.0.0.jar`n  npm install && npm run dev" -ForegroundColor Cyan

# Optionally start services now?
$startNow = Read-Host "Start backend & frontend now? (y/n)"
if ($startNow -eq 'y') {
    Write-Host "Starting backend in new window..."
    Start-Process powershell -ArgumentList "-NoExit","-Command","cd java-backend; java -jar target\farm-management-api-1.0.0.jar" 
    Write-Host "Installing frontend dependencies and starting dev server..."
    if (Test-Path "package.json") {
        npm install
        npm run dev
    }
}

Write-Host "Done." -ForegroundColor Cyan
