import { NextResponse } from 'next/server';
import { ProductService } from '@/lib/supabaseModels';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete product using Supabase
    await ProductService.delete(id);

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Delete Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Update product using Supabase
    const updatedProduct = await ProductService.update(id, body);

    return NextResponse.json({ success: true, data: updatedProduct });
  } catch (error: any) {
    console.error("Update Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
