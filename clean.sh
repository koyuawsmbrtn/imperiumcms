# dependencies
rm -rf node_modules/

# testing
rm -rf coverage/

# production
rm -rf build/

# misc
rm -f .DS_Store
rm -f .env.local
rm -f .env.development.local
rm -f .env.test.local
rm -f .env.production.local

rm -f npm-debug.log*
rm -f yarn-debug.log*
rm -f yarn-error.log*

rm -f package-lock.json

git checkout -- content
git checkout -- custom.css
git checkout -- src/params.json
