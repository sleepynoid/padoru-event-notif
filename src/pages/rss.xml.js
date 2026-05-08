import rss from '@astrojs/rss';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';
import { supabase } from '../lib/supabase';

function parseDate(dateStr) {
	if (!dateStr) return new Date();

	const monthMap = {
		'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'Mei': 4, 'May': 4, 'Jun': 5,
		'Jul': 6, 'Agu': 7, 'Ags': 7, 'Aug': 7, 'Sep': 8, 'Okt': 9, 'Oct': 9,
		'Nov': 10, 'Des': 11, 'Dec': 11
	};

	const match = dateStr.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
	if (match) {
		const [, day, month, year] = match;
		const monthNum = monthMap[month];
		if (monthNum !== undefined) {
			return new Date(parseInt(year), monthNum, parseInt(day));
		}
	}

	return new Date();
}

export async function GET(context) {
	const { data: events } = await supabase
		.from('events')
		.select('*')
		.order('tanggal', { ascending: false });

	if (!events) return new Response('No events found', { status: 404 });

	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: events.map((event) => ({
			title: event.nama_acara,
			pubDate: parseDate(event.tanggal),
			description: `${event.nama_acara} - ${event.lokasi}, ${event.area} pada ${event.tanggal}`,
			link: `/events/${event.id}/`,
		})),
	});
}
