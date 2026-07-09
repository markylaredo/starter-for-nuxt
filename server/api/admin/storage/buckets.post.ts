export default defineEventHandler(async (event) => {
  assertAdminRequest(event);

  const body = await readBody<Partial<CreateBucketRequest>>(event);
  const bucket = await createBucket(normalizeBucketPayload(body || {}));

  return {
    bucket,
  };
});
