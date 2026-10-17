# Публикация Work Time v3.1.1

## Обновление существующего GitHub Pages
1. Сделайте backup текущей Google Таблицы и экспорт JSON перед обновлением.
2. Распакуйте `work_time_v3.1.1_release.zip`. Все файлы находятся в корне архива; каталог `tests/` содержит проверочные тесты.
3. Замените файлы в корне `phantasyq/worktime` файлами из архива. Не удаляйте `config.js`: в нём хранится публичный OAuth Client ID приложения. Не добавляйте client secret/access token.
4. Commit в `main`, дождитесь зелёного `github-pages` deployment.
5. Откройте `https://phantasyq.github.io/worktime/` и сделайте Ctrl+F5. Новый Service Worker cache key `work-time-shell-v7` удаляет старый shell cache.

## Создание GitHub Release
1. В репозитории откройте Releases → Draft a new release.
2. Тег: `v3.1.1`; название: `Work Time v3.1.1 — Production calendar & session persistence`.
3. Текст релиза возьмите из `RELEASE_NOTES.md`.
4. Прикрепите ZIP `work_time_v3.1.1_release.zip`. Сам ZIP не обновляет GitHub Pages — сначала замените файлы в `main`.

## Проверка после публикации
- Вход через Google, создание/нахождение персональной таблицы, первый save.
- Перезагрузка той же вкладки в пределах жизни access token: приложение должно восстановить синхронизацию без OAuth окна.
- После истечения/отзыва токена отображается понятная кнопка повторного входа.
- Проверить выходной, праздник и рабочую субботу из российского календаря; ручных настроек праздников быть не должно.
- Проверить отпуск/больничный/Day off интервал, Jira-флаг и шаблон только с названием.
- Проверить запись, редактирование, удаление, Excel, backup/restore.
- Убедиться, что запись в Google Sheets не очищается при сетевой ошибке: листы заменяются одним атомарным `spreadsheets.batchUpdate`.

## Ограничение входа
GitHub Pages — статический клиент без серверной сессии. Access token Google сохраняется только в `sessionStorage` текущей вкладки и автоматически используется после reload до истечения срока. После expiry требуется user click для повторного OAuth-запроса — Google Identity Services требует user gesture при запросе нового access token. Для бесперебойной долгосрочной сессии между закрытиями вкладки нужен серверный backend/refresh token flow.
