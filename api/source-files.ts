import fs from 'fs';
import path from 'path';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const fileList = ['detector.py', 'app.py', 'test_detector.py', 'requirements.txt', 'README.md'];
    const files: Record<string, string> = {};

    for (const name of fileList) {
      const p = path.join(process.cwd(), name);
      if (fs.existsSync(p)) {
        files[name] = fs.readFileSync(p, 'utf-8');
      }
    }

    res.status(200).json({ files });
  } catch (err: any) {
    res.status(500).json({ error: 'Could not load source files' });
  }
}
