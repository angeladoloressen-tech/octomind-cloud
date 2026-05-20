# OctoAmazonas Portals

GitHub + n8n odaklı gerçek çalışma alanı.

Bu klasör OctoAmazonas için ihtiyaç duyulan portalları ve otomasyonları içerir.

## Portallar

1. **Buyer Portal**  
   Müşteriler için ürün keşfi, kategori filtresi, Buy Now, Compare, Save ve affiliate yönlendirme.

2. **Vendor Portal**  
   Gadget markalarının ürün başvurusu yapacağı alan: marka, ürün, fiyat, komisyon, link, ürün açıklaması.

3. **Admin Review Portal**  
   Ürün/satıcı başvurularını New, Reviewing, Approved, Featured, Rejected statülerinde yönetme.

4. **Research Portal**  
   YouTube/TikTok/Reddit gibi kaynaklardan trend gadget fikirlerini toplama, trend score verme ve katalog adayına dönüştürme.

5. **Commerce Portal**  
   Affiliate listing, Featured Product, Launch Campaign, Vendor Storefront, Premium Trend Report paketlerini satılabilir forma sokma.

## Dosyalar

- `index.html` — Çok dilli portal prototipi.
- `products.seed.json` — İlk ürün/veri tohumu.
- `portal_map.json` — Portal mimarisi ve veri akışları.
- `n8n/vendor_application_intake.json` — Satıcı başvuru workflow.
- `n8n/product_research_pipeline.json` — Trend ürün araştırma workflow.
- `n8n/weekly_future_gadgets_drop.json` — Haftalık e-posta/drop workflow.

## İlk satış paketi

**Octo Launch Pack — €199**

İçerik:
- ürün sayfası
- ana sayfa featured placement
- newsletter mention
- sosyal medya metin paketi
- affiliate/satın alma butonu
- trend score etiketi

## Yayınlama

Bu klasörü GitHub Pages, Netlify veya Vercel ile statik site olarak yayınlayabilirsin.

n8n workflow dosyaları n8n içinde **Import from file** ile içe aktarılabilir.
