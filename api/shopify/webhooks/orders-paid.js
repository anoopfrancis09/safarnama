import { handleOrderWebhook } from "../../../serverless/handleOrderWebhook.js";

export { config } from "../../../serverless/handleOrderWebhook.js";

export default async function handler(req, res) {
  await handleOrderWebhook(req, res, "orders/paid");
}
