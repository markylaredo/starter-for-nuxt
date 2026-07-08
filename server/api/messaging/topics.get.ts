export default defineEventHandler(async () => {
  const topics = await listTopics();

  return {
    topics,
  };
});
