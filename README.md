**🛠️ SMARTSCHOLAR GIT WORKFLOW GUIDE**

This document explains how we (the SmartScholar team) will collaborate on this project using Git and GitHub.

**🔹 1. Branches**

main → clean, stable, production-ready code

dev → integration branch for new features

feature/<name> → each task/feature goes here (e.g. feature/landing-page, feature/login-form)

**🔹 2. Getting Started**

*Clone the repo:*

git clone https://github.com/YOUR-USERNAME/smartscholar.git

cd smartscholar


*Checkout dev:*

git checkout dev

git pull origin dev

**🔹 3. Starting New Work**

*Always branch off dev:*

git checkout dev

git pull origin dev

git checkout -b feature/your-feature-name


*Do your work, commit, and push:*

git add .

git commit -m "feat: short description of change"

git push -u origin feature/your-feature-name

**🔹 4. Pull Requests (PRs)**

After pushing your branch, open a Pull Request into dev on GitHub.

PR Title: Feature: Short description

PR Description: explain what changed + screenshots if UI.

Assign the other team member as reviewer.

After approval → Merge into dev (prefer “Squash and Merge” for clean history).

**🔹 5. Staying Up to Date**

*Before starting new work each day:*

git checkout dev

git pull origin dev

git checkout feature/your-feature-name

git merge dev


*If there are conflicts:*

Fix the conflict in code (choose the right version).

Run:

git add .

git commit

git push

**🔹 6. Simple Rules**

✅ Never code directly on main or dev

✅ Always branch off dev for new work

✅ Commit often with clear messages

✅ Push your branch and create a PR into dev

✅ Pull latest dev before starting your work
