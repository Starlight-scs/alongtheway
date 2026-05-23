import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const { data, error } = await supabaseAdmin
      .from('study_rooms')
      .select('id, title, description, slug, status, is_recurring, starts_at')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching study room:', error);
    return NextResponse.json(
      { error: 'Failed to fetch study room' },
      { status: 500 }
    );
  }
}
