export default defineEventHandler(async (event) => {
  assertAdminRequest(event);

  const body = await readBody<Partial<CreateTopicRequest>>(event);
  const topic = await ensureTopic(normalizeTopicPayload(body || {}));

  return {
    topic,
  };
});
