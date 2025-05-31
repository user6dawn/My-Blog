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
    
    // Clean the title and get a clean content preview
    const cleanTitle = stripHtmlTags(title);
    const cleanContent = stripHtmlTags(content);
    const contentPreview = cleanContent.length > 150 
      ? cleanContent.substring(0, 150) + '...'
      : cleanContent;

    for (const { email } of subscribers) {
      await apiInstance.sendTransacEmail({
        sender: { name: 'The Balance Code Alliance', email: process.env.EMAIL_FROM },
        to: [{ email }],
        subject: `📰 New Post: ${cleanTitle}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">${cleanTitle}</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">${contentPreview}</p>
            <div style="margin-top: 30px;">
              <a href="${blogUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Read Full Post</a>
            </div>
          </div>
        `
      });
    }

    return NextResponse.json({ message: 'Emails sent successfully' });
  } catch (err: any) {
    console.error('Email error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 