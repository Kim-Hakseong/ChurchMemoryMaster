import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleAuth } from 'google-auth-library';

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Web Push FCM 토큰 등록(데모: 메모리)
  const tokens = new Set<string>();
  app.post('/api/push/register', (req, res) => {
    const { token } = req.body || {};
    if (typeof token === 'string' && token.length > 0) tokens.add(token);
    res.json({ ok: true, count: tokens.size });
  });

  // Web Push 발송(관리자/테스트용)
  app.post('/api/push/send', async (req, res) => {
    const { title, body } = req.body || {};
    try {
      const accessToken = await getGoogleAccessToken();
      const responses = await Promise.all(Array.from(tokens).map(t => fetch(`https://fcm.googleapis.com/v1/projects/YOUR_PROJECT_ID/messages:send`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: { token: t, notification: { title: title || '알림', body: body || '새 소식이 있습니다' } } })
      })));
      res.json({ ok: true, sent: responses.length });
    } catch (e: any) {
      res.status(500).json({ ok: false, message: e?.message || 'send failed' });
    }
  });

  const auth = new GoogleAuth({ scopes: ['https://www.googleapis.com/auth/firebase.messaging'] });
  async function getGoogleAccessToken(): Promise<string> {
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    return tokenResponse.token as string;
  }

  const httpServer = createServer(app);

  return httpServer;
}
