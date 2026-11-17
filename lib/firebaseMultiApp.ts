import * as admin from 'firebase-admin';
import { ICustomerApp, IFirebaseConfig } from '@/types';

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error('Firebase Admin SDK credentials are not properly configured');
}

// Single Firebase Admin instance for our unified project
let firebaseApp: admin.app.App | null = null;

export function getFirebaseApp(): admin.app.App {
  if (!firebaseApp) {
    if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
      throw new Error('Firebase Admin SDK not configured');
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: FIREBASE_PROJECT_ID,
        clientEmail: FIREBASE_CLIENT_EMAIL,
        privateKey: FIREBASE_PRIVATE_KEY,
      }),
    });
  }
  
  return firebaseApp;
}

export interface MultiAppPushPayload {
  companyId: string;
  appId?: string;
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

export async function sendMultiAppPushNotification(payload: MultiAppPushPayload): Promise<admin.messaging.BatchResponse> {
  const app = getFirebaseApp();
  
  // Prepare push data with company and app identification
  const pushData: Record<string, string> = {
    companyId: payload.companyId,
    ...payload.data
  };

  if (payload.appId) {
    pushData.appId = payload.appId;
  }

  const message: admin.messaging.MulticastMessage = {
    tokens: payload.tokens,
    notification: {
      title: payload.title,
      body: payload.body,
      imageUrl: payload.imageUrl,
    },
    data: pushData,
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
    android: {
      notification: {
        sound: 'default',
        channelId: 'ai_push_notifications',
      },
    },
  };

  try {
    const response = await app.messaging().sendEachForMulticast(message);
    
    // Log failed tokens for debugging
    if (response.failureCount > 0) {
      response.responses.forEach((resp, index) => {
        if (!resp.success) {
          console.error(`Failed to send to token ${payload.tokens[index]}:`, resp.error);
        }
      });
    }

    return response;
  } catch (error) {
    console.error('Error sending multicast push notification:', error);
    throw error;
  }
}

export async function sendSinglePushNotification(
  token: string,
  title: string,
  body: string,
  companyId: string,
  data?: Record<string, string>
): Promise<string> {
  const app = getFirebaseApp();
  
  const message: admin.messaging.Message = {
    token,
    notification: {
      title,
      body,
    },
    data: {
      companyId,
      ...data,
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
    android: {
      notification: {
        sound: 'default',
        channelId: 'ai_push_notifications',
      },
    },
  };

  try {
    const response = await app.messaging().send(message);
    return response;
  } catch (error) {
    console.error('Error sending single push notification:', error);
    throw error;
  }
}

// Generate Firebase config file for customer apps
export function generateFirebaseConfig(customerApp: ICustomerApp): IFirebaseConfig {
  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    throw new Error('Firebase configuration not available');
  }

  return {
    type: "service_account",
    project_id: FIREBASE_PROJECT_ID,
    private_key_id: "generated-for-customer",
    private_key: FIREBASE_PRIVATE_KEY,
    client_email: FIREBASE_CLIENT_EMAIL,
    client_id: "generated-client-id",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: `https://www.googleapis.com/oauth2/v1/certs/${FIREBASE_CLIENT_EMAIL}`
  };
}

// Generate google-services.json for Android apps
export function generateAndroidConfig(customerApp: ICustomerApp): any {
  if (!FIREBASE_PROJECT_ID) {
    throw new Error('Firebase project ID not configured');
  }

  return {
    project_info: {
      project_number: "123456789", // This would be actual project number in production
      project_id: FIREBASE_PROJECT_ID,
      storage_bucket: `${FIREBASE_PROJECT_ID}.appspot.com`
    },
    client: [
      {
        client_info: {
          mobilesdk_app_id: customerApp.firebaseAppId || `1:123456789:android:${customerApp.packageName.replace(/\./g, '')}`,
          android_client_info: {
            package_name: customerApp.packageName
          }
        },
        oauth_client: [],
        api_key: [
          {
            current_key: "generated-api-key-for-customer-app"
          }
        ],
        services: {
          appinvite_service: {
            other_platform_oauth_client: []
          }
        }
      }
    ],
    configuration_version: "1"
  };
}

// Generate GoogleService-Info.plist for iOS apps
export function generateiOSConfig(customerApp: ICustomerApp): any {
  if (!FIREBASE_PROJECT_ID) {
    throw new Error('Firebase project ID not configured');
  }

  return {
    PROJECT_ID: FIREBASE_PROJECT_ID,
    BUNDLE_ID: customerApp.packageName,
    IS_ADS_ENABLED: false,
    IS_ANALYTICS_ENABLED: false,
    IS_APPINVITE_ENABLED: true,
    IS_GCM_ENABLED: true,
    IS_SIGNIN_ENABLED: true,
    GOOGLE_APP_ID: customerApp.firebaseAppId || `1:123456789:ios:${customerApp.packageName.replace(/\./g, '')}`,
    DATABASE_URL: `https://${FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`,
    GCM_SENDER_ID: "123456789",
    STORAGE_BUCKET: `${FIREBASE_PROJECT_ID}.appspot.com`,
    API_KEY: "generated-ios-api-key-for-customer-app",
    CURRENT_KEY: "generated-ios-api-key-for-customer-app"
  };
}

export { admin };