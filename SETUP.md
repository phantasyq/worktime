# Work Time — настройка владельца

## Что нужно сделать один раз

### 1. Google Cloud
Создайте/выберите проект для Work Time.

Включите:
- Google Drive API
- Google Sheets API

В Google Auth Platform настройте приложение как **External** и создайте OAuth Client ID типа **Web application**.

Для GitHub Pages origin:

`https://phantasyq.github.io`

Добавьте этот адрес в **Authorized JavaScript origins**.

### 2. OAuth scopes
Эта версия специально использует только узкие non-sensitive scopes:

- `https://www.googleapis.com/auth/drive.file`
- `https://www.googleapis.com/auth/drive.appdata`

`drive.file` даёт приложению доступ только к файлам, которые оно создаёт/использует, а `drive.appdata` — к собственной конфигурации приложения. Это позволяет избежать широкого доступа ко всему Drive и чувствительного `spreadsheets` scope.

### 3. Production вместо Testing
После настройки OAuth переведите приложение в **In production**. Для production-приложения Google делает приложение доступным любому Google-аккаунту; для non-sensitive scopes дополнительная OAuth verification не обязательна. У режима Testing есть ограничения на тестовых пользователей, поэтому для публичного тестирования он не подходит.

### 4. Client ID
Откройте `config.js` и замените:

`PASTE_YOUR_OAUTH_CLIENT_ID.apps.googleusercontent.com`

на ваш реальный OAuth Client ID.

Это единственное изменение кода, которое должен сделать владелец приложения.

### 5. GitHub Pages
Залейте файлы в корень репозитория `phantasyq/worktime` и включите:

Settings → Pages → Deploy from a branch → `main` → `/(root)`.

После публикации приложение будет доступно по адресу:

`https://phantasyq.github.io/worktime/`

## Что делает новый пользователь

Пользователь не создаёт Google Cloud Project, не получает Client ID и не создаёт таблицу вручную.

1. Открывает приложение.
2. Нажимает **Войти через Google**.
3. Выбирает Google-аккаунт.
4. Разрешает доступ.
5. Работает.

Первый вход автоматически создаёт личную Google-таблицу. ID таблицы сохраняется в `appData` приложения, поэтому на следующем ПК/телефоне приложение само находит ту же таблицу после входа в тот же Google-аккаунт.

## Важно

Данные не хранятся в общем проекте владельца. Каждый Google-аккаунт получает свою таблицу.

Client ID является идентификатором веб-приложения и не является секретом. Client Secret в браузерный код добавлять нельзя.
