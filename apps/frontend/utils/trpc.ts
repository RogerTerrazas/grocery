import { createTRPCReact } from "@trpc/react-query";
import { type AppRouter } from "../../../apps/backend/server/api/root";

export const trpc = createTRPCReact<AppRouter>();
