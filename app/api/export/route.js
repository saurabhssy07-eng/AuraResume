import { NextResponse } from 'next/server';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export async function POST(request) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
    }

    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const previewUrl = `${protocol}://${host}/preview/${id}`;

    console.log('Generating PDF for:', previewUrl);

    // Launch puppeteer based on environment
    let browser;

    if (process.env.NODE_ENV === 'production') {
      
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    } else {
      const fallbackPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
      browser = await puppeteerCore.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.CHROME_EXECUTABLE_PATH || fallbackPath,
      });
    }

    const page = await browser.newPage();
    
    // Visit the preview page
    await page.goto(previewUrl, {
      waitUntil: 'networkidle0', // Wait until no network connections for 500ms
      timeout: 15000, // 15s timeout
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '0in',
        right: '0in',
        bottom: '0in',
        left: '0in'
      }
    });

    await browser.close();

    // Return the PDF as a downloadable file
    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume-${id}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF Export Error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
