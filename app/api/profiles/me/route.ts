import { NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

export async function GET() {
  try {
    const supabase = createClient();
    
    // Get the authenticated user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch the user's profile from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, email, image, has_access, created_at")
      .eq("auth_users.id", user.id)
      .single();

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to fetch profile" },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const supabase = createClient();
    const body = await req.json();

    // Get the authenticated user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Validate the request body
    const updates: { name?: string; image?: string } = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.image !== undefined) updates.image = body.image;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update the profile
    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("auth_users.id", user.id)
      .select("id, name, email, image, has_access, created_at")
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(profile);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}