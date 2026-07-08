# Nuxt + Appwrite Push Notification Demo

This Nuxt 3 app demonstrates browser push notifications using:

- Appwrite Auth for user sessions
- Appwrite Messaging topics, subscribers, and push messages
- Appwrite FCM provider for delivery
- Firebase Cloud Messaging for browser FCM tokens
- A service worker for background notifications

The user page lets a browser subscribe to a topic. The admin page lets an operator create topics
and send push messages to subscribers.

## Pages

- User subscription demo: `/push-notifications`
- Admin messaging management: `/admin-messaging`

## How The Flow Works

1. Admin creates an Appwrite Messaging topic.
2. User signs in, or uses the demo anonymous session.
3. Browser asks for notification permission.
4. Firebase Cloud Messaging returns a browser FCM token.
5. Appwrite stores that FCM token as an account push target.
6. Appwrite subscribes that target to the selected topic.
7. Admin sends a push message to the topic.
8. Browser receives the notification, even when the tab is minimized or closed.

## Requirements

- Node.js
- pnpm
- Appwrite project
- Firebase project with Cloud Messaging enabled
- Appwrite FCM push provider configured with a Firebase service account JSON

## 1. Install Dependencies

```bash
pnpm install
```

## 2. Configure Appwrite Project Values

In Appwrite Console:

1. Open your project.
2. Copy the project ID.
3. Confirm your Appwrite endpoint.

Add these values to `.env`:

```env
NUXT_PUBLIC_APPWRITE_ENDPOINT="https://your-appwrite-domain/v1"
NUXT_PUBLIC_APPWRITE_PROJECT_ID="your_project_id"
NUXT_PUBLIC_APPWRITE_PROJECT_NAME="Your Project Name"
```

This repo currently uses `lib/appwrite.ts` for the browser client. If you change projects, make
sure `lib/appwrite.ts` points to the same endpoint and project ID.

## 3. Create Appwrite API Key

The admin routes use a server-side Appwrite API key. This key must never be exposed to the browser.

In Appwrite Console:

1. Open your project.
2. Go to **Settings** or **API Keys**.
3. Create a new API key.
4. Add these Messaging scopes:
   - `topics.read`
   - `topics.write`
   - `messages.write`

Add it to `.env`:

```env
APPWRITE_API_KEY="your_appwrite_api_key"
```

If `/admin-messaging` shows an error like `missing scopes ["topics.read"]`, update this API key or
create a new one with the scopes above.

## 4. Create Appwrite FCM Provider

In Appwrite Console:

1. Open **Messaging**.
2. Open **Providers**.
3. Click **Create provider**.
4. Choose **FCM**.
5. Upload your Firebase service account JSON.
6. Enable the provider.
7. Copy the provider ID.

Add it to `.env`:

```env
NUXT_PUBLIC_APPWRITE_PUSH_PROVIDER_ID="your_appwrite_fcm_provider_id"
```

This provider is what Appwrite uses to send push messages through Firebase.

## 5. Configure Firebase Web App Values

The browser still needs Firebase Cloud Messaging to generate an FCM token.

In Firebase Console:

1. Open the same Firebase project used by the Appwrite FCM provider.
2. Go to **Project settings**.
3. Open the **General** tab.
4. Find or create a **Web app**.
5. Copy the Firebase config values.

Add them to `.env`:

```env
NUXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
NUXT_PUBLIC_FIREBASE_PROJECT_ID="your_firebase_project_id"
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.appspot.com"
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NUXT_PUBLIC_FIREBASE_APP_ID="your_firebase_app_id"
```

## 6. Create Firebase VAPID Key

The VAPID key is the public Web Push certificate key used by Firebase Messaging in browsers.

In Firebase Console:

1. Open **Project settings**.
2. Open the **Cloud Messaging** tab.
3. Find **Web Push certificates**.
4. Click **Generate key pair** if no key exists.
5. Copy the public key.

Add it to `.env`:

```env
NUXT_PUBLIC_FIREBASE_VAPID_KEY="your_web_push_certificate_key"
```

This value is public and is safe to expose in the browser.

## 7. Configure Admin Token

The admin page calls Nuxt server routes that create topics and send push messages. Those routes are
protected by a simple admin token.

Generate a long random token and add it to `.env`:

```env
ADMIN_API_TOKEN="your_long_random_admin_token"
```

When you open `/admin-messaging`, paste this same token into the **Admin API token** field.

## 8. Example `.env`

