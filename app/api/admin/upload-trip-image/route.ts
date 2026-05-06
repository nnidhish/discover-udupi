import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { createSupabaseServiceClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  // Verify auth token from Authorization header
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createSupabaseServiceClient();

  // Verify user identity and admin status
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Parse uploaded file
  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());

  // Convert with same settings as scripts/optimize-images.js
  const webpBuffer = await sharp(buffer)
    .resize(1200, 800, { fit: 'cover' })
    .webp({ quality: 100 })
    .toBuffer();

  // Upload to Supabase Storage
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
  const { data, error: uploadError } = await supabase.storage
    .from('trip-covers')
    .upload(filename, webpBuffer, { contentType: 'image/webp', upsert: false });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage
    .from('trip-covers')
    .getPublicUrl(data.path);

  return NextResponse.json({ url: publicUrl });
}
