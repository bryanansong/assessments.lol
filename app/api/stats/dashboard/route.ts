import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

export async function GET(req: NextRequest) {
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

    // Fetch recent submissions for the user
    const { data: recentSubmissions, error: recentError } = await supabase
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
      companies:company_id (
        name,
        icon
      ),
      roles:role_id (
        title,
        role_type
      )
    `)
    .eq("profile_id", profile.id)
    .order('created_at', { ascending: false })
    .limit(5);
  

    if (recentError) {
      console.error("Recent submissions fetch error:", recentError);
      return NextResponse.json(
        { error: "Failed to fetch recent submissions" },
        { status: 500 }
      );
    }

    // Fetch all submissions for personal stats
    const { data: allSubmissions, error: allError } = await supabase
      .from("submissions")
      .select(`
        platform,
        score,
        questions_count,
        test_cases,
        status
      `)
      .eq("profile_id", profile.id);

    if (allError) {
      console.error("All submissions fetch error:", allError);
      return NextResponse.json(
        { error: "Failed to fetch submission statistics" },
        { status: 500 }
      );
    }

    // Calculate personal statistics
    const personalStats = calculatePersonalStats(allSubmissions || []);

    // Fetch global statistics
    const [
      { count: totalUsers },
      { count: totalCompanies },
      { count: totalSubmissions }
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: 'exact', head: true }),
      supabase.from("companies").select("*", { count: 'exact', head: true }),
      supabase.from("submissions").select("*", { count: 'exact', head: true })
    ]);

    return NextResponse.json({
      recentSubmissions: recentSubmissions || [],
      personalStats,
      globalStats: {
        totalUsers: totalUsers || 0,
        totalCompanies: totalCompanies || 0,
        totalSubmissions: totalSubmissions || 0
      }
    });

  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function calculatePersonalStats(submissions: any[]) {
  const stats = {
    totalSubmissions: submissions.length,
    averageScores: {
      codesignal: 0,
      hackerrank: {
        completion: 0,
        testCases: 0
      }
    },
    statusDistribution: {
      PENDING: 0,
      REJECTED: 0,
      MOVED_FORWARD: 0,
      AWAITING_RESPONSE: 0
    }
  };

  if (submissions.length === 0) {
    return stats;
  }

  // Calculate CodeSignal average
  const codesignalSubmissions = submissions.filter(
    s => s.platform === 'CODESIGNAL' && s.score !== null
  );
  
  if (codesignalSubmissions.length > 0) {
    const totalScore = codesignalSubmissions.reduce(
      (sum, sub) => sum + (sub.score || 0),
      0
    );
    stats.averageScores.codesignal = Math.round(
      (totalScore / codesignalSubmissions.length) * 100
    ) / 100;
  }

  // Calculate HackerRank statistics
  const hackerrankSubmissions = submissions.filter(
    s => s.platform === 'HACKERRANK'
  );

  if (hackerrankSubmissions.length > 0) {
    // Calculate completion rate
    const completionRate = hackerrankSubmissions.reduce((sum, sub) => {
      if (sub.questions_count) {
        return sum + (sub.questions_count || 0);
      }
      return sum;
    }, 0) / hackerrankSubmissions.length;

    stats.averageScores.hackerrank.completion = Math.round(
      completionRate * 100
    ) / 100;

    // Calculate test cases success rate
    let totalTests = 0;
    let passedTests = 0;

    hackerrankSubmissions.forEach(sub => {
      if (sub.test_cases) {
        const testCases = sub.test_cases as Record<string, boolean>;
        const testEntries = Object.entries(testCases);
        totalTests += testEntries.length;
        passedTests += testEntries.filter(([_, passed]) => passed).length;
      }
    });

    if (totalTests > 0) {
      stats.averageScores.hackerrank.testCases = Math.round(
        (passedTests / totalTests) * 100
      ) / 100;
    }
  }

  // Calculate status distribution
  submissions.forEach(sub => {
    if (sub.status) {
      stats.statusDistribution[sub.status as keyof typeof stats.statusDistribution]++;
    }
  });

  // Convert status distribution to percentages
  Object.keys(stats.statusDistribution).forEach(status => {
    const key = status as keyof typeof stats.statusDistribution;
    stats.statusDistribution[key] = Math.round(
      (stats.statusDistribution[key] / stats.totalSubmissions) * 100
    ) / 100;
  });

  return stats;
}