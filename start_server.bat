@echo off
echo Starting JanSeva AI Citizen Assistance Portal...
start http://localhost:8000
python -m http.server 8000
pause
