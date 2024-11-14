import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const supabase = createClient();
    const { companyId } = params;
    const searchParams = req.nextUrl.searchParams;

    // Get and validate query parameters
    const roleType = searchParams.get('roleType') as RoleType | null;
    const platform = searchParams.get('platform') as Platform | null;
    const status = searchParams.get('status') as SubmissionStatus | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Validate roleType if provided
    if (roleType && !ROLE_TYPES.includes(roleType)) {
      return NextResponse.json(
        { error: "Invalid role type" },
        { status: 400 }
      );
    }

    // Validate platform if provided
    if (platform && !PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { error: "Invalid platform" },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !SUBMISSION_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    // Validate dates if provided
    if (startDate && !isValidDate(startDate)) {
      return NextResponse.json(
        { error: "Invalid start date format" },
        { status: 400 }
      );
    }

    if (endDate && !isValidDate(endDate)) {
      return NextResponse.json(
        { error: "Invalid end date format" },
        { status: 400 }
      );
    }

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

    // Build the query
    let query = supabase
    .from("submissions")
    .select(`
        id,
        platform,
        score,
        questions_count,
        test_cases,
        status,
        assessment_received,
        assessment_taken,
        response_received,
        comments,
        roles:role_id ( 
            title,
            role_type
        )
    `, { count: 'exact' })
    .eq("company_id", companyId);


    // Apply filters
    if (roleType) {
      query = query.eq("roles.role_type", roleType);
    }

    if (platform) {
      query = query.eq("platform", platform);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (startDate) {
      query = query.gte("assessment_received", startDate);
    }

    if (endDate) {
      query = query.lte("assessment_received", endDate);
    }

    // Execute the query
    const { data: submissions, error: submissionsError, count } = await query
      .order("assessment_received", { ascending: false });

    if (submissionsError) {
      console.error("Submissions fetch error:", submissionsError);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }

    // Process the submissions to match the API response format
    const processedSubmissions = submissions?.map(submission => {
      const { roles, ...submissionData } = submission;

      const role = Array.isArray(roles) ? roles[0] : roles;

      return {
        ...submissionData,
        role: {
          title: role?.title || '',
          type: role?.role_type || ''
        }
      };
    }) || [];

    return NextResponse.json({
      submissions: processedSubmissions,
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

// Helper function to validate date string format (YYYY-MM-DD)
function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}