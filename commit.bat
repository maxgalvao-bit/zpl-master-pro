@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1

REM ============================================================
REM  commit.bat - ZPLMaster Pro (G-Max Solutions)
REM  Uso:  commit.bat "feat: mensagem do commit"
REM
REM  NAO faz git add. Commita apenas o que ja esta no stage.
REM  O stage e montado pelo Claude; este script apenas confirma,
REM  protege contra segredo e oferece o push.
REM ============================================================

cd /d "%~dp0"

REM ---------- 1. mensagem obrigatoria ----------
if "%~1"=="" (
  echo.
  echo   ERRO: falta a mensagem do commit.
  echo.
  echo   Uso:  commit.bat "feat: descricao curta"
  echo   Prefixos: feat: ^| fix: ^| chore: ^| docs:
  echo.
  exit /b 1
)

REM ---------- 2. e um repositorio git? ----------
git rev-parse --git-dir >nul 2>&1
if errorlevel 1 (
  echo.
  echo   ERRO: esta pasta nao e um repositorio git.
  echo.
  exit /b 1
)

REM ---------- 3. lock preso de sessao anterior ----------
if exist ".git\index.lock" (
  echo.
  echo   AVISO: existe .git\index.lock preso.
  echo   Isso acontece quando o Claude roda git pela ponte do desktop.
  echo.
  set /p FIXLOCK="   Remover o lock e continuar? [s/N]: "
  if /i "!FIXLOCK!"=="s" (
    del /f /q ".git\index.lock"
    echo   Lock removido.
  ) else (
    echo   Abortado.
    exit /b 1
  )
)

REM ---------- 4. ha algo no stage? ----------
git diff --cached --quiet
if not errorlevel 1 (
  echo.
  echo   Nada no stage. Nada para commitar.
  echo.
  echo   Alteracoes na arvore de trabalho:
  git status --short
  echo.
  echo   O stage e montado pelo Claude. Peca o git add antes.
  echo.
  exit /b 1
)

REM ---------- 5. TRAVA DE SEGREDO ----------
REM  Bloqueia adicao/modificacao de qualquer .env no stage.
REM  Delecao (D) e permitida. .env.example e permitido.
set "SECRETLIST=%TEMP%\zplm_secret_%RANDOM%.txt"
git diff --cached --name-status > "%SECRETLIST%.all"
findstr /R /C:"^[AM].*\.env" "%SECRETLIST%.all" 2>nul | findstr /V /C:".env.example" > "%SECRETLIST%" 2>nul

for %%A in ("%SECRETLIST%") do set SECRETSIZE=%%~zA
if not defined SECRETSIZE set SECRETSIZE=0

if !SECRETSIZE! GTR 0 (
  echo.
  echo   ############################################################
  echo   #  BLOQUEADO: arquivo de ambiente no stage                 #
  echo   ############################################################
  echo.
  type "%SECRETLIST%"
  echo.
  echo   O repositorio zpl-master-pro e PUBLICO.
  echo   Commitar isso expoe as chaves do Supabase, Brevo e reCAPTCHA.
  echo.
  echo   Para tirar do stage:   git restore --staged .env.local
  echo.
  del /f /q "%SECRETLIST%" "%SECRETLIST%.all" >nul 2>&1
  exit /b 1
)
del /f /q "%SECRETLIST%" "%SECRETLIST%.all" >nul 2>&1

REM ---------- 6. branch atual ----------
set "BRANCH="
for /f "delims=" %%B in ('git rev-parse --abbrev-ref HEAD') do set "BRANCH=%%B"

echo.
echo   ------------------------------------------------------------
echo    Branch:    !BRANCH!
echo    Mensagem:  %~1
echo   ------------------------------------------------------------
echo.
echo   Sera commitado:
echo.
git diff --cached --stat
echo.

if /i "!BRANCH!"=="main" (
  echo   AVISO: voce esta na MAIN. O fluxo do projeto e desenvolver
  echo   na develop e fazer merge manual para a main.
  echo   Commit aqui vai para producao no proximo push.
  echo.
)

set /p GO="   Confirmar commit? [s/N]: "
if /i not "!GO!"=="s" (
  echo   Abortado. Nada foi commitado.
  exit /b 1
)

REM ---------- 7. commit ----------
git commit -m "%~1"
if errorlevel 1 (
  echo.
  echo   ERRO: o commit falhou.
  exit /b 1
)

echo.
echo   ------------------------------------------------------------
git log --oneline -1
echo   ------------------------------------------------------------
echo.

REM ---------- 8. push ----------
echo   Commit local feito. Ele NAO esta no GitHub ainda.
echo.
set /p DOPUSH="   Enviar para origin/!BRANCH! agora? [s/N]: "
if /i "!DOPUSH!"=="s" (
  git push -u origin !BRANCH!
  if errorlevel 1 (
    echo.
    echo   ERRO: o push falhou. O commit local esta seguro.
    exit /b 1
  )
  echo.
  echo   Enviado para origin/!BRANCH!.
  if /i "!BRANCH!"=="main" (
    echo   A Vercel vai disparar o deploy de producao automaticamente.
  ) else (
    echo.
    echo   LEMBRETE: producao so atualiza pela MAIN. Para publicar:
    echo     git checkout main
    echo     git merge !BRANCH!
    echo     git push origin main
    echo     git checkout !BRANCH!
  )
) else (
  echo.
  echo   NAO enviado. O commit existe so na sua maquina.
  echo   Em 2026 quatro meses de trabalho ficaram parados assim.
  echo   Quando quiser enviar:  git push -u origin !BRANCH!
)

echo.
endlocal
exit /b 0
