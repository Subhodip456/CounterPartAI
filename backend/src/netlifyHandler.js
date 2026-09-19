import serverless from "serverless-http";
import { app } from "./server.js";

const handle = serverless(app);
export const handler = (event, context) => handle({
  ...event,
  path: event.path.replace(/^\/\.netlify\/functions\/api(?=\/|$)/, "/api"),
}, context);
