import { useState } from 'react';
import logoSource from '../../logo.svg';
import qrSource from './assets/mint-ayvalik-qr.svg';

const initialForm = { firstName: '', lastName: '', phone: '', email: '' };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+?[0-9][0-9\s()-]{8,19}$/;

function validate(values) {
  const errors = {};
  if (values.firstName.trim().length < 2) errors.firstName = 'Ad en az 2 karakter olmalı.';
  if (values.lastName.trim().length < 2) errors.lastName = 'Soyad en az 2 karakter olmalı.';
  if (!phonePattern.test(values.phone.trim())) errors.phone = 'Geçerli bir telefon numarası girin.';
  if (!emailPattern.test(values.email.trim())) errors.email = 'Geçerli bir e-posta adresi girin.';
  return errors;
}

function App() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  const onChange = ({ target }) => {
    setForm((current) => ({ ...current, [target.name]: target.value }));
    setErrors((current) => ({ ...current, [target.name]: undefined }));
    if (status.type !== 'idle') setStatus({ type: 'idle', message: '' });
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setStatus({ type: 'loading', message: 'Kaydınız oluşturuluyor…' });
    try {
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || 'Kayıt tamamlanamadı. Lütfen tekrar deneyin.');

      setForm(initialForm);
      setStatus({ type: 'success', message: data.message || 'Kaydınız başarıyla alındı!' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  return (
    <main className="page-shell">
      <section className="intro" aria-labelledby="page-title">
        <div className="intro-header">
          <div
            className="brand-logo"
            role="img"
            aria-label="Mint Ayvalık"
            style={{ '--logo-source': `url("${logoSource}")` }}
          />
          <a
            className="intro-qr"
            href="https://mintayvalik.com.tr/"
            target="_blank"
            rel="noreferrer"
            aria-label="Mint Ayvalık web sitesini aç"
          >
            <img src={qrSource} alt="https://mintayvalik.com.tr/ için QR kod" />
          </a>
        </div>
        <div className="intro-copy">
          <h1 id="page-title">Yeni fikirlerin<br />buluşma noktası.</h1>
          <p className="description">İlham veren konuşmalar, üretken sohbetler ve yeni bağlantılar için aramıza katılın.</p>
        </div>
      </section>

      <section className="form-panel" aria-labelledby="form-title">
        <div className="form-wrap">
          <div className="mobile-logo">
            <img src={logoSource} alt="Mint Ayvalık" />
          </div>
          <h2 id="form-title">Aramıza katılın.</h2>
          <p className="form-lead">Bilgilerinizi bırakın, etkinlik detaylarını size gönderelim.</p>

          <form onSubmit={onSubmit} noValidate>
            <div className="name-row">
              <Field label="Ad" name="firstName" value={form.firstName} error={errors.firstName} onChange={onChange} autoComplete="given-name" placeholder="Adınız" />
              <Field label="Soyad" name="lastName" value={form.lastName} error={errors.lastName} onChange={onChange} autoComplete="family-name" placeholder="Soyadınız" />
            </div>
            <Field label="Telefon" name="phone" type="tel" value={form.phone} error={errors.phone} onChange={onChange} autoComplete="tel" placeholder="+90 5__ ___ __ __" />
            <Field label="E-posta" name="email" type="email" value={form.email} error={errors.email} onChange={onChange} autoComplete="email" placeholder="ornek@eposta.com" />

            <button type="submit" disabled={status.type === 'loading'}>
              {status.type === 'loading' ? <span className="spinner" aria-hidden="true" /> : null}
              {status.type === 'loading' ? 'Kaydediliyor' : 'Kaydımı tamamla'}
              {status.type !== 'loading' ? <span aria-hidden="true">→</span> : null}
            </button>

            {status.type !== 'idle' && (
              <div className={`notice ${status.type}`} role={status.type === 'error' ? 'alert' : 'status'}>
                {status.message}
              </div>
            )}
            <p className="privacy">Kaydolarak iletişim bilgilerinizin etkinlik bilgilendirmeleri için kullanılmasını kabul edersiniz.</p>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({ label, error, ...inputProps }) {
  const errorId = `${inputProps.name}-error`;
  return (
    <label className={`field ${error ? 'has-error' : ''}`}>
      <span>{label}</span>
      <input {...inputProps} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} />
      {error ? <small id={errorId}>{error}</small> : null}
    </label>
  );
}

export default App;
