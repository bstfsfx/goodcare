CREATE TABLE `member_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`recipientName` varchar(100),
	`phone` varchar(30),
	`city` varchar(60),
	`district` varchar(60),
	`address` varchar(300),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `member_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `member_profiles_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderNo` varchar(32) NOT NULL,
	`openId` varchar(64) NOT NULL,
	`recipientName` varchar(100) NOT NULL,
	`phone` varchar(30) NOT NULL,
	`email` varchar(320),
	`shippingMethod` enum('home_delivery','store_pickup') NOT NULL,
	`paymentMethod` enum('cash_on_delivery','pay_at_store') NOT NULL,
	`city` varchar(60),
	`district` varchar(60),
	`address` varchar(300),
	`subtotal` int NOT NULL,
	`discount` int NOT NULL,
	`shippingFee` int NOT NULL,
	`total` int NOT NULL,
	`itemsJson` text NOT NULL,
	`status` enum('pending','confirmed','ready','completed','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNo_unique` UNIQUE(`orderNo`)
);
