rm -rf .git
git init
cp git_config .git/config
git add .
git commit -m "`date`"
git push -f
