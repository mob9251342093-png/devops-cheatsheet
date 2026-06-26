grep "error" app.log       # найти строки с текстом
grep -i "error" app.log    # поиск без учёта регистра
grep -v "info" app.log     # все строки, КРОМЕ info
wc -l app.log              # количество строк в файле
