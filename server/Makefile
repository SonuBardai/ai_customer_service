lint:
	ruff check --fix

fmt:
	ruff format

style:
	$(MAKE) lint
	$(MAKE) fmt

install:
	uv pip install -r requirements.txt --dev

venv:
	uv venv --python 3.11

shell:
	uv run python manage.py shell

run:
	uv run python manage.py runserver