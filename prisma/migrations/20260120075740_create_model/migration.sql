-- CreateTable
CREATE TABLE `Member` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `grade` ENUM('SILVER', 'GOLD', 'VIP') NOT NULL DEFAULT 'SILVER',
    `status` ENUM('ACTIVE', 'DORMANT', 'WITHDRAWN') NOT NULL DEFAULT 'ACTIVE',
    `role` ENUM('USER', 'ADMIN') NOT NULL,

    UNIQUE INDEX `Member_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
