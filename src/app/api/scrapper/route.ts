import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
export const runtime = 'edge';

type RequestBody = {
  url: string;
};

export async function POST(req: NextRequest) {
  const body: RequestBody = await req.json();
  const { url } = body;

  if (!url) {
    return new NextResponse(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  const scrapingAntApiKey = process.env.SCRAPINGANT_API_KEY;
  const apiEndpoint = `https://api.scrapingant.com/v2/general?url=${encodeURIComponent(url)}&x-api-key=${scrapingAntApiKey}&browser=false&block_resource=stylesheet&block_resource=image&block_resource=media&block_resource=font&block_resource=texttrack&block_resource=xhr&block_resource=fetch&block_resource=eventsource&block_resource=websocket&block_resource=manifest&block_resource=manifest`;

  try {
    const response = await fetch(apiEndpoint);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const htmlContent = await response.text();

    // Parse the HTML content using cheerio
    const $ = cheerio.load(htmlContent);
    const textContent = $('body').text();

    // Clean up the text content
    const cleanedText = textContent.replace(/\s+/g, ' ').trim();
    console.log(cleanedText)
    return new NextResponse(JSON.stringify({ textContent: cleanedText }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error while calling ScrapingAnt:', error);
    return new NextResponse(JSON.stringify({ error: 'An error occurred during scraping', details: error }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}