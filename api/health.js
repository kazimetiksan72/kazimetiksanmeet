export default function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ message: 'Bu yöntem desteklenmiyor.' });
  }

  return response.status(200).json({ status: 'ok' });
}
