export IMPORT_DASH_HOST = http://127.0.0.1:3000
export IMPORT_DASH_USERNAME = admin
export IMPORT_DASH_PASSWORD = admin
export PMM_SERVER={PMM_SERVER:-pmm-server}

all: build pack disable install enable
	tput bel

build:
	cd pmm-app && npm run build && cd ..

pack:
	tar czf pmm-app.tar.gz pmm-app

install:
	docker exec ${PMM_SERVER} supervisorctl stop grafana
	docker exec ${PMM_SERVER} bash -c 'rm -rf /var/lib/grafana/plugins/pmm-*'
	docker cp pmm-app.tar.gz  ${PMM_SERVER}:/var/lib/grafana/plugins/
	docker exec ${PMM_SERVER} bash -c 'cd /var/lib/grafana/plugins/ && tar xzf pmm-app.tar.gz'
	docker exec ${PMM_SERVER} supervisorctl start grafana

disable:
	curl -X POST  --insecure 'https://admin:admin@localhost:443/graph/api/plugins/pmm-app/settings' -d 'enabled=false'

enable:
	curl -X POST  --insecure --retry-delay 5 --retry 5 'https://admin:admin@localhost:443/graph/api/plugins/pmm-app/settings' -d 'enabled=true'

test: pack disable install enable

clean:
	rm -r pmm-app/dist/
