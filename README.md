# Mint Form

React, Node.js ve MongoDB ile hazırlanmış uçtan uca katılımcı kayıt uygulaması. Form; ad, soyad, telefon ve e-posta bilgilerini doğrular, API üzerinden MongoDB'ye kaydeder ve aynı e-posta ile ikinci kaydı engeller. Vercel'de frontend ve serverless API tek proje olarak çalışır.

## Gereksinimler

- Node.js 20 veya üzeri
- npm 10 veya üzeri
- Yerel MongoDB (varsayılan adres: `mongodb://127.0.0.1:27017`)

## Kurulum

```bash
npm install
cp server/.env.example server/.env
```

`server/.env` içindeki değerleri gerekirse kendi ortamınıza göre düzenleyin:

```env
PORT=5050
MONGODB_URI=mongodb://127.0.0.1:27017/mint-form
CLIENT_ORIGIN=http://localhost:5173
```

MongoDB servisinin çalıştığından emin olun. macOS'ta Homebrew ile kurulduysa örneğin:

```bash
brew services start mongodb-community
```

## Geliştirme

İstemciyi ve API'yi birlikte başlatın:

```bash
npm run dev
```

- Web arayüzü: http://localhost:5173
- API sağlık kontrolü: http://localhost:5050/api/health

Vite geliştirme sunucusu `/api` isteklerini Node.js API'sine yönlendirir. Kayıtlar yerel MongoDB içindeki `mint-form` veritabanının `participants` koleksiyonuna yazılır.

### Aynı ağdaki başka bir cihazdan erişim

Geliştirme sunucuları tüm yerel ağ arayüzlerini dinler. Bilgisayarınızın yerel IPv4 adresini bulup başka cihazda aşağıdaki adresi açın:

```text
http://BILGISAYARIN_IP_ADRESI:5173
```

5173 doluysa Vite'ın terminalde gösterdiği portu kullanın. API varsayılan olarak `http://BILGISAYARIN_IP_ADRESI:5050` adresindedir. CORS; `localhost`, yapılandırılmış `CLIENT_ORIGIN` değerleri ve özel LAN IPv4 aralıklarıyla sınırlıdır. Cihazların aynı ağa bağlı olması ve macOS güvenlik duvarının Node.js'e gelen bağlantılara izin vermesi gerekir. VPN veya istemci izolasyonu etkin misafir ağları cihazlar arası erişimi engelleyebilir.

## Doğrulama

```bash
npm test
npm run build
```

Testler sağlık kontrolünü, geçerli kaydı, alan doğrulamasını ve yinelenen e-posta davranışını gerçek HTTP istekleriyle sınar. Üretim istemci çıktısı `client/dist` klasörüne oluşturulur.

## Vercel'e dağıtım

Bu depo tek bir Vercel projesi için hazırdır. Vercel projesini oluştururken deponun kök dizinini seçin; `vercel.json` aşağıdaki ayarları otomatik uygular:

- Framework: Vite
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `client/dist`
- API: `/api/health` ve `/api/participants`

Vercel projesinde aşağıdaki ortam değişkenini Production, Preview ve Development ortamları için tanımlayın:

```env
MONGODB_URI=mongodb+srv://KULLANICI:SIFRE@SUNUCU/mint-form
```

MongoDB Atlas kullanıyorsanız veritabanı kullanıcısına yazma yetkisi verin ve Vercel fonksiyonlarının Atlas'a bağlanabilmesi için Network Access ayarını yapılandırın. Frontend ile API aynı Vercel domain'inde çalıştığından production için `CLIENT_ORIGIN` veya ayrı bir backend URL'si gerekmez.

Dağıtımdan sonra şu adresleri kontrol edin:

- Site: `https://PROJE_ADI.vercel.app`
- Sağlık kontrolü: `https://PROJE_ADI.vercel.app/api/health`

## API

### `POST /api/participants`

```json
{
  "firstName": "Ada",
  "lastName": "Lovelace",
  "phone": "+90 555 111 22 33",
  "email": "ada@example.com"
}
```

Başarılı istek `201`, doğrulama hatası `400`, daha önce kullanılan e-posta ise `409` döndürür. Sunucu ayrıntılı iç hata bilgilerini istemciye açmaz.
