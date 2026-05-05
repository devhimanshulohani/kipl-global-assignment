.PHONY: up up-detached down reset logs ps shell-backend shell-frontend shell-db install-backend install-frontend migrate migrate-undo seed db-reset db-export zip

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

# --- Sequelize ---
migrate:
	docker compose exec backend npx sequelize-cli db:migrate

migrate-undo:
	docker compose exec backend npx sequelize-cli db:migrate:undo

seed:
	docker compose exec backend npx sequelize-cli db:seed:all

# Wipe DB volume, rebuild, run migrations + seeds. Use after changing the schema.
db-reset:
	docker compose down -v
	docker compose up -d --build --wait
	docker compose exec backend npx sequelize-cli db:migrate
	docker compose exec backend npx sequelize-cli db:seed:all

# Export current schema + data to database.sql (for the assignment submission)
db-export:
	docker compose exec -T postgres pg_dump -U app_user --inserts app_db > database.sql
	@echo "Wrote database.sql"

# Submission bundle: backend.zip, frontend.zip, database.sql
zip: db-export
	rm -f backend.zip frontend.zip
	cd backend  && zip -rq ../backend.zip  . -x 'node_modules/*' '.env' '.env.*' 'dist/*' '*.log' '.DS_Store'
	cd frontend && zip -rq ../frontend.zip . -x 'node_modules/*' '.env' '.env.*' 'dist/*' '*.log' '.DS_Store'
	@echo ""
	@ls -lh backend.zip frontend.zip database.sql
