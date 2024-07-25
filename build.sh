#!/bin/bash
git add . && git commit -m"before update" && git push
rm -rf ../exampleDist
vite build -c vercelVite.config.js
cp -r example/exampleDist ../exampleDist
git checkout buildGithub
#rm -rf ./
cp -r ../exampleDist/* ./
cp -r ../ecctrl/.env ./
git add .
git commit -m"update"
git push
git checkout main
