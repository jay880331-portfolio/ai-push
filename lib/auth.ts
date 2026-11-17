import { NextRequest } from 'next/server';
import { AuthContext } from '@/types';

// In production, this should be stored in a database
// For MVP, we'll use environment variables
const getApiKeys = (): Map<string, string> => {
  const apiKeysString = process.env.API_KEYS || '';
  const apiKeys = new Map<string, string>();
  
  if (apiKeysString) {
    const pairs = apiKeysString.split(',');
    pairs.forEach(pair => {
      const [companyId, apiKey] = pair.split(':');
      if (companyId && apiKey) {
        apiKeys.set(apiKey.trim(), companyId.trim());
      }
    });
  }
  
  return apiKeys;
};

export async function authenticateApiKey(request: NextRequest): Promise<AuthContext> {
  const apiKey = request.headers.get('X-API-Key');
  
  if (!apiKey) {
    throw new Error('API key is required');
  }
  
  const apiKeys = getApiKeys();
  const companyId = apiKeys.get(apiKey);
  
  if (!companyId) {
    throw new Error('Invalid API key');
  }
  
  return {
    companyId,
    apiKey
  };
}

export function validateCronSecret(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const providedSecret = request.headers.get('X-Cron-Secret');
  
  if (!cronSecret || !providedSecret) {
    return false;
  }
  
  return cronSecret === providedSecret;
}