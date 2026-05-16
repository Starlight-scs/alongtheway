import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { generateAccessCode } from '@/lib/codes';
import { intakeSchema } from '@/lib/validations';
import { sendMinisterEmail, sendReferrerEmailTo, sendAdminEmail } from '@/lib/emails';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const result = intakeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: true, message: result.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const validated = result.data;

    // 1. Create request record
    const { data: requestData, error: requestError } = await supabaseAdmin
      .from('requests')
      .insert({
        referrer_name: validated.referrerName,
        referrer_email: validated.referrerEmail,
        referrer_relationship: validated.referrerRelationship,
        person_first_name: validated.personFirstName,
        person_email: validated.personEmail || null,
        person_phone: validated.personPhone || null,
        situation: validated.situation,
        prayer_requests: validated.prayerRequests,
        notes_for_ministers: validated.notesForMinisters || null,
        how_heard: validated.howHeard || null,
      })
      .select()
      .single();

    if (requestError) {
      console.error('Request insert error:', requestError);
      throw new Error('Failed to create request');
    }

    // 2. Generate access code (60-day expiry)
    const code = generateAccessCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);

    const { error: codeError } = await supabaseAdmin
      .from('access_codes')
      .insert({
        request_id: requestData.id,
        code,
        expires_at: expiresAt.toISOString(),
        status: 'active',
      });

    if (codeError) {
      console.error('Code insert error:', codeError);
      throw new Error('Failed to generate access code');
    }

    // 3. Send emails (don't block on email failures)
    const bookingUrl = `${process.env.NEXT_PUBLIC_URL}/book`;

    // Send emails in parallel, but don't fail the request if emails fail
    const emailPromises = [
      // Email to Mama & Papa
      sendMinisterEmail({
        referrerName: validated.referrerName,
        personName: validated.personFirstName,
        situation: validated.situation,
        prayerRequests: validated.prayerRequests,
        notes: validated.notesForMinisters,
      }).catch((err) => console.error('Minister email failed:', err)),

      // Email to Referrer
      sendReferrerEmailTo(validated.referrerEmail, {
        personName: validated.personFirstName,
        code,
        bookingUrl,
      }).catch((err) => console.error('Referrer email failed:', err)),

      // Email to Admin
      sendAdminEmail({
        referrerName: validated.referrerName,
        personName: validated.personFirstName,
        adminUrl: `${process.env.NEXT_PUBLIC_URL}/admin`,
      }).catch((err) => console.error('Admin email failed:', err)),
    ];

    // Wait for all emails but don't fail if they fail
    await Promise.allSettled(emailPromises);

    return NextResponse.json(
      { success: true, message: 'Request submitted successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Intake error:', error);
    return NextResponse.json(
      { error: true, message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
