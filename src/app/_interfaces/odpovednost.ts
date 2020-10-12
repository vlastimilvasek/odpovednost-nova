export class ISjednaniResp {
    id: string;
    status: string;
    docs: any[];
    time: string;
}
export class IOdpovednost {
    id: string;
    extra: any;
    pojisteni: string;
    pojistovna: string;
    produkt: number;
    sjed_cislo: any;
    sjed_status: number;
    sjed_datum: any;
    pocatek: any;
    konec: any;
    pojistne: number;
    provize: number;
    pc: number;
    vek: number;
    povolani: any;
    profese: string;
    spoluc: any;
    rizeni_voz: number;
    rizeni_sou: number;
    rizeni_nakl: number;
    rizeni_str: number;
    uz_platnost: number;
    limit_rv: any;
    limit_str: any;
    limit_zsv: any;
    pz: any;
    platba: number;
    pojistnik: IPojistnik;
    pojistenypojistnik: boolean;
    pojisteny: IOsoba;
    poznamka: string;
    promo_kod: string;
    ziskatel: any;
    id_sml: number;
    ipadr: string;
    email: string;
    link: string;
}

export class IPojistnik {
    typ: any;
    titul: any;
    titul_za: any;
    jmeno: any;
    prijmeni: any;
    spolecnost: any;
    rc: any;
    ic: any;
    platce_dph: boolean;
    telefon: any;
    email: any;
    adresa: IAdresa;
    kadresa: any;
    kor_adresa: IAdresa;
}

export class IOsoba {
    typ: any;
    titul: any;
    titul_za: any;
    jmeno: any;
    prijmeni: any;
    spolecnost: any;
    rc: any;
    ic: any;
    adresa: IAdresa;
}

export class IAdresa {
    psc: any;
    cast_obce_id: any;
    obec: any;
    ulice: any;
    cp: any;
    adr_id: any;
}

export class ISrovnani {
    id: string;
    items: any[];
    time: string;
}

export class ISelectItem {
    value: any;
    label: string;
}
