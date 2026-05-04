.PHONY: up up-detached down reset logs ps shell-backend shell-frontend shell-db install-backend install-frontend

up:
	docker compose up --watch

up-detached:
	docker compose up --watch -d

down:
	docker compose down

reset:
	docker compose down -v

logs:
	docker compose logs -f

ps:
	docker compose ps

shell-backend:
	docker compose exec backend sh

shell-frontend:
	docker compose exec frontend sh

shell-db:
	docker compose exec postgres psql -U app_user -d app_db

# Use: make install-backend pkg=lodash
install-backend:
	docker compose exec backend npm install $(pkg)

install-frontend:
	docker compose exec frontend yarn add $(pkg)
