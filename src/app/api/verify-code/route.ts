import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizeCode } from '@/lib/codes';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { valid: false, type: 'invalid', message: 'Please enter your access code' },
        { status: 400 }
      );
    }

    const normalizedCode = normalizeCode(code);

    // Look up the code with the associated request
    const { data, error } = await supabaseAdmin
      .from('access_codes')
      .select(`
        *,
        requests (person_first_name)
      `)
      .eq('code', normalizedCode)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { valid: false, type: 'invalid', message: 'We couldn\'t find that code. Please check and try again.' },
        { status: 400 }
      );
    }

    // Check if revoked
    if (data.status === 'revoked') {
      return NextResponse.json(
        { valid: false, type: 'invalid', message: 'This code is no longer valid.' },
        { status: 400 }
      );
    }

    // Check if expired
    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    if (expiresAt < now || data.status === 'expired') {
      // Update status to expired if not already
      if (data.status !== 'expired') {
        await supabaseAdmin
          .from('access_codes')
          .update({ status: 'expired' })
          .eq('id', data.id);
      }

      return NextResponse.json(
        {
          valid: false,
          type: 'expired',
          message: 'This code has expired. Please ask the person who referred you to request a new one.'
        },
        { status: 400 }
      );
    }

    // Code is valid
    return NextResponse.json({
      valid: true,
      personName: data.requests?.person_first_name || '',
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return NextResponse.json(
      { valid: false, type: 'error', message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
