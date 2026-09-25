import cors from 'cors';
import express from 'express';
import { Participant } from './models/Participant.js';
import { normalizeParticipant, validateParticipant } from './validation.js';

export function createApp({ participantModel = Participant, clientOrigin = 'http://localhost:5173' } = {}) {
  const app = express();
  const configuredOrigins = clientOrigin.split(',').map((origin) => origin.trim()).filter(Boolean);
  const localNetworkOrigin = /^https?:\/\/(?:(?:localhost|127\.0\.0\.1)|(?:10\.(?:\d{1,3}\.){2}\d{1,3})|(?:192\.168\.(?:\d{1,3})\.(?:\d{1,3}))|(?:172\.(?:1[6-9]|2\d|3[01])\.(?:\d{1,3})\.(?:\d{1,3})))(?::\d+)?$/;
  app.disable('x-powered-by');
  app.use(cors({
    origin(origin, callback) {
      const allowed = !origin || configuredOrigins.includes(origin) || localNetworkOrigin.test(origin);
      callback(allowed ? null : new Error('CORS origin rejected'), allowed);
    },
    methods: ['GET', 'POST'],
  }));
  app.use(express.json({ limit: '20kb' }));

  app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));

  app.post('/api/participants', async (request, response, next) => {
    try {
      const participant = normalizeParticipant(request.body);
      const errors = validateParticipant(participant);
      if (Object.keys(errors).length) {
        return response.status(400).json({ message: 'Lütfen formdaki bilgileri kontrol edin.', errors });
      }

      const created = await participantModel.create(participant);
      return response.status(201).json({
        message: 'Kaydınız başarıyla alındı!',
        participant: { id: created._id, firstName: created.firstName, lastName: created.lastName },
      });
    } catch (error) {
      if (error?.code === 11000) {
        return response.status(409).json({ message: 'Bu e-posta adresiyle daha önce kayıt yapılmış.' });
      }
      return next(error);
    }
  });

  app.use((_request, response) => response.status(404).json({ message: 'İstenen kaynak bulunamadı.' }));
  app.use((error, _request, response, _next) => {
    console.error('API hatası:', error.message);
    response.status(500).json({ message: 'Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.' });
  });

  return app;
}
