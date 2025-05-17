import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { expoPushToken, title, body: messageBody, screen, data } = body;

    if (!expoPushToken) {
      console.error('API Route: Missing expoPushToken');
      return NextResponse.json(
        { error: 'Missing expoPushToken' },
        { status: 400 }
      );
    }

    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body: messageBody,
      data: { screen, data },
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-encoding': 'gzip, deflate',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API Route: Expo push service error:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      return NextResponse.json(
        { error: `Expo push service error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Route: Error in notifications API:', error);
    return NextResponse.json(
      { error: 'Failed to send notification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 