self.addEventListener("push", (event) => {
  const payload = readPushPayload(event);
  const notification = payload.notification || {};
  const data = payload.data || {};
  const title = notification.title || data.title || "Announcement";

  event.waitUntil(
    self.registration.showNotification(title, {
      body: notification.body || data.body || "A new announcement is available.",
      icon: notification.icon || data.icon || "/appwrite.svg",
      badge: notification.badge || "/appwrite.svg",
      image: notification.image,
      data,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow("/push-notifications");
        }

        return undefined;
      }),
  );
});

function readPushPayload(event) {
  if (!event.data) {
    return {};
  }

  try {
    return event.data.json();
  } catch {
    return {
      notification: {
        title: "Announcement",
        body: event.data.text(),
      },
    };
  }
}
