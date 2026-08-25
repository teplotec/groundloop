.PHONY: install-python install-web test test-python test-web dev-api dev-web compose

UV ?= uv

install-python:
	$(UV) sync --dev

install-web:
	cd apps/web && npm install

test-python:
	$(UV) run ruff check src tests apps/api
	$(UV) run mypy
	$(UV) run pytest --cov=groundloop --cov-report=term-missing

test-web:
	cd apps/web && npm test && npm run typecheck && npm run build

test: test-python test-web

dev-api:
	$(UV) run uvicorn apps.api.main:app --reload --port 8000

dev-web:
	cd apps/web && GROUNDLOOP_API_URL=http://127.0.0.1:8000 npm run dev

compose:
	docker compose up --build
