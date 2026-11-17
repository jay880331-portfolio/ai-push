import * as admin from 'firebase-admin';

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error('Firebase Admin SDK credentials are not properly configured');
}

// Initialize Firebase Admin SDK only once
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY,
      }),
    });
  } catch (error) {
    console.error('Failed to initialize Firebase Admin SDK:', error);
  }
}

export interface PushNotificationPayload {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
  badge?: number;
  sound?: string;
  imageUrl?: string;
}

export async function sendPushNotification(payload: PushNotificationPayload): Promise<string> {
  const message: admin.messaging.Message = {
    token: payload.token,
    notification: {
      title: payload.title,
      body: payload.body,
      imageUrl: payload.imageUrl,
    },
    data: payload.data,
    apns: {
      payload: {
        aps: {
          badge: payload.badge,
          sound: payload.sound || 'default',
        },
      },
    },
    android: {
      notification: {
        sound: payload.sound || 'default',
      },
    },
  };

  try {
    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

export async function sendMulticastPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<admin.messaging.BatchResponse> {
  const message: admin.messaging.MulticastMessage = {
    tokens,
    notification: {
      title,
      body,
    },
    data,
    apns: {
      payload: {
        aps: {
          sound: 'default',
        },
      },
    },
    android: {
      notification: {
        sound: 'default',
      },
    },
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    return response;
  } catch (error) {
    console.error('Error sending multicast push notification:', error);
    throw error;
  }
}

export { admin };