import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertMemberProfile, InsertStoreOrder, InsertUser, memberProfiles, orders, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      const value = user[field] ?? null;
      values[field] = value;
      updateSet[field] = value;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getMemberProfile(openId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.select().from(memberProfiles).where(eq(memberProfiles.openId, openId)).limit(1);
  return result[0] ?? null;
}

export async function saveMemberProfile(profile: InsertMemberProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const values = {
    openId: profile.openId,
    recipientName: profile.recipientName ?? null,
    phone: profile.phone ?? null,
    city: profile.city ?? null,
    district: profile.district ?? null,
    address: profile.address ?? null,
  };
  await db.insert(memberProfiles).values(values).onDuplicateKeyUpdate({
    set: {
      recipientName: values.recipientName,
      phone: values.phone,
      city: values.city,
      district: values.district,
      address: values.address,
      updatedAt: new Date(),
    },
  });
  return getMemberProfile(profile.openId);
}

export async function insertOrder(order: InsertStoreOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  await db.insert(orders).values(order);
  const result = await db.select().from(orders).where(eq(orders.orderNo, order.orderNo)).limit(1);
  return result[0];
}

export async function listOrdersForMember(openId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  return db.select().from(orders).where(eq(orders.openId, openId)).orderBy(desc(orders.createdAt)).limit(50);
}

export async function getOrderForMember(orderNo: string, openId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available");
  const result = await db.select().from(orders).where(eq(orders.orderNo, orderNo)).limit(1);
  const order = result[0];
  return order?.openId === openId ? order : null;
}
