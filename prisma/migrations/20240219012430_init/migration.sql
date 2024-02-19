-- CreateTable
CREATE TABLE `User` (
    `username` VARCHAR(191) NOT NULL,
    `uuid` VARCHAR(191) NOT NULL,
    `updateTime` INTEGER NOT NULL,
    `rawResponse` VARCHAR(191) NOT NULL,
    `abstractedResponse` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`uuid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
