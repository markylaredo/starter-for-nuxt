export default defineEventHandler(async (event) => {
  assertAdminRequest(event);

  const body = await readBody<Partial<SendPushRequest>>(event);
  const message = await sendPushToTopic(normalizePushPayload(body || {}));

  return {
    message,
  };
});
