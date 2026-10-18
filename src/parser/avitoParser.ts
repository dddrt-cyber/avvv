import axios from 'axios';
import { RawCarListing } from '../types';
export class AvitoParser {
  async fetchNewListings(): Promise<RawCarListing[]> {
    try {
      const res = await axios.get('https://m.avito.ru/api/9/items?categoryId=9&sort=104', {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        timeout: 10000
      });
      const items = res.data?.result?.items || [];
      console.log('Avito: получено объявлений:', items.length);
      const list: RawCarListing[] = [];
      for (const it of items) {
        if (!it.value || !it.value.id) continue;
        const v = it.value;
        const title = v.title || 'Авто';
        list.push({
          id: String(v.id),
          url: `https://www.avito.ru${v.uri || '/' + v.id}`,
          title,
          price: Number(v.priceDetailed?.value || v.price || 0),
          make: title.split(' ')[0] || 'Unknown',
          model: title.split(',')[0].split(' ').slice(1).join(' ') || 'Unknown',
          year: parseInt((title.match(/\b(19\d{2}|20\d{2})\b/) || ['2012'])[0], 10),
          mileage: Number(v.parameters?.mileage || 0),
          city: v.location?.name || 'РФ',
          region: v.location?.region || 'РФ',
          description: v.description || '',
          photoUrls: (v.images || []).map((img: any) => Object.values(img)[0] as string),
          publishedAt: new Date(v.startTime ? v.startTime * 1000 : Date.now()),
        });
      }
      return list;
    } catch (e: any) {
  console.error('Avito error:', e?.response?.status, e?.message);
  return [];
}

  }
}
