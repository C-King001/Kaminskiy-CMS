export default function handler(req: any, res: any) {
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', service: 'KCR CMS Data Deletion' })
  }
  if (req.method === 'POST') {
    return res.status(200).json({ status: 'received', confirmation_code: 'del_001' })
  }
  return res.status(405).json({ error: 'Method not allowed' })
}
