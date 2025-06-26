ALTER TABLE "grocery_items" ADD COLUMN "checked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "grocery_items" ADD COLUMN "checked_at" timestamp;