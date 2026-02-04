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
    
    // Clean the title and get a clean content preview
    const cleanTitle = stripHtmlTags(title);
    const cleanContent = stripHtmlTags(content);
    const contentPreview = cleanContent.length > 150 
      ? cleanContent.substring(0, 150) + '...'
      : cleanContent;

    const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; font-size: 24px; margin-bottom: 20px;">${cleanTitle}</h1>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">${contentPreview}</p>
        <div style="margin-top: 30px;">
          <a href="${blogUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Read Full Post</a>
        </div>
      </div>
    `;

    // Send emails in batches of 10 to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': process.env.BREVO_API_KEY!,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: 'The Phinominal African Lives',
            email: process.env.EMAIL_FROM,
          },
          to: batch.map(({ email }) => ({ email })),
          subject: `📰 New Post: ${cleanTitle}`,
          htmlContent: emailTemplate,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Brevo API error: ${JSON.stringify(error)}`);
      }

      // Add a small delay between batches to avoid rate limits
      if (i + batchSize < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({ message: 'Emails sent successfully' });
  } catch (err: any) {
    console.error('Email error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 