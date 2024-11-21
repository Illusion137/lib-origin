tsc --noEmit
if ( $LASTEXITCODE != 0 ) Console-WriteLine "Failed to Compile Typescript";
tslint --project tsconfig.json --config tslint.json
if ( $LASTEXITCODE != 0 ) Console-WriteLine "Failed to Lint Typescript";