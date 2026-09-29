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

## Шаг 2. Загрузить на GitHub

Структура репозитория:

```text
work-time/
├── index.html
├── styles.css
├── app.js
├── config.js
├── manifest.webmanifest
├── sw.js
└── README.md
```

Загрузи эти файлы в новый GitHub repository и включи:

**Settings → Pages → Deploy from a branch → main → /(root)**

После публикации открой GitHub Pages URL.

## Шаг 3. Вставить Client ID

Есть два варианта.

### Вариант A — через приложение

Открой **Настройки → Google Sheets**, вставь OAuth Client ID и нажми **Подключить Google**.

### Вариант B — через `config.js`

Можно сразу записать Client ID:

```js
window.APP_CONFIG = {
  appTitle: 'Work Time',
  spreadsheetTitle: 'Work Time Tracker — Data',
  googleClientId: '1234567890-xxxxxxxxxxxxxxxx.apps.googleusercontent.com',
  defaultDailyNormMinutes: 480,
  defaultWorkdays: [1, 2, 3, 4, 5]
};
```

Client ID не является паролем. Google отдельно отмечает, что client secrets не используются для web applications. citeturn983700search0

## Шаг 4. Google Sheet

При первом подключении приложение пытается найти таблицу `Work Time Tracker — Data`. Если её нет, оно создаёт новую и заполняет структуру автоматически.

При необходимости в настройках можно указать конкретный Spreadsheet ID вручную.

## Excel

Кнопка экспорта выгружает Google Spreadsheet в `.xlsx`. Google Drive API поддерживает экспорт Google Workspace-файлов через `files.export`; для Google Workspace-файлов экспорт ограничен 10 MB. citeturn983700search4

## Резервные копии

Кнопка Backup одновременно:

1. скачивает JSON-файл на устройство;
2. сохраняет такой же JSON-файл в Google Drive.

При восстановлении сначала создаётся safety-copy текущих данных, после чего выбранная копия записывается обратно в Google Sheets.

## Важное про OAuth

Для личного приложения удобнее оставить OAuth-приложение в режиме тестирования и добавить свой Google-аккаунт как тестового пользователя. Для публичного распространения приложения набор scopes может потребовать дополнительной настройки и проверки Google OAuth consent screen. Официальная документация Google описывает этот процесс. citeturn983700search0turn983700search2

## Локальный запуск

Для корректного OAuth сайт лучше открывать через HTTP(S), а не через `file://`. Например:

```bash
python -m http.server 8080
```

После запуска открой:

```text
http://localhost:8080
```

И добавь `http://localhost:8080` в Authorized JavaScript origins в Google Cloud Console для локального тестирования. Google указывает тот же подход в JavaScript quickstart. citeturn983700search0
