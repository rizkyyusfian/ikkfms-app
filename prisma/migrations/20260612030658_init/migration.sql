-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Laki-laki', 'Perempuan');

-- CreateEnum
CREATE TYPE "Education" AS ENUM ('SD', 'SMP', 'SMA', 'SMK', 'D3', 'S1', 'S2', 'S3', 'LAINNYA');

-- CreateEnum
CREATE TYPE "FamilyStatus" AS ENUM ('Istri', 'Anak', 'Cucu', 'Menantu', 'Orang Tua', 'Lainnya');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "families" (
    "id" SERIAL NOT NULL,
    "family_name" TEXT NOT NULL,
    "head_nik" TEXT NOT NULL,
    "head_name" TEXT NOT NULL,
    "head_birth_place" TEXT,
    "head_birth_date" DATE,
    "head_gender" "Gender" NOT NULL DEFAULT 'Laki-laki',
    "head_job" TEXT,
    "head_education" "Education",
    "head_phone" TEXT,
    "home_address" TEXT,
    "wife_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" SERIAL NOT NULL,
    "family_id" INTEGER NOT NULL,
    "nik" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birth_place" TEXT,
    "birth_date" DATE,
    "gender" "Gender",
    "family_status" "FamilyStatus" NOT NULL DEFAULT 'Anak',
    "job" TEXT,
    "education" "Education",
    "phone" TEXT,
    "child_order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "families_head_nik_key" ON "families"("head_nik");

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "families"("id") ON DELETE CASCADE ON UPDATE CASCADE;
