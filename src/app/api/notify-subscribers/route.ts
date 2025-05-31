import SibApiV3Sdk from 'sib-api-v3-sdk';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function stripHtmlTags(html: string) {
  return html.replace(/<[^>]*>/g, '').trim();
}

export async function POST(request: Request) {
  try {
    const { title, content, postId } = await request.json();

    const { data: subscribers, error } = await supabase
      .from('subscribers')
      .select('email');

    if (error) throw error;

    const blogUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/post/${postId}`;
    const client = SibApiV3Sdk.ApiClient.instance;
    client.authentications['api-key'].apiKey = process.env.BREVO_API_KEY;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    for (const { email } of subscribers) {
      await apiInstance.sendTransacEmail({
        sender: { name: 'The Balance Code Alliance', email: process.env.EMAIL_FROM },
        to: [{ email }],
        subject: `📰 New Post: ${stripHtmlTags(title)}`,
        htmlContent: `<h2>${title}</h2><p>${content.substring(0, 150)}...</p><p><a href="${blogUrl}">Read more</a></p>`
      });
    }

    return NextResponse.json({ message: 'Emails sent successfully' });
  } catch (err: any) {
    console.error('Email error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 