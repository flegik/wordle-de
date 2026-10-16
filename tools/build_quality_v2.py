"""Phase-8 AI editorial policy. Reproducible offline; no invented dictionary claims."""
import json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'data'
def read(path):
 s=path.read_text();return json.loads(s[s.index('{'):s.rindex(';')])
def outputs():
 old=read(D/'words-de-2.js');q=read(D/'word-quality-de-2.js');audit=json.loads((D/'review/word-audit-de-1.json').read_text());policy=json.loads((D/'quality/phase8/editorial-groups.json').read_text())
 pool={w for a in old['solutions'].values() for w in a};decisions={};ignored=[]
 for group in policy['groups']:
  for w in group['words'].split():
   if w not in pool:ignored.append(w);continue
   decision={'action':group['action'],'reason':group['reason'],'method':'explicit-ai-editorial','reviewer':policy['reviewer']}
   if w in decisions:assert decisions[w]['action']==decision['action'],(w,decisions[w],decision)
   decisions[w]=decision
 # Existing explicit owner decisions remain binding.
 for w,c in {'LEGAT':'C','ZWINGE':'B','MONARCH':'B'}.items():decisions[w]={'action':c,'reason':'Verbindliche Projektentscheidung, erhalten.','method':'owner-protected','reviewer':'project-owner'}
 records=[];classes={};excluded=[]
 for r in audit['records']:
  w=r['word']
  if w not in pool:continue
  decision=decisions.get(w,{'action':q['classes'][w],'method':'retained-source-and-ai-group-review','reason':'Eigenständiger Begriff/Grundform im gelesenen Bestand; bisherige Klasse konservativ beibehalten. Keine externe Einzelfreigabe.','reviewer':policy['reviewer']})
  if decision['action']=='remove':excluded.append(w)
  else:classes[w]=decision['action']
  records.append({'word':w,'length':len(w),**decision,'previousClass':q['classes'][w],'sourceAudit':'data/review/word-audit-de-1.json','sourceClassification':r['classification'],'uncertainty':'Spielbekanntheit ist subjektiv; KI-Einschätzung, kein empirischer Bekanntheitsnachweis.'})
 new={'version':'de-2.2','solutions':{n:[w for w in a if w not in excluded] for n,a in old['solutions'].items()},'accepted':old['accepted']}
 quality={'reviewStatus':'ai-editorial','version':'quality-3','wordVersion':'de-2.2','classes':classes,'provisional':False,'pendingReview':[],'policy':'data/quality/phase8/editorial-groups.json','reviewLimit':'AI editorial estimates. Retained group-reviewed words were not individually dictionary-researched.','auditSha256':q['auditSha256']}
 reasons=list(dict.fromkeys(r['reason'] for r in records))
 for r in records:
  r['reasonId']=reasons.index(r.pop('reason'));r.pop('reviewer');r.pop('sourceAudit');r.pop('uncertainty')
 review={'reviewer':policy['reviewer'],'sourceAudit':'data/review/word-audit-de-1.json','uncertainty':'Spielbekanntheit ist subjektiv; KI-Einschätzung, kein empirischer Bekanntheitsnachweis.','reasons':reasons,'schema':1,'version':'quality-3','baseWordVersion':'de-2','wordVersion':'de-2.2','method':policy['method'],'ignoredNonSolutionTokens':sorted(set(ignored)),'counts':{c:sum(v==c for v in classes.values()) for c in 'ABC'},'excludedCount':len(excluded),'explicitCount':len(decisions),'retainedCount':len(pool)-len(decisions),'records':records}
 for n,a in new['solutions'].items():assert len(a)>150 and all(w in new['accepted'][n] for w in a)
 assert all(classes[w]==c for w,c in {'LEGAT':'C','MONARCH':'B','ZWINGE':'B'}.items())
 return {D/'words-de-2.2.js':'/* AI editorial subset; historic packages unchanged. See WORDLISTS.md. */\nglobalThis.WORDS_DE_22 = '+json.dumps(new,ensure_ascii=False)+';\n',D/'word-quality-de-2.2.js':'/* AI editorial game classes; individual and retained decisions in quality/phase8/review.json. */\nglobalThis.WordQualityV22 = '+json.dumps(quality,ensure_ascii=False)+';\n',D/'quality/phase8/review.json':json.dumps(review,ensure_ascii=False,separators=(',',':'))+'\n'}
if __name__=='__main__':
 for p,text in outputs().items():p.write_text(text)
 print('Generated de-2.2 and complete AI decision ledger; de-1/de-2 preserved.')
