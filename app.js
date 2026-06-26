// ============================================================
// 1. Настройки
// ============================================================
var GITHUB_USER = 'mob9251342093-png';
var REPO_NAME = 'devops-cheatsheet';
var BRANCH = 'main';

// ============================================================
// 2. Функция получения списка файлов из папки sections/
// ============================================================
function getSectionsList(callback) {
    var url = 'https://api.github.com/repos/' + GITHUB_USER + '/' + REPO_NAME + '/contents/sections';
    fetch(url)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Не удалось получить список шпаргалок (HTTP ' + response.status + ')');
            }
            return response.json();
        })
        .then(function(data) {
            var files = data.filter(function(item) {
                return item.name.endsWith('.md') && item.type === 'file';
            });
            // Сортируем по имени
            files.sort(function(a, b) {
                return a.name.localeCompare(b.name);
            });
            callback(null, files);
        })
        .catch(function(error) {
            callback(error, null);
        });
}

// ============================================================
// 3. Функция загрузки содержимого шпаргалки
// ============================================================
function loadSectionContent(filename, callback) {
    var url = 'https://raw.githubusercontent.com/' + GITHUB_USER + '/' + REPO_NAME + '/' + BRANCH + '/sections/' + filename;
    fetch(url)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Не удалось загрузить шпаргалку (HTTP ' + response.status + ')');
            }
            return response.text();
        })
        .then(function(text) {
            callback(null, text);
        })
        .catch(function(error) {
            callback(error, null);
        });
}

// ============================================================
// 4. Конвертер Markdown → HTML (с автоматическими колонками)
// ============================================================
function convertMarkdownToHtml(md) {
    var html = md;
    // Заголовки
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Блоки кода ```bash ... ```
    html = html.replace(/```bash([\s\S]*?)```/g, function(match, code) {
        var lines = code.trim().split('\n');
        var htmlLines = lines.map(function(line) {
            var trimmed = line.trim();
            // Если строка начинается с # или // — это комментарий
            if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
                return '<div class="cmd-block"><span class="comment">' + trimmed + '</span></div>';
            }
            // Если есть комментарий через # или // в конце строки
            var comment = '';
            var cmd = trimmed;
            if (trimmed.includes(' # ')) {
                var parts = trimmed.split(' # ');
                cmd = parts[0];
                comment = ' # ' + parts.slice(1).join(' # ');
            } else if (trimmed.includes(' // ')) {
                var parts = trimmed.split(' // ');
                cmd = parts[0];
                comment = ' // ' + parts.slice(1).join(' // ');
            }
            if (comment) {
                return '<div class="cmd-block">' + cmd + ' <span class="comment">' + comment + '</span><button class="copy-btn" onclick="copyCmd(this)">Копировать</button></div>';
            }
            return '<div class="cmd-block">' + trimmed + '<button class="copy-btn" onclick="copyCmd(this)">Копировать</button></div>';
        });
        return htmlLines.join('');
    });

    // Таблицы (упрощённо)
    html = html.replace(/\|(.+)\|/g, function(match, row) {
        var cells = row.split('|').map(function(c) { return c.trim(); });
        if (cells.every(function(c) { return /^[-:]+$/.test(c); })) {
            return '';
        }
        var isHeader = cells.length > 1 && !cells.some(function(c) { return /^[-:]+$/.test(c); });
        var tag = isHeader ? 'th' : 'td';
        var tr = '<tr>' + cells.map(function(c) { return '<' + tag + '>' + c + '</' + tag + '>'; }).join('') + '</tr>';
        return tr;
    });

    // Обычный текст
    html = html.replace(/^\*\*(.*)\*\*$/gim, '<strong>$1</strong>');
    html = html.replace(/^\*(.*)\*$/gim, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    html = html.replace(/^- (.*)$/gim, '<li>$1</li>');
    html = html.replace(/\n/g, '<br>');

    // Оборачиваем списки в <ul>
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    html = html.replace(/<\/ul>\s*<ul>/g, '');

    return html;
}

// ============================================================
// 5. Копирование команды
// ============================================================
function copyCmd(btn) {
    var block = btn.parentElement;
    var text = block.textContent.replace('Копировать', '').trim();
    navigator.clipboard.writeText(text);
    btn.textContent = '✅';
    setTimeout(function() {
        btn.textContent = 'Копировать';
    }, 1200);
}

// ============================================================
// 6. Рендеринг главной страницы (список шпаргалок)
// ============================================================
function renderMainPage() {
    var container = document.getElementById('sectionList');
    if (!container) return;

    container.innerHTML = '<div class="loading">Загрузка списка шпаргалок...</div>';

    getSectionsList(function(err, files) {
        if (err) {
            container.innerHTML = '<div class="loading" style="color:#f85149;">❌ Ошибка: ' + err.message + '</div>';
            return;
        }
        if (files.length === 0) {
            container.innerHTML = '<div class="loading">📭 Пока нет шпаргалок. Добавь файлы в папку sections/.</div>';
            return;
        }

        container.innerHTML = '';
        files.forEach(function(file) {
            var name = file.name.replace('.md', '');
            var label = name.charAt(0).toUpperCase() + name.slice(1);
            var icon = getIcon(name);

            var card = document.createElement('a');
            card.className = 'section-card';
            card.href = 'section.html?file=' + encodeURIComponent(file.name);
            card.innerHTML = '<span class="icon">' + icon + '</span><span class="label">' + label + '</span>';
            container.appendChild(card);
        });
    });
}

// ============================================================
// 7. Рендеринг страницы шпаргалки
// ============================================================
function renderSectionPage() {
    var params = new URLSearchParams(window.location.search);
    var filename = params.get('file');
    if (!filename) {
        document.body.innerHTML = '<div class="container"><h1>❌ Не указана шпаргалка</h1><a href="/">Назад</a></div>';
        return;
    }

    var container = document.getElementById('sectionContent');
    if (!container) return;

    container.innerHTML = '<div class="loading">Загрузка шпаргалки...</div>';

    loadSectionContent(filename, function(err, content) {
        if (err) {
            container.innerHTML = '<div class="loading" style="color:#f85149;">❌ Ошибка загрузки: ' + err.message + '</div>';
            return;
        }

        var html = convertMarkdownToHtml(content);
        container.innerHTML = html;
    });
}

// ============================================================
// 8. Иконки для шпаргалок
// ============================================================
function getIcon(name) {
    var icons = {
        docker: '🐳',
        linux: '🐧',
        git: '📦',
        postgres: '🐘',
        cicd: '🔄',
        ssh: '🔒'
    };
    return icons[name.toLowerCase()] || '📄';
}

// ============================================================
// 9. Запуск
// ============================================================
if (document.getElementById('sectionList')) {
    renderMainPage();
}

if (document.getElementById('sectionContent')) {
    renderSectionPage();
}
