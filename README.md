# Work Time — GitHub Pages + Google Sheets

Красивое адаптивное приложение для учёта рабочего времени. Фронтенд — обычный статический сайт, который можно разместить на GitHub Pages. Данные синхронизируются напрямую с Google Sheets через Google OAuth и Google Sheets/Drive API.

## Возможности

- учёт времени по задачам;
- дневная и месячная норма;
- баланс относительно нормы;
- отдельный объём времени, списанного в Jira;
- отпуск, больничный и Day off;
- календарь рабочего времени;
- быстрые шаблоны типовых задач;
- редактирование и удаление записей;
- встроенный старт/стоп таймер;
- экспорт всей Google Таблицы в Excel `.xlsx`;
- локальная JSON-резервная копия;
- резервная копия в Google Drive;
- восстановление из локального JSON или из Drive;
- автоматический поиск созданной таблицы по Google-аккаунту;
- адаптивный интерфейс для ПК и телефона;
- PWA-оболочка: сайт можно установить на домашний экран телефона.

## Как работает синхронизация

Приложение использует Google Identity Services для получения OAuth-доступа пользователя и напрямую вызывает Google Sheets API. Отдельный сервер для фронтенда не требуется. Google рекомендует использовать OAuth для web-приложений и указывает, что для web-клиента нужен OAuth Client ID; client secret для такого клиентского приложения не используется. citeturn983700search0turn983700search1

При первом подключении создаётся Google Spreadsheet с листами:

- `Records` — записи времени;
- `Days` — статусы дней;
- `Settings` — настройки нормы и графика;
- `TaskTemplates` — быстрые задачи.

Одна и та же таблица находится через Google Drive, поэтому после входа под тем же Google-аккаунтом приложение можно открыть на другом устройстве.

## Шаг 1. Создай Google Cloud project

1. Открой Google Cloud Console.
2. Создай проект.
3. Включи **Google Sheets API**. При использовании backup/Excel также нужен доступ к Google Drive API. Google описывает этот сценарий в официальных quickstart и документации Drive. citeturn983700search0turn983700search4
4. Настрой **Google Auth Platform / OAuth consent screen**.
5. Создай **OAuth Client ID → Web application**.
6. В **Authorized JavaScript origins** добавь адрес GitHub Pages, например:

```text
https://USERNAME.github.io
```

если приложение лежит в репозитории и открывается как `https://USERNAME.github.io/REPOSITORY/`, origin всё равно остаётся `https://USERNAME.github.io`.

Google прямо указывает, что для web-приложения OAuth Client ID привязывается к Authorized JavaScript origins. citeturn983700search0

### Scope

Приложение запрашивает:

```text
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/drive.file
```

Google рекомендует выбирать максимально узкие scopes, когда это возможно. citeturn983700search2

`spreadsheets` нужен для чтения и изменения табеля, `drive.file` — для созданной приложением таблицы и backup-файлов.

