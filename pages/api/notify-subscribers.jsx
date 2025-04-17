import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { title, content, postId } = req.body;

  try {
    const { data: subscribers, error } = await supabase.from('subscribers').select('email');

    if (error) throw error;

    const blogUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/post/${postId}`;

    const promises = subscribers.map(({ email }) =>
      resend.emails.send({
        from: 'The Balance Code Alliance <noreply@yourdomain.com>',
        to: email,
        subject: `${title}` ,
        html: `<h2>${title}</h2><p>${content.substring(0, 150)}...</p><p><a href="${blogUrl}">Read the full post</a></p>`,
      })
    );

    await Promise.all(promises);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error('Notify error:', err);
    res.status(500).json({ error: 'Failed to notify subscribers' });
  }
}
