#!/bin/bash
set -e

echo "=== HomeTownPost Events — Project Setup ==="

# Backend
echo ""
echo "--- Setting up Django backend ---"
cd backend

python3 -m venv venv
source venv/bin/activate

pip install -r requirements.txt

cp .env.example .env
echo "  Edit backend/.env with your database credentials."

python manage.py migrate
python manage.py collectstatic --noinput

echo ""
echo "Create a superuser (admin):"
python manage.py createsuperuser

deactivate
cd ..

# Frontend
echo ""
echo "--- Setting up React frontend ---"
cd frontend
npm install
cd ..

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Start backend:  cd backend && source venv/bin/activate && python manage.py runserver"
echo "Start frontend: cd frontend && npm start"
echo ""
echo "Admin panel:    http://localhost:8000/admin/"
echo "API base:       http://localhost:8000/api/"
echo "Frontend:       http://localhost:3000"
