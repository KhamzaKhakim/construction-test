import { App } from "@backend/index";
import { treaty } from "@elysia/eden";

export const api = treaty<App>("localhost:3000");
