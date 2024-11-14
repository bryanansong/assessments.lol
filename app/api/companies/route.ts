import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { Platform, RoleType, PLATFORMS, ROLE_TYPES } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = req.nextUrl.searchParams;

    // Get and validate query parameters
    const search = searchParams.get('search');
    const roleType = searchParams.get('roleType') as RoleType | null;
    const platform = searchParams.get('platform') as Platform | null;
    const timeframe = searchParams.get('timeframe');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

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

    // Start building the query
    let query = supabase
      .from('companies')
      .select(`
        id,
        name,
        icon,
        link,
        submissions!inner (
          id,
          platform,
          score,
          created_at,
          roles!inner (
            role_type
          )
        )`, 
        { count: 'exact' }
      );

    // Apply filters
    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    if (roleType) {
      query = query.eq('submissions.roles.role_type', roleType);
    }

    if (platform) {
      query = query.eq('submissions.platform', platform);
    }

    if (timeframe) {
      const timeframeDate = new Date();
      timeframeDate.setDate(timeframeDate.getDate() - parseInt(timeframe));
      query = query.gte('submissions.created_at', timeframeDate.toISOString());
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute the query
    const { data: companies, error, count } = await query;

    if (error) {
      console.error('Database query error:', error);
      return NextResponse.json(
        { error: "Failed to fetch companies" },
        { status: 500 }
      );
    }

    // Process the data to calculate required metrics
    const processedCompanies = companies.reduce((acc, company) => {
      const submissions = company.submissions || [];
      const submissionCount = submissions.length;
      const scores = submissions.map(s => s.score).filter(Boolean);
      const averageScore = scores.length > 0 
        ? scores.reduce((a, b) => a + b, 0) / scores.length 
        : 0;
      const recentActivity = submissions.length > 0
        ? submissions.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0].created_at
        : null;

      // Remove the submissions from the final output
      const { submissions: _, ...companyData } = company;

      acc.push({
        ...companyData,
        submissionCount,
        averageScore: Math.round(averageScore * 100) / 100,
        recentActivity,
      });
      return acc;
    }, []);

    return NextResponse.json({
      companies: processedCompanies,
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