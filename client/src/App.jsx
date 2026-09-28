import { useState } from 'react';
import logoSource from '../../logo.svg';
import qrSource from './assets/mint-ayvalik-qr.svg';

const initialForm = { firstName: '', lastName: '', phone: '', email: '' };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\(\d{3}\)-\d{3}-\d{2}-\d{2}$/;

function formatPhone(value) {
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('0090') && digits.length >= 14) digits = digits.slice(4);
  else if (digits.startsWith('90') && digits.length >= 12) digits = digits.slice(2);
  else if (digits.startsWith('0') && digits.length >= 11) digits = digits.slice(1);
  digits = digits.slice(0, 10);
  if (!digits) return '';

  let formatted = `(${digits.slice(0, 3)}`;
  if (digits.length > 3) formatted += `)-${digits.slice(3, 6)}`;
  if (digits.length > 6) formatted += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
  return formatted;
}

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
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const isFormComplete = Object.values(form).every((value) => value.trim().length > 0) && kvkkAccepted;

  const onChange = ({ target }) => {
    const value = target.name === 'phone' ? formatPhone(target.value) : target.value;
    setForm((current) => ({ ...current, [target.name]: value }));
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
      setKvkkAccepted(false);
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
            href="https://meet.kazimetiksan.com/"
            target="_blank"
            rel="noreferrer"
            aria-label="Etkinlik kayıt sayfasını aç"
          >
            <img src={qrSource} alt="https://meet.kazimetiksan.com/ için QR kod" />
          </a>
        </div>
        <div className="intro-copy">
          <h1 id="page-title">Yeni fikirlerin<br />buluşma noktası.</h1>
          <p className="description">İlham veren konuşmalar, üretken sohbetler ve yeni bağlantılar için aramıza katılın.</p>
        </div>
      </section>

      <section className="form-panel" aria-labelledby="form-title">
        <div className="form-wrap">
          <h2 id="form-title">Aramıza katılın.</h2>
          <p className="form-lead">Bilgilerinizi bırakın, etkinlik detaylarını size gönderelim.</p>

          <form onSubmit={onSubmit} noValidate>
            <div className="name-row">
              <Field label="Ad" name="firstName" value={form.firstName} error={errors.firstName} onChange={onChange} autoComplete="given-name" autoCapitalize="words" placeholder="Adınız" />
              <Field label="Soyad" name="lastName" value={form.lastName} error={errors.lastName} onChange={onChange} autoComplete="family-name" autoCapitalize="words" placeholder="Soyadınız" />
            </div>
            <Field label="Telefon" name="phone" type="tel" inputMode="tel" value={form.phone} error={errors.phone} onChange={onChange} autoComplete="tel" placeholder="(XXX)-XXX-XX-XX" />
            <Field label="E-posta" name="email" type="email" inputMode="email" autoCapitalize="none" spellCheck="false" value={form.email} error={errors.email} onChange={onChange} autoComplete="email" placeholder="ornek@eposta.com" />

            <label className="kvkk-consent">
              <input
                type="checkbox"
                checked={kvkkAccepted}
                onChange={(event) => setKvkkAccepted(event.target.checked)}
              />
              <span>
                <a href="/kvkk.html" target="_blank" rel="noopener noreferrer">KVKK Aydınlatma Metni</a>'ni okudum ve bilgilendirildim.
              </span>
            </label>

            <button type="submit" disabled={!isFormComplete || status.type === 'loading'} data-loading={status.type === 'loading'}>
              {status.type === 'loading' ? <span className="spinner" aria-hidden="true" /> : null}
              {status.type === 'loading' ? 'Kaydediliyor' : 'Kaydımı tamamla'}
              {status.type !== 'loading' ? <span aria-hidden="true">→</span> : null}
            </button>

            {status.type !== 'idle' && status.type !== 'success' && (
              <div className={`notice ${status.type}`} role={status.type === 'error' ? 'alert' : 'status'}>
                {status.message}
              </div>
            )}
          </form>
        </div>
      </section>

      {status.type === 'success' && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setStatus({ type: 'idle', message: '' });
          }}
        >
          <div className="success-modal" role="dialog" aria-modal="true" aria-labelledby="success-title" aria-describedby="success-message">
            <span className="success-icon" aria-hidden="true">✓</span>
            <h3 id="success-title">Kayıt tamamlandı</h3>
            <p id="success-message">{status.message}</p>
            <button className="modal-close" type="button" autoFocus onClick={() => setStatus({ type: 'idle', message: '' })}>
              Tamam
            </button>
          </div>
        </div>
      )}
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
