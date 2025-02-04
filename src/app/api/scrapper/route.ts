// Import Puppeteer-core, Chromium for Vercel, and Next.js types
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

type RequestBody = { url: string };

// Handle the POST request
export async function POST(req: NextRequest) {
  const body: RequestBody = await req.json();
  const { url } = body;

  if (!url) {
    return new NextResponse(JSON.stringify({ error: 'URL is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const textContent = await scrapeAllTextWithPuppeteer(url);
    
    if (textContent) {
      return new NextResponse(JSON.stringify({ textContent }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new NextResponse(JSON.stringify({ error: 'Failed to scrape text content' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error during scraping:', error);
    return new NextResponse(JSON.stringify({ error: 'An error occurred during scraping' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Scraper function using Puppeteer with Chromium for Vercel
async function scrapeAllTextWithPuppeteer(url: string): Promise<string | null> {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless === "shell" ? true : false, // ✅ Correct handling
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const textContent = await page.evaluate(() => document.body.innerText);
    return textContent.replace(/\s+/g, ' ').trim();
  } catch (error) {
    console.error("Error scraping with Puppeteer:", error);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}