```env
NUXT_PUBLIC_APPWRITE_ENDPOINT="https://your-appwrite-domain/v1"
NUXT_PUBLIC_APPWRITE_PROJECT_ID="your_project_id"
NUXT_PUBLIC_APPWRITE_PROJECT_NAME="Your Project"
NUXT_PUBLIC_APPWRITE_PUSH_PROVIDER_ID="your_appwrite_fcm_provider_id"

NUXT_PUBLIC_FIREBASE_API_KEY="your_firebase_api_key"
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
NUXT_PUBLIC_FIREBASE_PROJECT_ID="your_firebase_project_id"
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.appspot.com"
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NUXT_PUBLIC_FIREBASE_APP_ID="your_firebase_app_id"
NUXT_PUBLIC_FIREBASE_VAPID_KEY="your_web_push_certificate_key"

APPWRITE_API_KEY="your_server_side_appwrite_api_key"
ADMIN_API_TOKEN="your_long_random_admin_token"
```

Do not commit `.env`. It contains server-side secrets.

## 9. Run The App

```bash
pnpm dev
```

Open:

```text
http://localhost:3000/admin-messaging
http://localhost:3000/push-notifications
```

If port 3000 is busy, Nuxt will use another port such as 3001.

## 10. Create A Topic

From the browser:

1. Open `/admin-messaging`.
2. Paste your `ADMIN_API_TOKEN`.
3. Enter a topic ID, for example `announcements`.
4. Enter a name, for example `Announcements`.
5. Choose subscription access:
   - **Signed-in users** for normal app users.
   - **Public/guest allowed** only for demos or public announcements.
6. Click **Create or ensure topic**.

From curl:

```bash
curl -X POST http://localhost:3000/api/admin/messaging/topics \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_API_TOKEN" \
  -d '{"topicId":"announcements","name":"Announcements","subscribe":["users"]}'
```

Use `["any"]` instead of `["users"]` only when you want public subscription access.

## 11. Subscribe A Browser

1. Open `/push-notifications`.
2. Sign in with Appwrite Auth.
3. For local testing, click **Continue as demo user** to create an anonymous session.
4. Select a topic from the dropdown.
5. Toggle **Receive announcement pushes** on.
6. Allow browser notification permission.

After success, the page should show:

- An FCM token
- An Appwrite target ID
- Subscription status as on

Important: Appwrite push targets require an Appwrite account session. Even public topics still need
a session because `account.createPushTarget()` creates the target under an account.

## 12. Send A Push Message

From the browser:

1. Open `/admin-messaging`.
2. Paste your `ADMIN_API_TOKEN`.
3. Select a topic.
4. Enter a title and body.
5. Click **Send push**.

From curl:

```bash
curl -X POST http://localhost:3000/api/admin/messaging/push \
  -H "Content-Type: application/json" \
  -H "x-admin-token: $ADMIN_API_TOKEN" \
  -d '{"topicId":"announcements","title":"New announcement","body":"A new announcement is available."}'
```

If the browser tab is open, foreground messages appear on `/push-notifications`. If the tab is
closed or minimized, the service worker shows a system notification.

## 13. Automated Account Or Topic Creation

For production, topic creation should happen in your backend/admin workflow, not from the public
browser.

Examples:

- Create a global `announcements` topic during app setup.
- Create a department topic when an admin creates a department.
- Create a user-specific topic after account creation if the app needs private user notifications.

Recommended production flow:

1. Backend creates or confirms the Appwrite account.
2. Backend creates any required Messaging topics through `/api/admin/messaging/topics` or directly
   through Appwrite server APIs.
3. User logs in.
4. Browser registers a push target.
5. Browser subscribes that target to allowed topics.
6. Admin/backend sends push messages to those topics.

## 14. Troubleshooting

### `missing scopes ["topics.read"]`

Your `APPWRITE_API_KEY` is missing the `topics.read` scope. Add:

- `topics.read`
- `topics.write`
- `messages.write`

Then restart Nuxt.

### `User (role: guests) missing scopes ["targets.write"]`

The browser is not signed in to Appwrite. Sign in first, or use **Continue as demo user** for local
testing.

### Service worker script threw an exception

Clear the old service worker:

1. Open browser DevTools.
2. Go to **Application**.
3. Open **Service Workers**.
4. Unregister `firebase-messaging-sw.js`.
5. Hard refresh the page.

### No notification appears

Check:

- Browser notification permission is granted.
- The selected topic exists.
- The browser shows an Appwrite target ID.
- The Appwrite FCM provider is enabled.
- The Appwrite FCM provider has the Firebase service account JSON uploaded.
- The message was sent to the same topic the browser subscribed to.

## Server Routes

- `GET /api/messaging/topics`
  Returns safe topic summaries for the user subscription page.

- `POST /api/admin/messaging/topics`
  Creates or confirms an Appwrite Messaging topic. Requires `x-admin-token`.

- `POST /api/admin/messaging/push`
  Creates the topic if missing and sends a push message to subscribers. Requires `x-admin-token`.

## Useful Commands

```bash
pnpm dev
pnpm build
```
