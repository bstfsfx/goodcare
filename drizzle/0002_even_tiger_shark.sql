ALTER TABLE `orders` ADD `invoiceType` enum('personal','company') DEFAULT 'personal' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `invoiceTitle` varchar(100);--> statement-breakpoint
ALTER TABLE `orders` ADD `taxId` varchar(8);