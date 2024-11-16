import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const supabase = createClient();
    const { companyId } = params;

    // First verify if the company exists
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id")
      .eq("id", companyId)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Fetch all roles for the company
    const { data: roles, error: rolesError } = await supabase
      .from("roles")
      .select(`
        id,
        title,
        role_type
      `)
      .eq("company_id", companyId)
      .order("title");

    if (rolesError) {
      console.error("Roles fetch error:", rolesError);
      return NextResponse.json(
        { error: "Failed to fetch roles" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      roles: roles || []
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}