function n(v){const x=Number(v??0);return Number.isFinite(x)?x:0}

export function evaluatePassiveAsset(asset={}){
  const result={id:asset.id??null,title:asset.title??null,mode:'PASSIVE_ASSET',action:'RESEARCH_DEMAND',score:0,blockers:[]};
  if(!asset.deliverableReady){result.blockers.push('DELIVERABLE_NOT_READY');return result;}
  if(!asset.complianceReady){result.blockers.push('COMPLIANCE_REVIEW_REQUIRED');return result;}
  if(!asset.payoutEligible){
    result.blockers.push(asset.guardianRequired&&!asset.guardianReady?'GUARDIAN_PAYOUT_SETUP_REQUIRED':'PAYOUT_RAIL_REQUIRED');
    result.action='READY_BUT_NOT_SELLABLE';
    return result;
  }
  const score =
    (asset.evergreen?20:0)+
    Math.min(20,n(asset.searchFit)*4)+
    Math.min(20,n(asset.demandEvidence)*4)+
    Math.min(15,n(asset.differentiation)*3)+
    Math.min(15,n(asset.qualityScore)*3)+
    (n(asset.marginalCost)<=1?10:0);
  result.score=score;
  const sales=n(asset.verifiedSales), views=n(asset.views), conversion=n(asset.conversionRate);
  if(sales>=5 && conversion>0){result.action='SCALE_CATALOG';return result;}
  if(sales>=1){result.action='ITERATE_AND_KEEP_LISTED';return result;}
  if(views>=50){result.action='OPTIMIZE_LISTING';return result;}
  result.action='LIST_ONE_PRODUCT_AND_MEASURE';
  return result;
}

export function passivePortfolioPolicy(assets=[]){
  const evaluated=assets.map(evaluatePassiveAsset);
  const proven=evaluated.filter(x=>['ITERATE_AND_KEEP_LISTED','SCALE_CATALOG'].includes(x.action));
  return {
    mode:'PASSIVE_REVENUE',
    assets:evaluated,
    allowNewPassiveAsset: proven.length>0,
    rule:'Do not expand the passive catalog until one listed asset produces verified sales or equivalent real customer value.'
  };
}
