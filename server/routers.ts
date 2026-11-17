import { z } from "zod";
import { categories, calculateQuote, products } from "../shared/store";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

const quoteInput = z.object({
  items: z.array(z.object({ productId: z.string().min(1).max(80), quantity: z.number().int().min(1).max(99) })).max(30),
  shippingMethod: z.enum(["home_delivery", "store_pickup"]),
});

const profileInput = z.object({
  recipientName: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[0-9+()\- ]{8,30}$/, "請輸入有效聯絡電話"),
  city: z.string().trim().max(60).optional().default(""),
  district: z.string().trim().max(60).optional().default(""),
  address: z.string().trim().max(300).optional().default(""),
});

const createOrderInput = profileInput.extend({
  email: z.string().trim().email().max(320).optional().or(z.literal("")),
  shippingMethod: z.enum(["home_delivery", "store_pickup"]),
  paymentMethod: z.enum(["cash_on_delivery", "pay_at_store"]),
  invoiceType: z.enum(["personal", "company"]),
  invoiceTitle: z.string().trim().max(100).optional().default(""),
  taxId: z.string().trim().regex(/^\d{8}$/).optional().default(""),
  items: quoteInput.shape.items,
}).superRefine((value, context) => {
  if (value.invoiceType === "company" && !value.invoiceTitle) context.addIssue({ code: "custom", path: ["invoiceTitle"], message: "公司戶請填寫發票抬頭" });
  if (value.invoiceType === "company" && !/^\d{8}$/.test(value.taxId)) context.addIssue({ code: "custom", path: ["taxId"], message: "請輸入 8 位統一編號" });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  store: router({
    catalog: publicProcedure.query(() => ({ categories, products })),
    quote: publicProcedure.input(quoteInput).query(({ input }) => calculateQuote(input.items, input.shippingMethod)),
    createOrder: protectedProcedure.input(createOrderInput).mutation(async ({ ctx, input }) => {
      if (input.shippingMethod === "home_delivery" && (!input.city || !input.district || input.address.length < 5)) {
        throw new Error("宅配訂單請填寫完整收件地址");
      }
      if (input.shippingMethod === "store_pickup" && input.paymentMethod !== "pay_at_store") throw new Error("門市取貨請選擇門市付款");
      if (input.shippingMethod === "home_delivery" && input.paymentMethod !== "cash_on_delivery") throw new Error("目前宅配訂單僅提供貨到付款");
      const quote = calculateQuote(input.items, input.shippingMethod);
      const orderNo = `GC${Date.now().toString().slice(-9)}${Math.floor(Math.random() * 900 + 100)}`;
      const saved = await db.insertOrder({
        orderNo,
        openId: ctx.user.openId,
        recipientName: input.recipientName,
        phone: input.phone,
        email: input.email || ctx.user.email || null,
        shippingMethod: input.shippingMethod,
        paymentMethod: input.paymentMethod,
        invoiceType: input.invoiceType,
        invoiceTitle: input.invoiceType === "company" ? input.invoiceTitle : null,
        taxId: input.invoiceType === "company" ? input.taxId : null,
        city: input.city || null,
        district: input.district || null,
        address: input.address || null,
        subtotal: quote.subtotal,
        discount: quote.discount,
        shippingFee: quote.shippingFee,
        total: quote.total,
        itemsJson: JSON.stringify(quote.items),
        status: "pending",
      });
      if (!saved) throw new Error("訂單建立失敗，請稍後再試");
      await db.saveMemberProfile({
        openId: ctx.user.openId,
        recipientName: input.recipientName,
        phone: input.phone,
        city: input.city || null,
        district: input.district || null,
        address: input.address || null,
      });
      return { orderNo: saved.orderNo, total: saved.total, status: saved.status };
    }),
    myOrders: protectedProcedure.query(({ ctx }) => db.listOrdersForMember(ctx.user.openId)),
    getOrder: protectedProcedure.input(z.object({ orderNo: z.string().min(5).max(32) })).query(({ ctx, input }) => db.getOrderForMember(input.orderNo, ctx.user.openId)),
  }),
  member: router({
    profile: protectedProcedure.query(({ ctx }) => db.getMemberProfile(ctx.user.openId)),
    saveProfile: protectedProcedure.input(profileInput).mutation(({ ctx, input }) => db.saveMemberProfile({ openId: ctx.user.openId, ...input })),
  }),
});

export type AppRouter = typeof appRouter;
