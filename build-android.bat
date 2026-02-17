@echo off
REM Build and generate Android APK in one command
REM Usage: build-android.bat

echo Building web assets...
call npm run build
if errorlevel 1 goto :error

echo Syncing with Capacitor...
call npx cap sync android
if errorlevel 1 goto :error

echo Building Android APK...
cd android
call gradlew.bat assembleDebug
if errorlevel 1 (
    cd ..
    goto :error
)
cd ..

if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    echo APK ready: android\app\build\outputs\apk\debug\app-debug.apk
) else (
    goto :error
)
goto :end

:error
echo Build failed!
exit /b 1

:end
