# $rozecli_path = (Get-Location).Path
# Push-Location C:\dev\Illusi\lib-origin
ts-node --project C:\dev\Illusi\lib-origin\tsconfig.json -T C:\dev\Illusi\lib-origin\tools\roze-cli.ts @args
# Pop-Location