/*
  Warnings:

  - The primary key for the `categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `categories` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `clients` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `clients` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `menu_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `menu_items` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `menus` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `menus` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `templates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `templates` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `menu_id` on the `categories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `category_id` on the `menu_items` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `menu_id` on the `menu_items` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `client_id` on the `menus` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `template_id` on the `menus` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_menu_id_fkey";

-- DropForeignKey
ALTER TABLE "menu_items" DROP CONSTRAINT "menu_items_category_id_fkey";

-- DropForeignKey
ALTER TABLE "menu_items" DROP CONSTRAINT "menu_items_menu_id_fkey";

-- DropForeignKey
ALTER TABLE "menus" DROP CONSTRAINT "menus_client_id_fkey";

-- DropForeignKey
ALTER TABLE "menus" DROP CONSTRAINT "menus_template_id_fkey";

-- AlterTable
ALTER TABLE "categories" DROP CONSTRAINT "categories_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "menu_id",
ADD COLUMN     "menu_id" INTEGER NOT NULL,
ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "clients" DROP CONSTRAINT "clients_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "clients_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "menu_items" DROP CONSTRAINT "menu_items_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "category_id",
ADD COLUMN     "category_id" INTEGER NOT NULL,
DROP COLUMN "menu_id",
ADD COLUMN     "menu_id" INTEGER NOT NULL,
ADD CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "menus" DROP CONSTRAINT "menus_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "client_id",
ADD COLUMN     "client_id" INTEGER NOT NULL,
DROP COLUMN "template_id",
ADD COLUMN     "template_id" INTEGER NOT NULL,
ADD CONSTRAINT "menus_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "templates" DROP CONSTRAINT "templates_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "templates_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "menus_client_id_key" ON "menus"("client_id");

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "templates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
