## ШПАРГАЛКА №1: Docker + Docker Compose

### Основные команды Docker

```bash
docker --version                    # версия
docker ps                           # запущенные контейнеры
docker ps -a                        # все контейнеры (включая остановленные)
docker images                       # образы
docker logs <container_name>        # логи
docker exec -it <container> bash    # зайти внутрь
docker stop <container>             # остановить
docker rm <container>               # удалить
docker rmi <image>                  # удалить образ

Docker Compose (самое важное)

docker compose up -d --build        # собрать и запустить в фоне
docker compose down                 # остановить и удалить контейнеры
docker compose ps                   # статус сервисов
docker compose logs web             # логи сервиса web
docker compose logs db --tail=50    # последние 50 строк логов db
docker compose restart web          # перезапустить один сервис

Полезные флаги
--build — пересобрать образы

-d — в фоне (detached)

--force-recreate — пересоздать контейнеры

Главное правило
Если у тебя есть docker-compose.yml — используй docker compose. Если запускаешь один контейнер — используй docker.

---

### 📄 `sections/linux.md`

```markdown
## ШПАРГАЛКА №2: Linux (Bash)

### Навигация и файлы

```bash
ls -la                     # показать все файлы (включая скрытые)
cd /home/devops            # перейти в папку
pwd                        # показать текущую папку
cat file.txt               # посмотреть содержимое файла
tail -f /var/log/app.log   # следить за логом в реальном времени

