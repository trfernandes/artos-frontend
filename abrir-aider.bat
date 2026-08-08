@echo off
wt.exe new-tab --title "Aider Frontend" -d "D:\artos_frontend" pwsh.exe -NoExit -Command "aider --model openrouter/moonshotai/kimi-k2.7-code" ; new-tab --title "Aider Backend" -d "D:\artos\backend" pwsh.exe -NoExit -Command "aider --model openrouter/moonshotai/kimi-k2.7-code"
