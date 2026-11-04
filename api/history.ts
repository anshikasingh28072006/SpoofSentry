// Global in-memory history cache across serverless warm invocations
const serverlessHistory: any[] = [];

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      let item = req.body;
      if (typeof item === 'string') {
        try { item = JSON.parse(item); } catch { /* noop */ }
      }
      if (item) {
        serverlessHistory.unshift({
          id: Date.now(),
          ...item,
          analyzedAt: item.analyzedAt || new Date().toISOString()
        });
        if (serverlessHistory.length > 50) {
          serverlessHistory.pop();
        }
      }
      return res.status(200).json({ success: true, count: serverlessHistory.length });
    } catch {
      return res.status(400).json({ error: 'Failed to record history' });
    }
  }

  res.status(200).json({
    history: serverlessHistory.slice(0, 20)
  });
}
