# 🧩 @workstudio/integrations

Integration utilities and provider wrappers used by **Workstudio** to connect with common third-party services — including **Firebase**, **Stripe**, **n8n**, and **Supabase**.

This package provides lightweight **TypeScript classes** that wrap common operations for each provider, so you can integrate faster and focus on your product.

---

## 📦 Contents

* `src/index.ts` — package entry (re-exports providers)
* `src/providers/firebase.provider.ts` — Firebase full integration (Firestore, Auth, Storage, Realtime DB, Messaging)
* `src/providers/stripe.provider.ts` — Stripe helper (payment link generation)
* `src/providers/n8n.provider.ts` — n8n provider (stub)
* `src/providers/supabase.provider.ts` — Supabase provider (stub)

---

## ⚙️ Status

| Provider             | Status         | Features                                         |
| -------------------- | -------------- | ------------------------------------------------ |
| **FirebaseProvider** | ✅ Implemented  | Firestore, Auth, Storage, Realtime DB, Messaging |
| **StripeProvider**   | ✅ Implemented  | Payment link generation                          |
| **n8nProvider**      | 🧩 Placeholder | Constructor only                                 |
| **SupabaseProvider** | 🧩 Placeholder | None yet                                         |

> Prefer using the implemented providers (**Firebase**, **Stripe**) for production use.
> The others are ready for community contribution or future development.

---

## 🛠️ Installation

From the package root (the folder containing `package.json`):

```bash
cd packages/integrations/node
pnpm install
```

Available scripts (see `package.json`):

```bash
pnpm run dev   # Run with ts-node + nodemon for development
pnpm run build # Compile TypeScript to dist/
pnpm start     # Run built code (node dist/index.js)
```

---

## ⚡ Quick Usage

You can import provider classes directly from `src/providers` during development.
Example imports below assume local development — adjust paths when using the compiled `dist/` package.

---

### 🔥 FirebaseProvider Example

```ts
import FirebaseProvider from './src/providers/firebase.provider';

const fb = new FirebaseProvider({
  projectId: process.env.FIREBASE_PROJECT_ID!,
  apiKey: process.env.FIREBASE_API_KEY!,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
});

// Firestore
await fb.addDocument('products', { name: 'Chair', price: 49.99 });
const product = await fb.getDocument('products', 'docId');

// Auth
const user = await fb.createUser('alice@example.com', 'secret-password', 'Alice');
const signedIn = await fb.loginUser('alice@example.com', 'secret-password');

// Storage
await fb.uploadFile('uploads/hello.txt', new Blob(['hello']));

// Realtime DB
await fb.setRealtimeData('/flags/feature-x', { enabled: true });

// Messaging (optional)
try {
  const token = await fb.getMessagingToken(process.env.FIREBASE_VAPID_KEY);
  fb.onMessage(payload => console.log('Push payload', payload));
} catch {
  console.warn('Messaging not available in this runtime');
}
```

---

### 🧠 FirebaseProvider API Summary

#### Constructor

```ts
new FirebaseProvider(options: FirebaseIntegrationOptions)
```

**Options:**

* `projectId` *(string, required)*
* `apiKey` *(string, required)*
* `storageBucket?`
* `messagingSenderId?`
* `clientEmail?`
* `privateKey?`
* `requiredConfig?` *(Array<{ key: string; dataType: string }>)*

#### Firestore

* `addDocument(collectionName, data)`
* `getDocument(collectionName, docId)`
* `updateDocument(collectionName, docId, data)`
* `deleteDocument(collectionName, docId)`
* `listDocuments(collectionName)`

#### Auth

* `createUser(email, password, displayName?)`
* `loginUser(email, password)`
* `deleteUserAccount()`

#### Storage

* `uploadFile(filePath, fileContent)`
* `getFileUrl(filePath)`
* `deleteFile(filePath)`

#### Realtime Database

* `setRealtimeData(path, data)`
* `getRealtimeData(path)`
* `deleteRealtimeData(path)`

#### Messaging

* `getMessagingToken(vapidKey?)`
* `onMessage(callback)`

> ⚠️ Note: Firebase Messaging may not be available in non-browser runtimes.
> The provider automatically warns if initialization fails.

---

### 💳 StripeProvider Example

```ts
import StripeProvider from './src/providers/stripe.provider';

const stripe = new StripeProvider(process.env.STRIPE_SECRET_KEY!);

const url = await stripe.generatePaymentLink({
  lineItems: [{ price: 'price_abc123', quantity: 1 }],
  allowPromotionCodes: true,
  afterCompletion: {
    type: 'redirect',
    redirect: { url: 'https://your-site.com/thanks' }
  }
});

console.log('Payment link:', url);
```

#### StripeProvider API Summary

* **Constructor:** `new StripeProvider(apiKey: string)`
* **Methods:**

  * `generatePaymentLink(options: PaymentLinkOptions) => Promise<string>`

**Options:**

* `lineItems`: Array<{ price: string; quantity: number }>
* `allowPromotionCodes?`: boolean
* `afterCompletion?`: `{ type: 'redirect' | 'hosted_confirmation', redirect?: { url: string } }`

---

### 🔄 n8n & Supabase Providers

Currently **stubs** with constructor shells only.
You can extend them with:

* Workflow triggers and executions for **n8n**
* Database, auth, or storage wrappers for **Supabase**

---

## 🧪 Testing & Development Notes

* TypeScript compilation:

  ```bash
  pnpm run build
  ```

  Compiles to `dist/` using `tsc -p tsconfig.json`.

* Development:

  ```bash
  pnpm run dev
  ```

  Runs `src/index.ts` with `ts-node` and `nodemon`.

Before publishing:

* ✅ Ensure `dist/index.js` correctly re-exports all providers
* ✅ Add unit tests for each provider
* ✅ Include `.d.ts` declaration files (if not auto-generated)

---

## 🤝 Contributing

1. Fork the repo and create a feature branch.
2. Add or update providers under `src/providers/`.
3. Add tests and update this README.
4. Run `pnpm run build` and submit a PR.

---

## 📄 License

**MIT License** — see `package.json` for details.

---

## 📬 Contact

Questions or issues?
Open one here → [https://github.com/workstudiohq/integrations/issues](https://github.com/workstudiohq/integrations/issues)