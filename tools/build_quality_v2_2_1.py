"""Reproduce de-2.3 and its complete editorial ledger; no downloads or runtime dependencies."""
import json, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
D=ROOT/'data'
def read(path):
    s=path.read_text();return json.loads(s[s.index('{'):s.rindex(';')])
def outputs():
    old=read(D/'words-de-2.2.js');q=read(D/'word-quality-de-2.2.js')
    policy=json.loads((D/'quality/v2-2-1/policy.json').read_text())
    pool=set(sum(old['solutions'].values(),[]));decisions={}
    for group in policy['groups']:
        for word in group['words']:
            assert word in pool and word not in decisions,word
            assert group['action'] in ['remove','A','B','C']
            decisions[word]={'action':group['action'],'reason':group['reason']}
    for word in policy['protected']:assert decisions.get(word,{}).get('action')!='remove',word
    classes={};records=[]
    for word in sorted(pool):
        previous=q['classes'][word]
        decision=decisions.get(word,{'action':previous,'reason':'Bekannten eigenständigen Begriff nach vollständiger redaktioneller Listensichtung beibehalten; subjektive Spielbarkeitsentscheidung, kein empirischer Bekanntheitsbeleg.'})
        if decision['action']!='remove':classes[word]=decision['action']
        records.append({'word':word,'length':len(word),'previousClass':previous,**decision,'changed':decision['action']!=previous})
    added=[]
    for a in policy['additions']:
        word=a['word'];assert word not in pool and 4<=len(word)<=7 and word==word.upper()
        classes[word]=a['class'];added.append(word)
        records.append({'word':word,'length':len(word),'previousClass':None,'action':a['class'],'reason':a['reason'],'changed':True})
    solutions={n:sorted([w for w in old['solutions'][n] if w in classes]+[w for w in added if len(w)==int(n)]) for n in old['solutions']}
    accepted={n:list(a)+[w for w in added if len(w)==int(n) and w not in a] for n,a in old['accepted'].items()}
    new={'version':'de-2.3','solutions':solutions,'accepted':accepted}
    for n,a in solutions.items():assert len(a)==len(set(a)) and all(w in accepted[n] for w in a)
    quality={**q,'version':'quality-4','wordVersion':'de-2.3','classes':classes,'policy':'data/quality/v2-2-1/policy.json','reviewLimit':policy['reviewer'],'pendingReview':[]}
    before={n:len(a) for n,a in old['solutions'].items()};after={n:len(a) for n,a in solutions.items()}
    review={'schema':1,'baseWordVersion':old['version'],'wordVersion':new['version'],'qualityVersion':quality['version'],'reviewer':policy['reviewer'],'scope':policy['scope'],'baseSha256':hashlib.sha256((D/'words-de-2.2.js').read_bytes()).hexdigest(),'before':before,'after':after,'records':records}
    removed=[r for r in records if r['action']=='remove'];reclass=[r for r in records if r['previousClass'] is not None and r['action']!='remove' and r['changed']]
    report=['# WORDLE DE 2.2.1 · Wortqualität','', 'PWA-Veröffentlichung am 16.10.2026 ausdrücklich freigegeben. Basis de-2.2 → de-2.3 / quality-4. Cloudflare-Worker-Update wartet auf die erforderliche Anmeldung.','',policy['scope'],'',policy['reviewer']+'. Sprachliche Korrektheit ist kein Nachweis allgemeiner Bekanntheit. Die Klassen sind redaktionelle Schwierigkeitsurteile, keine gemessenen Häufigkeitswerte.','', '| Länge | Vorher | Nachher |','|---|---:|---:|']
    for n in before:report.append(f'| {n} | {before[n]} | {after[n]} |')
    report += [f'| Gesamt | {sum(before.values())} | {sum(after.values())} |','',f'{len(added)} Ergänzung; {len(removed)} Lösungen entfernt; {len(reclass)} bestehende Lösungen neu klassifiziert. Alle {len(pool)} bisherigen Lösungen und jede Ergänzung stehen genau einmal in `data/quality/v2-2-1/review.json`.','', '## Ergänzungen','']
    for a in policy['additions']:report.append(f"- **{a['word']}** · {a['class']}: {a['reason']} Beleg: {a['evidence']}")
    report += ['', 'Die bestehenden Themen-Pools themes-1 bleiben eingefroren; sie schalten aktuell keine Sieben-Buchstaben-Rätsel frei. Keine neuen Themenlösungen eingeführt. Keine Wörter aus dem Eingabewörterbuch entfernt. Alle ausgeschlossenen Lösungen bleiben Ratewörter. Geschützte Beispiele IGEL, OTTER, DACHS, FUCHS, AMSEL und LEGAT bleiben Lösungen. OPOSSUM wird vorsichtig als Lösung ausgeschlossen; TAPIR bleibt als B erhalten.','', '## Aus dem Lösungspool entfernt','', '| Wort | Vorher | Begründung |','|---|---|---|']
    report += [f"| {r['word']} | {r['previousClass']} | {r['reason']} |" for r in removed]
    report += ['', '## Neu klassifiziert','', '| Wort | Vorher | Neu | Begründung |','|---|---|---|---|']
    report += [f"| {r['word']} | {r['previousClass']} | {r['action']} | {r['reason']} |" for r in reclass]
    report += ['', '## Kompatibilität und Rollout','', 'Eingabe-Ergänzung NUTZUNG wird als additive Registry-Sicht auch für historische Runden erlaubt; die eingefrorenen Dateien, Zielpools, Reihenfolgen und Daily-Berechnung bleiben unverändert. Alte gespeicherte Ziele bleiben gültig. Alte Qualitätsklassen werden separat aufgelöst. Restbeutel werden gefiltert und neu einsortiert; verbrauchte Wörter bleiben verbraucht, NUTZUNG kommt einmal hinzu, Cooldown und Zyklus bleiben erhalten. Survivor hat weiterhin drei Herzen und Upgrades alle sieben Siege (Vertrag 3).','', 'Die vorbereitete Online-API wählt neue Wörter nach dem angefragten unterstützten Wortvertrag. Ohne Versionswunsch bleibt de-2.2 für alte Clients erhalten. Ein neuer Client fällt bei einem alten API-Stand nur nach explizitem invalid_request auf den alten Erstellvertrag zurück. Bestehende Räume behalten ihre Ziel-/Wortversion. NUTZUNG wird serverseitig erst nach gesondert freigegebenem Worker-Deployment akzeptiert; es fand kein Cloudflare-Deployment statt. Alte Clients können de-2.3-Räume nicht lesen; beide Spieler müssen dafür den später freigegebenen neuen Client verwenden. Ein Beitritt zu de-2.3 benötigt die Versionsangabe; alte Clients erhalten vor Belegen des zweiten Platzes client_update_required. Der vorübergehende Fallback auf einen alten Service benötigt zwei Anfragen und zählt in dessen bestehendes Rate-Limit.','', 'PWA-Release-Cache: v2-2-1-release-20261016-a. Der Client-Fallback erlaubt die PWA-Veröffentlichung vor dem Worker-Update; auf dem alten Service bleiben Online-Ziele de-2.2 und NUTZUNG dort noch ungültig. Worker-Rollout nach sicherer Anmeldung separat prüfen. Backup-, Auswahl- und Modustests siehe TESTING.md. Keine neuen echten Browser- oder Gerätetests behauptet.','']
    reasons=list(dict.fromkeys(r['reason'] for r in records))
    compact={**review,'reasons':reasons,'records':[{**{k:v for k,v in r.items() if k!='reason'},'reasonId':reasons.index(r['reason'])} for r in records]}
    return {D/'words-de-2.3.js':'/* Editorial subset plus owner-supplied NUTZUNG. Existing licenses: WORDLISTS.md. */\nglobalThis.WORDS_DE_23 = '+json.dumps(new,ensure_ascii=False)+';\n',D/'word-quality.js':'/* Complete reproducible editorial review: data/quality/v2-2-1/review.json. */\nglobalThis.WordQuality = '+json.dumps(quality,ensure_ascii=False)+';\n',D/'quality/v2-2-1/review.json':json.dumps(compact,ensure_ascii=False,separators=(',',':'))+'\n',ROOT/'docs/WORD_QUALITY_2_2_1.md':'\n'.join(report)}
if __name__=='__main__':
    for path,text in outputs().items():path.write_text(text)
    print('Reproduced de-2.3 / quality-4, complete review ledger and report.')
