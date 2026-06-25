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
