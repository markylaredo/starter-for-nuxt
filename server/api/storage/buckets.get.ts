export default defineEventHandler(async () => {
  const buckets = await listBuckets();

  return {
    buckets,
  };
});
