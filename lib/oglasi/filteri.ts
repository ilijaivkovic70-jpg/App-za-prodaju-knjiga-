export type OglasiFilteri = {
  smerId: string | null;
  godina: number | null;
  predmetId: string | null;
  tip: string | null;
  cenaMin: number | null;
  cenaMax: number | null;
};

const VALIDNI_TIPOVI = ["knjiga", "skripta", "beleske", "zbirka", "ostalo"];

export function parsirajFiltere(
  params: Record<string, string | string[] | undefined>
): OglasiFilteri {
  const uzmi = (kljuc: string) => {
    const vrednost = params[kljuc];
    return Array.isArray(vrednost) ? vrednost[0] : vrednost;
  };

  const godina = uzmi("godina");
  const tip = uzmi("tip");
  const cenaMin = uzmi("cena_min");
  const cenaMax = uzmi("cena_max");

  return {
    smerId: uzmi("smer_id") || null,
    godina: godina ? Number(godina) : null,
    predmetId: uzmi("predmet_id") || null,
    tip: tip && VALIDNI_TIPOVI.includes(tip) ? tip : null,
    cenaMin: cenaMin ? Number(cenaMin) : null,
    cenaMax: cenaMax ? Number(cenaMax) : null,
  };
}

type UpitSaFilterima = {
  eq(kolona: string, vrednost: unknown): UpitSaFilterima;
  gte(kolona: string, vrednost: unknown): UpitSaFilterima;
  lte(kolona: string, vrednost: unknown): UpitSaFilterima;
};

export function primeniFiltereNaUpit(
  upit: unknown,
  filteri: OglasiFilteri
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  let rezultat = upit as UpitSaFilterima;
  if (filteri.smerId) rezultat = rezultat.eq("smer_id", filteri.smerId);
  if (filteri.godina) rezultat = rezultat.eq("godina", filteri.godina);
  if (filteri.predmetId) rezultat = rezultat.eq("predmet_id", filteri.predmetId);
  if (filteri.tip) rezultat = rezultat.eq("tip", filteri.tip);
  if (filteri.cenaMin != null) rezultat = rezultat.gte("cena", filteri.cenaMin);
  if (filteri.cenaMax != null) rezultat = rezultat.lte("cena", filteri.cenaMax);
  return rezultat;
}
