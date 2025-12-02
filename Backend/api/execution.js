import { executeCode } from '../runners/factory.js';
import { parseMultipart } from '../utils/multipart.js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send('ok');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { programming_language, entrypoint, input, files } = req.body;

    if (!programming_language || !entrypoint || files === undefined) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const output = await executeCode(programming_language, entrypoint, input || '', files);
    res.status(200).json(output);
  } catch (error) {
    console.error('Execution error:', error);
    res.status(500).json({ 
      error: error.message,
      stdout: '',
      stderr: error.message 
    });
  }
}
