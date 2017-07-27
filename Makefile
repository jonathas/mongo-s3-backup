install:
	@echo "========== Installing dependencies =========="
	@echo
	yarn install
	@echo
	@echo "========== Generating files =========="
	@echo
	npm run build
	@echo
	@echo "========== Building infrastructure =========="
	@echo
	-cd infra/cron && docker-compose build
	@echo
	@echo "========== Starting container =========="
	@echo
	-cd infra/cron && docker-compose up -d
	@echo
	@echo "========== Testing the code and writing coverage =========="
	@echo
	npm test
	@echo
	@echo
	@echo "Enjoy ;)"

no-docker:
	@echo "========== Installing dependencies =========="
	@echo
	yarn install
	@echo
	@echo "========== Testing the code and writing coverage =========="
	@echo
	npm test
	@echo
	@echo
	@echo "Enjoy ;)"

uninstall:
	@echo "========== Cleaning the project =========="
	@echo
	-rm -R bin node_modules coverage
	@echo
	@echo "========== Destroying infrastructure =========="
	docker-compose kill
	docker-compose rm -f
	@echo "Done."

purge:
	@echo "========== Cleaning the project =========="
	@echo
	-rm -R bin node_modules coverage
	@echo
	@echo "========== Destroying infrastructure =========="
	-cd infra/cron && docker-compose kill
	-cd infra/cron && docker-compose rm -f
	-cd infra/cron && docker rmi mongo-s3-backup
	@echo "Done."
