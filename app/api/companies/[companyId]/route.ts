import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/libs/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { companyId: string } }
) {
  try {
    const supabase = createClient();
    const { companyId } = params;

    // Fetch company basic info
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, name, icon, link")
      .eq("id", companyId)
      .single();

    if (companyError) {
      console.error("Company fetch error:", companyError);
      return NextResponse.json(
        { error: "Failed to fetch company" },
        { status: 500 }
      );
    }

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Fetch all submissions for this company
    const { data: submissions, error: submissionsError } = await supabase
      .from("submissions")
      .select(`
        id,
        platform,
        score,
        questions_count,
        test_cases,
        status,
        roles (
          id,
          role_type
        )
      `)
      .eq("company_id", companyId);

    if (submissionsError) {
      console.error("Submissions fetch error:", submissionsError);
      return NextResponse.json(
        { error: "Failed to fetch company statistics" },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = calculateCompanyStats(submissions || []);

    return NextResponse.json({
      ...company,
      stats
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function calculateCompanyStats(submissions: any[]) {
  const totalSubmissions = submissions.length;
  if (totalSubmissions === 0) {
    return {
      totalSubmissions: 0,
      averageScores: {
        codesignal: 0,
        hackerrank: {
          completion: 0,
          testCases: 0
        }
      },
      successRates: {
        overall: 0,
        byRole: {}
      }
    };
  }

  // CodeSignal scores
  const codesignalSubmissions = submissions.filter(s => 
    s.platform === 'CODESIGNAL' && s.score !== null
  );
  const averageCodesignal = codesignalSubmissions.length > 0
    ? codesignalSubmissions.reduce((acc, s) => acc + s.score, 0) / codesignalSubmissions.length
    : 0;

  // HackerRank stats
  const hackerrankSubmissions = submissions.filter(s => 
    s.platform === 'HACKERRANK' && s.questions_count !== null
  );
  
  const hackerrankStats = hackerrankSubmissions.reduce((acc, s) => {
    const totalTests = s.test_cases ? Object.keys(s.test_cases).length : 0;
    const passedTests = s.test_cases ? 
      Object.values(s.test_cases).filter(val => val === true).length : 0;
    
    return {
      totalQuestions: acc.totalQuestions + s.questions_count,
      totalTests: acc.totalTests + totalTests,
      passedTests: acc.passedTests + passedTests,
      count: acc.count + 1
    };
  }, { totalQuestions: 0, totalTests: 0, passedTests: 0, count: 0 });

  // Success rates
  const successfulSubmissions = submissions.filter(s => 
    s.status === 'MOVED_FORWARD'
  );

  const overallSuccessRate = (successfulSubmissions.length / totalSubmissions) * 100;

  // Success rates by role
  const roleSuccessRates = submissions.reduce((acc, s) => {
    const roleType = s.roles?.role_type;
    if (!roleType) return acc;

    if (!acc[roleType]) {
      acc[roleType] = {
        total: 0,
        successful: 0
      };
    }

    acc[roleType].total++;
    if (s.status === 'MOVED_FORWARD') {
      acc[roleType].successful++;
    }

    return acc;
  }, {});

  const successRatesByRole = Object.entries(roleSuccessRates).reduce<Record<string, number>>((acc, [role, stats]: [string, any]) => {
    acc[role] = (stats.successful / stats.total) * 100;
    return acc;
  }, {});

  return {
    totalSubmissions,
    averageScores: {
      codesignal: Math.round(averageCodesignal * 100) / 100,
      hackerrank: {
        completion: hackerrankStats.count > 0 
          ? Math.round((hackerrankStats.totalQuestions / (hackerrankStats.count * 100)) * 100) 
          : 0,
        testCases: hackerrankStats.totalTests > 0
          ? Math.round((hackerrankStats.passedTests / hackerrankStats.totalTests) * 100)
          : 0
      }
    },
    successRates: {
      overall: Math.round(overallSuccessRate * 100) / 100,
      byRole: Object.entries(successRatesByRole).reduce<Record<string, number>>((acc, [role, rate]) => {
        acc[role] = Math.round(rate * 100) / 100;
        return acc;
      }, {})
    }
  };
}