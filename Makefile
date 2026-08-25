.PHONY: test test-python test-web dev compose

PYTHON ?= python

install-python:
	$(PYTHON) -m pip install -e '.[dev]'

install-web:
	cd apps/web && npm install

test-python:
	ruff check src tests apps/api
	mypy
	pytest --cov=groundloop --cov-report=term-missing

test-web:
	cd apps/web && npm test && npm run typecheck && npm run build

test: test-python test-web

dev-api:
	$(PYTHON) -m uvicorn apps.api.main:app --reload --port 8000

dev-web:
	cd apps/web && GROUNDLOOP_API_URL=http://127.0.0.1:8000 npm run dev

compose:
	docker compose up --build
