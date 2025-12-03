// Translation service removed; keeping stub so legacy imports do not fail if added later.
export class TranslateService {
  lang: 'en' = 'en';
  lang$ = { subscribe: () => ({ unsubscribe() {} }) } as any;
  setLang(_lang: 'en') {}
  t(key: string) { return key; }
}
