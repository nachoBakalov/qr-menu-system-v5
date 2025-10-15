# 📋 Инструкции за качване на GitHub

## Стъпка 1: Създай ново репозитори в GitHub

1. Отиди на https://github.com
2. Кликни на "New repository" (зеленото бутонче)
3. Попълни следните данни:
   - **Repository name**: `qr-menu-system-v5`
   - **Description**: `Complete QR Menu Management System for Restaurants - Node.js Backend`
   - **Visibility**: Public (или Private ако предпочиташ)
   - ❌ **НЕ** слагай отметка на "Add a README file" (ние вече имаме)
   - ❌ **НЕ** добавяй .gitignore (вече имаме)
   - ❌ **НЕ** избирай лиценз (можеш да добавиш по-късно)

4. Кликни "Create repository"

## Стъпка 2: Копирай URL на репозиторито

След създаване ще видиш страница с инструкции. Копирай HTTPS URL-а, който ще изглежда така:
```
https://github.com/YOUR_USERNAME/qr-menu-system-v5.git
```

## Стъпка 3: Добави remote origin

Използвай следните команди в PowerShell (замени YOUR_USERNAME със своето потребителско име):

```powershell
# Добави remote origin
git remote add origin https://github.com/YOUR_USERNAME/qr-menu-system-v5.git

# Провери че е добавен правилно
git remote -v

# Push първоначалния commit
git push -u origin master
```

## Стъпка 4: Провери в GitHub

След успешно качване отиди отново в GitHub репозиторито и ще видиш всички файлове са качени!

---

## 🔗 Готови команди (замени YOUR_USERNAME):

```powershell
git remote add origin https://github.com/YOUR_USERNAME/qr-menu-system-v5.git
git push -u origin master
```

---

## 📝 Следващи стъпки след качване:

1. **Добави описание** в GitHub репозиторито
2. **Добави topics/tags**: `qr-menu`, `restaurant`, `nodejs`, `typescript`, `prisma`
3. **Настрой GitHub Pages** за документация (опционално)
4. **Създай Issues** за планирани подобрения
5. **Настрой GitHub Actions** за CI/CD (опционално)

## 🛡️ За продукция:

- Създай отделен `.env` файл с реални стойности
- Настрой PostgreSQL база данни
- Конфигурирай домейн за FRONTEND_URL
- Добави SSL сертификат
- Настрой backup система за базата