clear_history:
	rm -rf .git
	cd server && rm -rf .git
	cd client && rm -rf .git

install:
	cd client && yarn
	cd ..
	cd server && uv pip install -r requirements.txt

migrate:
	cd server && uv run python manage.py migrate

run_client:
	cd client && yarn dev

run_server:
	cd server && uv run python manage.py runserver
