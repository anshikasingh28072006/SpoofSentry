import { AnalysisResponse, WeightedAssessment, VerdictType } from '../types';

export function computeWeightedAssessment(
  result: AnalysisResponse,
  headersUnavailable: boolean = false
): WeightedAssessment {
  const authMax = 45;
  let authScore = 0;
  const authDetails: string[] = [];

  const isHeadersMissing = headersUnavailable || result.headersUnavailable || false;

  if (isHeadersMissing) {
    authDetails.push('Not available — no raw headers to check');
  } else {
    const spfStatus = result.authentication.spf.status;
    const dkimStatus = result.authentication.dkim.status;
    const dmarcStatus = result.authentication.dmarc.status;
    const mismatch = result.sender_alignment.domain_mismatch;

    if (spfStatus === 'FAIL') {
      authScore += 18;
      authDetails.push('SPF failed (+18)');
    } else if (spfStatus === 'NONE') {
      authScore += 9;
      authDetails.push('SPF not published (+9)');
    }

    if (dkimStatus === 'FAIL' || dkimStatus === 'NONE') {
      authScore += 12;
      authDetails.push(dkimStatus === 'NONE' ? 'DKIM missing (+12)' : 'DKIM failed (+12)');
    }

    if (dmarcStatus !== 'PASS') {
      authScore += 10;
      authDetails.push('DMARC not enforced (+10)');
    }

    if (mismatch) {
      authScore += 5;
      authDetails.push('From/Return-Path mismatch (+5)');
    }

    if (authDetails.length === 0) {
      authDetails.push('All authentication checks passed');
    }
  }

  authScore = Math.min(authScore, authMax);

  // Content risk (30 max)
  const contentMax = 30;
  const urgencyCount = result.content_analysis.urgency_count || 0;
  const paymentCount = result.content_analysis.financial_count || 0;
  const threatCount = result.content_analysis.threat_count || 0;

  const contentScore = Math.min(
    Math.min(urgencyCount, 3) * 4 +
      Math.min(paymentCount, 3) * 4 +
      Math.min(threatCount, 3) * 2,
    contentMax
  );

  // Link risk (15 max)
  const linkMax = 15;
  let linkScore = 0;
  const hasIpLink = (result.content_analysis.raw_ip_links && result.content_analysis.raw_ip_links.length > 0);
  const linkCount = result.content_analysis.link_count || 0;

  if (hasIpLink) {
    linkScore = 15;
  } else if (linkCount >= 2) {
    linkScore = 5;
  }

  // Timing (10 max)
  const timingMax = 10;
  const timingScore = result.timing_analysis.is_off_hours ? 10 : 0;

  const totalScore = authScore + contentScore + linkScore + timingScore;
  const totalMax = 100;

  let verdict: VerdictType = 'LEGITIMATE';
  if (totalScore >= 60) {
    verdict = 'SPOOFED';
  } else if (totalScore >= 30) {
    verdict = 'SUSPICIOUS';
  }

  const explainParts: string[] = [];
  if (authScore >= 25) explainParts.push('failed sender authentication');
  else if (authScore > 0) explainParts.push('weak sender authentication');
  if (contentScore >= 15) explainParts.push('high-pressure urgency/payment language');
  if (linkScore >= 10) explainParts.push('a suspicious raw-IP link');
  if (timingScore > 0) explainParts.push('an off-hours send time');

  const explainText = explainParts.length
    ? `This email scored ${verdict} mainly due to ${explainParts.join(', ')}.`
    : 'This email shows no significant risk signals across any category.';

  return {
    totalScore,
    totalMax,
    verdict,
    explainText,
    authScore,
    authMax,
    authDetails,
    contentScore,
    contentMax,
    linkScore,
    linkMax,
    timingScore,
    timingMax,
    headersUnavailable: isHeadersMissing
  };
}
