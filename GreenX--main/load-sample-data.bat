@echo off
echo ================================================
echo   MANUAL SAMPLE DATA LOADER FOR ORACLE DATABASE
echo ================================================
echo.
echo This script will load sample data into your Oracle database.
echo.
echo PREREQUISITES:
echo   1. Oracle SQL*Plus must be installed
echo   2. Database must be running
echo   3. Backend should be stopped (to avoid conflicts)
echo.
echo DATABASE CONNECTION:
echo   - Host: localhost
echo   - Port: 1521
echo   - Service: XE
echo   - Schema: SYSTEM (or your schema)
echo.
pause
echo.
echo Stopping backend if running...
taskkill /F /IM java.exe 2>nul
timeout /t 3 /nobreak >nul
echo.
echo Loading sample data...
echo.
echo Please enter your Oracle password when prompted...
echo.

sqlplus SYSTEM/oracle@localhost:1521/XE @src\main\resources\db\migration\V4__sample_data.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================
    echo   SAMPLE DATA LOADED SUCCESSFULLY!
    echo ================================================
    echo.
    echo Total users: 14 ^(1 manager + 10 workers + 3 experts^)
    echo Total farms: 5 ^(100 acres total^)
    echo.
    echo LOGIN CREDENTIALS ^(all passwords: pass123^):
    echo   - Manager: manager@greenx.com
    echo   - Worker 1: worker1@greenx.com
    echo   - Soil Expert: soil.expert@greenx.com
    echo   - Crop Expert: crop.expert@greenx.com
    echo   - Pest Expert: pest.expert@greenx.com
    echo.
    echo Now starting backend...
    cd java-backend
    start /B java -jar target\farm-management-api-1.0.0.jar --server.port=8091
    echo.
    echo Wait 10 seconds for backend to start, then open:
    echo   http://localhost:8080
    echo.
) else (
    echo.
    echo ================================================
    echo   ERROR: Failed to load sample data
    echo ================================================
    echo.
    echo Please check:
    echo   1. Oracle database is running
    echo   2. SQL*Plus is installed
    echo   3. Database credentials are correct
    echo.
    echo Alternative: Use Oracle SQL Developer to run:
    echo   java-backend\src\main\resources\db\migration\V4__sample_data.sql
    echo.
)

pause
