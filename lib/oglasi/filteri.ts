export type OglasiFilteri = {
  smerId: string | null;
  godina: number | null;
  predmetId: string | null;
  tip: string | null;
  cenaMin: number | null;
  cenaMax: number | null;
  pretraga: string | null;
};

export const PRAZNI_FILTERI: OglasiFilteri = {
  smerId: null,
  godina: null,
  predmetId: null,
  tip: null,
  cenaMin: null,
  cenaMax: null,
  pretraga: null,
};

const VALIDNI_TIPOVI = [
  "knjiga",
  "skripta",
  "beleske",
  "zbirka",
  "komplet",
  "ostalo",
];

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
  const pretraga = uzmi("pretraga");

  return {
    smerId: uzmi("smer_id") || null,
    godina: godina ? Number(godina) : null,
    predmetId: uzmi("predmet_id") || null,
    tip: tip && VALIDNI_TIPOVI.includes(tip) ? tip : null,
    cenaMin: cenaMin ? Number(cenaMin) : null,
    cenaMax: cenaMax ? Number(cenaMax) : null,
    pretraga: pretraga?.trim() || null,
  };
}

type UpitZaPredmete = {
  select(kolone: string): {
    ilike(
      kolona: string,
      vrednost: string
    ): PromiseLike<{ data: { id: string }[] | null }>;
  };
};

type KlijentSaPredmetima = {
  from(tabela: "predmeti"): UpitZaPredmete;
};

/** Vraća id-jeve predmeta čiji naziv odgovara pretrazi, da bi se pretraga mogla iskombinovati sa filterom na `oglasi.predmet_id`. */
export async function dohvatiIdPredmetaZaPretragu(
  supabase: KlijentSaPredmetima,
  pretraga: string
): Promise<string[]> {
  const { data } = await supabase
    .from("predmeti")
    .select("id")
    .ilike("naziv", `%${ocistiZaOrFilter(pretraga)}%`);
  return (data ?? []).map((predmet) => predmet.id);
}

function ocistiZaOrFilter(tekst: string) {
  return tekst.replace(/[,()%]/g, " ").trim();
}

type UpitSaFilterima = {
  eq(kolona: string, vrednost: unknown): UpitSaFilterima;
  gte(kolona: string, vrednost: unknown): UpitSaFilterima;
  lte(kolona: string, vrednost: unknown): UpitSaFilterima;
  ilike(kolona: string, vrednost: string): UpitSaFilterima;
  or(uslovi: string): UpitSaFilterima;
};

export function primeniFiltereNaUpit(
  upit: unknown,
  filteri: OglasiFilteri,
  predmetIdsZaPretragu?: string[] | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  let rezultat = upit as UpitSaFilterima;
  if (filteri.smerId) rezultat = rezultat.eq("smer_id", filteri.smerId);
  if (filteri.godina) rezultat = rezultat.eq("godina", filteri.godina);
  if (filteri.predmetId) rezultat = rezultat.eq("predmet_id", filteri.predmetId);
  if (filteri.tip) rezultat = rezultat.eq("tip", filteri.tip);
  if (filteri.cenaMin != null) rezultat = rezultat.gte("cena", filteri.cenaMin);
  if (filteri.cenaMax != null) rezultat = rezultat.lte("cena", filteri.cenaMax);
  if (filteri.pretraga) {
    const tekst = ocistiZaOrFilter(filteri.pretraga);
    if (predmetIdsZaPretragu && predmetIdsZaPretragu.length > 0) {
      rezultat = rezultat.or(
        `naziv.ilike.%${tekst}%,opis.ilike.%${tekst}%,predmet_id.in.(${predmetIdsZaPretragu.join(",")})`
      );
    } else {
      rezultat = rezultat.or(`naziv.ilike.%${tekst}%,opis.ilike.%${tekst}%`);
    }
  }
  return rezultat;
}
