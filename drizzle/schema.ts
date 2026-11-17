import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Core user table backing Manus OAuth. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const memberProfiles = mysqlTable("member_profiles", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  recipientName: varchar("recipientName", { length: 100 }),
  phone: varchar("phone", { length: 30 }),
  city: varchar("city", { length: 60 }),
  district: varchar("district", { length: 60 }),
  address: varchar("address", { length: 300 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNo: varchar("orderNo", { length: 32 }).notNull().unique(),
  openId: varchar("openId", { length: 64 }).notNull(),
  recipientName: varchar("recipientName", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  email: varchar("email", { length: 320 }),
  shippingMethod: mysqlEnum("shippingMethod", ["home_delivery", "store_pickup"]).notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["cash_on_delivery", "pay_at_store"]).notNull(),
  invoiceType: mysqlEnum("invoiceType", ["personal", "company"]).default("personal").notNull(),
  invoiceTitle: varchar("invoiceTitle", { length: 100 }),
  taxId: varchar("taxId", { length: 8 }),
  city: varchar("city", { length: 60 }),
  district: varchar("district", { length: 60 }),
  address: varchar("address", { length: 300 }),
  subtotal: int("subtotal").notNull(),
  discount: int("discount").notNull(),
  shippingFee: int("shippingFee").notNull(),
  total: int("total").notNull(),
  itemsJson: text("itemsJson").notNull(),
  status: mysqlEnum("status", ["pending", "confirmed", "ready", "completed", "cancelled"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type MemberProfile = typeof memberProfiles.$inferSelect;
export type InsertMemberProfile = typeof memberProfiles.$inferInsert;
export type StoreOrder = typeof orders.$inferSelect;
export type InsertStoreOrder = typeof orders.$inferInsert;
