import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { SubmissionRequest } from "@/types";

export async function POST(req: NextRequest) {
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

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_users.id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    const body = await req.json() as SubmissionRequest;

    // Validate required fields
    if (!body.companyId || !body.roleType || !body.platform || !body.status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate enum values
    if (!ROLE_TYPES.includes(body.roleType)) {
      return NextResponse.json(
        { error: "Invalid role type" },
        { status: 400 }
      );
    }

    if (!PLATFORMS.includes(body.platform)) {
      return NextResponse.json(
        { error: "Invalid platform" },
        { status: 400 }
      );
    }

    if (!SUBMISSION_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Validate dates if provided
    const dates = [
      body.assessmentReceived,
      body.assessmentTaken,
      body.responseReceived
    ].filter(Boolean);

    for (const date of dates) {
      if (date && !isValidDate(date)) {
        return NextResponse.json(
          { error: "Invalid date format" },
          { status: 400 }
        );
      }
    }

    // Platform-specific validation
    if (body.platform === 'CODESIGNAL' && body.score !== undefined) {
      if (!Number.isInteger(body.score) || body.score < 0 || body.score > 850) {
        return NextResponse.json(
          { error: "Invalid CodeSignal score" },
          { status: 400 }
        );
      }
    }

    if (body.platform === 'HACKERRANK') {
      if (body.questionsCount !== undefined && 
          (!Number.isInteger(body.questionsCount) || body.questionsCount < 0)) {
        return NextResponse.json(
          { error: "Invalid questions count" },
          { status: 400 }
        );
      }
    }

    // First, get or create the role
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("company_id", body.companyId)
      .eq("role_type", body.roleType)
      .single();

    let roleId: string;

    if (roleError) {
      // Create new role
      const { data: newRole, error: createRoleError } = await supabase
        .from("roles")
        .insert({
          company_id: body.companyId,
          role_type: body.roleType,
          title: body.roleType // Using role type as title for now
        })
        .select("id")
        .single();

      if (createRoleError) {
        console.error("Role creation error:", createRoleError);
        return NextResponse.json(
          { error: "Failed to create role" },
          { status: 500 }
        );
      }

      roleId = newRole.id;
    } else {
      roleId = role.id;
    }

    // Create the submission
    const { data: submission, error: submissionError } = await supabase
      .from("submissions")
      .insert({
        profile_id: profile.id,
        company_id: body.companyId,
        role_id: roleId,
        platform: body.platform,
        score: body.score,
        questions_count: body.questionsCount,
        test_cases: body.testCases,
        status: body.status,
        assessment_received: body.assessmentReceived,
        assessment_taken: body.assessmentTaken,
        response_received: body.responseReceived,
        comments: body.comments
      })
      .select()
      .single();

    if (submissionError) {
      console.error("Submission creation error:", submissionError);
      return NextResponse.json(
        { error: "Failed to create submission" },
        { status: 500 }
      );
    }

    return NextResponse.json(submission);

  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to validate date string format (YYYY-MM-DD)
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = req.nextUrl.searchParams;

    // Get the authenticated user's session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get pagination parameters
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const profileId = searchParams.get('profileId');

    // Build query
    let query = supabase
      .from("submissions")
      .select(`
        *,
        companies (
          name,
          icon
        ),
        roles (
          title,
          role_type
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // If profileId is provided and matches the authenticated user's profile,
    // filter by that profile
    if (profileId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_users.id", user.id)
        .eq("id", profileId)
        .single();

      if (!profile) {
        return NextResponse.json(
          { error: "Unauthorized access to profile" },
          { status: 403 }
        );
      }

      query = query.eq("profile_id", profileId);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: submissions, error: submissionsError, count } = await query;

    if (submissionsError) {
      console.error("Submissions fetch error:", submissionsError);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      submissions: submissions || [],
      total: count || 0
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}