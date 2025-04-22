import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
); 

function stripHtmlTags(html) {
  return html.replace(/<[^>]*>/g, '').trim();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { title, content, postId } = req.body;

  try {
    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('email');

    if (error) {
      console.error('❌ Supabase fetch error:', error);
      throw error;
    }

    const blogUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/post/${postId}`;

    for (const { email } of subscribers) {
      try {
        const result = await resend.emails.send({
          from: 'onboarding@resend.dev', // change this for testing
          to: email,
          subject: `📰 New Post: ${stripHtmlTags(title)}`,
          html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>${title}</h2>
            <p>${content.substring(0, 150)}...</p>
            <p><a href="${blogUrl}" target="_blank" style="color: blue;">Read the full post</a></p>
          </div>
        `
        });

        console.log(`✅ Email sent to ${email}:`, result);
      } catch (emailErr) {
        console.error(`❌ Email send failed to ${email}:`, emailErr);
      }
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Final error in notify-subscribers:', err);
    res.status(500).json({ error: err.message });
  }
}
