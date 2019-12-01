@echo off
SETLOCAL

SET target="%1"

if [%1]==[] (
    SET /p target="How should the new project be called? "
)

xcopy .\00_Template "%target%\" /E

cd %target%

mklink /J node_modules ..\master_of_npm\node_modules
mklink /H package.json ..\master_of_npm\package.json
mklink /H package-lock.json ..\master_of_npm\package-lock.json

