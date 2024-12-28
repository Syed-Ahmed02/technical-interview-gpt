// Import Puppeteer and types from Next.js
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import type { Browser } from 'puppeteer';

// Define a type for the request body
type RequestBody = {
  url: string;
};

// This function handles the POST request
export async function POST(req: NextRequest) {
  // Parse the request body to get the URL
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

  try {
    const textContent = await scrapeAllTextWithPuppeteer(url);

    if (textContent) {
      return new NextResponse(JSON.stringify({ textContent }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      return new NextResponse(JSON.stringify({ error: 'Failed to scrape the text content' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: 'An error occurred during scraping' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

async function scrapeAllTextWithPuppeteer(url: string): Promise<string | null> {
  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const textContent = await page.evaluate(() => document.body.innerText);

    // Optional: clean up the text content
    const cleanedText = textContent.replace(/\s+/g, ' ').trim();

    return cleanedText;
  } catch (error) {
    console.error("Error scraping with Puppeteer:", error);
    return null;
  } finally {
    await browser?.close();
  }
}