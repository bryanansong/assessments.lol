import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const supabase = createClient();
    const { companyId } = params;

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify company exists
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

    // Fetch all submissions for the company
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select(`
        platform,
        score,
        questions_count,
        test_cases,
        status,
        roles (
          role_type
        )
      `)
      .eq("company_id", companyId);

    if (submissionsError) {
      console.error("Submissions fetch error:", submissionsError);
      return NextResponse.json(
        { error: "Failed to fetch submissions" },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = calculateCompanyStats(submissions || []);

    return NextResponse.json(stats);

  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateCompanyStats(submissions: any[]) {
  // Initialize stats object
  const stats = {
    scoreDistribution: {
      codesignal: [] as { score: number; count: number }[],
      hackerrank: {
        completion: [] as { rate: number; count: number }[],
        testCases: [] as { count: number; submissions: number }[]
      }
    },
    roleBreakdown: {} as Record<string, number>,
    successRates: {
      overall: 0,
      byRole: {} as Record<string, number>,
      byPlatform: {} as Record<string, number>
    },
    platformStats: {
      codesignal: {
        average: 0,
        median: 0,
        range: { min: 0, max: 0 }
      },
      hackerrank: {
        averageCompletion: 0,
        averageTestCases: 0
      }
    }
  };

  if (submissions.length === 0) {
    return stats;
  }

  // CodeSignal score distribution and stats
  const codesignalSubmissions = submissions.filter(
    s => s.platform === 'CODESIGNAL' && s.score !== null
  );

  if (codesignalSubmissions.length > 0) {
    const scores = codesignalSubmissions.map(s => s.score).sort((a, b) => a - b);
    const scoreCount = new Map<number, number>();
    
    scores.forEach(score => {
      scoreCount.set(score, (scoreCount.get(score) || 0) + 1);
    });

    stats.scoreDistribution.codesignal = Array.from(scoreCount.entries())
      .map(([score, count]) => ({ score, count }))
      .sort((a, b) => a.score - b.score);

    stats.platformStats.codesignal = {
      average: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 100) / 100,
      median: scores.length % 2 === 0
        ? (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2
        : scores[Math.floor(scores.length / 2)],
      range: {
        min: scores[0],
        max: scores[scores.length - 1]
      }
    };
  }

  // HackerRank stats
  const hackerrankSubmissions = submissions.filter(
    s => s.platform === 'HACKERRANK'
  );

  if (hackerrankSubmissions.length > 0) {
    // Completion rate distribution
    const completionRates = new Map<number, number>();
    let totalCompletion = 0;
    let totalTestCaseRate = 0;

    hackerrankSubmissions.forEach(sub => {
      if (sub.questions_count) {
        const rate = Math.round((sub.questions_count / 100) * 100); // Assuming 100 is max
        completionRates.set(rate, (completionRates.get(rate) || 0) + 1);
        totalCompletion += sub.questions_count;
      }

      if (sub.test_cases) {
        const testCases = sub.test_cases as Record<string, boolean>;
        const testEntries = Object.entries(testCases);
        const passRate = testEntries.filter(([_, passed]) => passed).length / testEntries.length;
        totalTestCaseRate += passRate;
      }
    });

    stats.scoreDistribution.hackerrank.completion = Array.from(completionRates.entries())
      .map(([rate, count]) => ({ rate, count }))
      .sort((a, b) => a.rate - b.rate);

    stats.platformStats.hackerrank = {
      averageCompletion: Math.round(totalCompletion / hackerrankSubmissions.length * 100) / 100,
      averageTestCases: Math.round(totalTestCaseRate / hackerrankSubmissions.length * 100) / 100
    };
  }

  // Role breakdown
  submissions.forEach(sub => {
    const roleType = sub.roles?.role_type;
    if (roleType) {
      stats.roleBreakdown[roleType] = (stats.roleBreakdown[roleType] || 0) + 1;
    }
  });

  // Success rates
  const successfulSubmissions = submissions.filter(s => s.status === 'MOVED_FORWARD');
  stats.successRates.overall = Math.round(
    (successfulSubmissions.length / submissions.length) * 100
  ) / 100;

  // Success rates by role
  Object.keys(stats.roleBreakdown).forEach(role => {
    const roleSubmissions = submissions.filter(s => s.roles?.role_type === role);
    const roleSuccesses = roleSubmissions.filter(s => s.status === 'MOVED_FORWARD');
    stats.successRates.byRole[role] = Math.round(
      (roleSuccesses.length / roleSubmissions.length) * 100
    ) / 100;
  });

  // Success rates by platform
  ['CODESIGNAL', 'HACKERRANK'].forEach(platform => {
    const platformSubmissions = submissions.filter(s => s.platform === platform);
    if (platformSubmissions.length > 0) {
      const platformSuccesses = platformSubmissions.filter(s => s.status === 'MOVED_FORWARD');
      stats.successRates.byPlatform[platform] = Math.round(
        (platformSuccesses.length / platformSubmissions.length) * 100
      ) / 100;
    }
  });

  return stats;
}