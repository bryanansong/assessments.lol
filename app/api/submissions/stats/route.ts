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

    // Fetch all submissions for the user
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select(`
        platform,
        score,
        questions_count,
        test_cases,
        status
      `)
      .eq("profile_id", profile.id);

    if (submissionsError) {
      console.error("Submissions fetch error:", submissionsError);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }

    // Initialize response object
    const stats = {
      totalSubmissions: 0,
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

    if (!submissions || submissions.length === 0) {
      return NextResponse.json(stats);
    }

    // Calculate total submissions
    stats.totalSubmissions = submissions.length;

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
          // Assuming questions_count represents total questions
          // and completed questions are stored somewhere (this might need adjustment)
          return sum + (sub.questions_count || 0);
        }
        return sum;
      }, 0) / hackerrankSubmissions.length;

      stats.averageScores.hackerrank.completion = Math.round(completionRate * 100) / 100;

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

    return NextResponse.json(stats);

  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}