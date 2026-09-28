import { connectToDatabase } from '../server/src/database.js';
import { Participant } from '../server/src/models/Participant.js';
import { normalizeParticipant, validateParticipant } from '../server/src/validation.js';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ message: 'Bu yöntem desteklenmiyor.' });
  }

  const participant = normalizeParticipant(request.body);
  const errors = validateParticipant(participant);

  if (Object.keys(errors).length) {
    return response.status(400).json({
      message: 'Lütfen formdaki bilgileri kontrol edin.',
      errors,
    });
  }

  try {
    await connectToDatabase();
    const created = await Participant.create(participant);

    return response.status(201).json({
      message: 'Kaydınız başarıyla alındı!',
      participant: {
        id: created._id,
        firstName: created.firstName,
        lastName: created.lastName,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return response.status(409).json({ message: 'Bu e-posta adresiyle daha önce kayıt yapılmış.' });
    }

    console.error('API hatası:', error.message);
    return response.status(500).json({
      message: 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
    });
  }
}
