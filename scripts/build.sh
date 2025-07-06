npx tsc -p tsconfig.json
if [ $? -ne 0 ]; then
  exit 1
fi
eslint .
if [ $? -ne 0 ]; then
  exit 1
fi