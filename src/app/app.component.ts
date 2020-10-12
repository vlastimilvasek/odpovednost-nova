import { Component, OnInit, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime } from 'rxjs/operators';
import { LOGO_200x100 } from '../assets/params/loga';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import * as pdfSrovnani from './_pdf-templates/srovnani';

// Data and Service
import { IOdpovednost, ISrovnani } from './_interfaces/odpovednost';
import { ParamsService } from './_services/params.service';
import { DataService } from './_services/data.service';
import { SrovnaniComponent } from './srovnani/srovnani.component';
import { TabsetComponent } from 'ngx-bootstrap';

@Component({
    selector: 'app-main',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [ ParamsService ]
})
export class AppComponent implements OnInit, OnDestroy {
    LOGA = LOGO_200x100;
    data: IOdpovednost;
    srovnani: ISrovnani;
    vprodukt;
    translate: TranslateService;
    offers = [];
    nvoffers = [];
    filters;
    layout = {
        grid: {
            'column' : 'col-lg-6',
            'label' : 'col-sm-5',
            'input' : 'col-sm-7',
            'labelw' : 'col-sm-7',
            'inputw' : 'col-sm-5',
            'offset' : 'offset-sm-5',
            'label2' : 'col-lg-8 col-sm-5',
            'input2' : 'col-lg-4 col-sm-7',
            'column1' : 'order-3 order-md-0 col-md-6 col-lg-6 col-xl-7',
            'column2' : 'order-2 col-md-6 col-lg-5 offset-lg-1 col-xl-4',
            'info1' : 'col-sm-3 col-md-12',
            'info2' : 'col-sm-9 col-md-12',
        },
        table : true,
        produktCollapsed : {},
        prvniNapoveda : false,
        form_r : {
            'loading' : false,
            'error' : false
        }
    };
    kalk_aktivni = false;
    layouthelper = 'none';
    filtrCollapsed = true;
    URL = { 'adresa' : '' };
    mail_odeslan = false;
    data_loading = false;
    valueChangesSubscriber = [];
    pojisteni_text = {'OBODP': 'občanská odpovědnost', 'ZAMODP' : 'odpovědnost zaměstnance'}; // jen pro jméno PDFka
    @ViewChild('f', { static: true }) zadani_form: any;
    @ViewChild('filtry', { static: true }) filtr_form: any;
    @ViewChild('kalk_email', { static: true }) email_form: any;
    @ViewChild('o', { static: true }) osobni_form: any;
    @ViewChild('u', { static: true }) udaje_form: any;
    @ViewChild(SrovnaniComponent, { static: true }) srovnaniCmp: SrovnaniComponent;
    @ViewChild('debugModal', { static: true }) debug_modal: any;
    @ViewChild('filtrHint', { static: true }) filtrHint: any;
    @ViewChild('stepTabs', { static: true }) staticTabs: TabsetComponent;
    @ViewChild('layoutHelper', { static: false }) layout_helper: any;
    // version = require('../../package.json').version;

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        // console.log(event.charCode);
        if (event.charCode === 272 || event.charCode === 240) { this.debug_modal.show(); }
        if (event.charCode === 248 || event.charCode === 321) { this.layouthelper = this.layouthelper === 'none' ? '' : 'none'; }
    }

    constructor(translate: TranslateService, public dataservice: DataService, private paramsService: ParamsService, private route: ActivatedRoute, private router: Router) {
        this.translate = translate;
        this.translate.addLangs(['cs', 'en']);
        this.translate.setDefaultLang('cs');
        const lang = this.route.snapshot.queryParams['lang']  || 'cs';
        this.translate.use(lang);
        pdfMake.vfs = pdfFonts.pdfMake.vfs;
    }

    KalkulaceEmail(form: any): void {
        if (form.valid) {
            this.GAEvent('ODP', 'Kalkulace', 'Zaslání na email', 1);
            if (this.data.id !== '' ) {
                this.data.link = this.URL.adresa;
                this.paramsService.KalkulaceEmail( this.data )
                .subscribe( resp => {
                    // console.log('poslat na email resp ', resp);
                    if (resp) {
                        this.mail_odeslan = true;
                    }
                });
            }
        }
    }

    GAEvent(cat: string, label: string, action: string, val: number): void {
        (<any>window).ga('send', 'event', {
            eventCategory: cat,
            eventLabel: label,
            eventAction: action,
            eventValue: val
        });
    }

    public openPDF(): void {
        const dd = pdfSrovnani.srovnani(this.offers);
        pdfMake.createPdf(dd).download('nabídky - ' + this.pojisteni_text[this.data.pojisteni] + '.pdf');
    }

    submitZadani(form: any): void {
        // console.log(this.zadani_form.value);
        // this.zadani_form.reset();
        if (form.valid) {
            // console.log('Form Data - zadani: ');
            // console.log(this.zadani_form);
            // this.data = Object.assign(this.data, form.value);
            // this.kalkuluj();
            this.staticTabs.tabs[1].active = true;
        }
    }

    submitUdaje(form: any): void {
        if (form.valid) {
            this.staticTabs.tabs[3].active = true;
        }
    }

    submitOsobni(form: any): void {
        if (form.valid) {
            this.staticTabs.tabs[4].active = true;
        }
    }

    sjednat(form: any): void {
        if (form.valid) {
            this.layout.form_r.loading = true;
            this.paramsService.ulozSjednani(this.data)
                .subscribe( sjednani => {
                    console.log('sjednat - resp: ', sjednani);
                    if ( sjednani.status === 'OK' ) {
                        this.layout.form_r.loading = false;
                        this.router.navigate(['/zaver']);
                    } else if ( sjednani.status === 'ER' ) {
                        this.layout.form_r.loading = false;
                        this.layout.form_r.error = true;
                    }
                },
                    error => {
                        console.log('sjednat - error: ', error);
                        this.layout.form_r.loading = false;
                    }
                );
            // console.log('Data: ', this.data);
        }
    }

    zmenPojisteni(pojisteni: string): void {
        this.offers = [];
        this.nvoffers = [];
        this.filters = {};
        this.data.pojisteni = pojisteni;
        console.log('zmenPojisteni - filters : ', this.filters);
    }

    vyberProdukt(id: number): void {
        console.log('vyberProdukt : ', id);
        this.data.produkt = id;
        this.vprodukt = this.offers.filter( x => x.id === this.data.produkt)[0];
        console.log('vyberProdukt - produkt : ', this.vprodukt);
        this.staticTabs.tabs[2].active = true;
    }

    tabSrovnani(): void {
        if (!this.offers.length && !this.kalk_aktivni && this.zadani_form.valid) {
            this.kalkuluj();
        }
    }

    IsJsonString(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

    kalkuluj(): void {
        const produkt = this.data.produkt;
        const produkty_id = [];
        this.kalk_aktivni = true;
        this.filtrCollapsed = true;
        this.vprodukt = null;
        this.data.produkt = null;
        this.offers = [];
        this.nvoffers = [];
        this.paramsService.getSrovnani(this.data)
            // .map( (i) => { console.log('getSrovnani', i); return i; } )
            .subscribe( srovnani => {
                this.srovnani = srovnani;
                this.data.id = srovnani.id;
                this.URL.adresa = window.location.origin + window.location.pathname + '/?id=' + srovnani.id;

                const items = [];
                const partneri = [];
                const partnobj = {};
                const partnobj_old = this.filters.partnobj || {};  // uchování nastavení při pře-kalkulaci
                const platby = [];

                console.log('srovnani ', srovnani );

                srovnani.items.forEach( (x) => {
                    const params = [];
                    const pplatby = [];
                    produkty_id.push(x.id);

                    if ( partneri.indexOf(x.pojistovna) === -1 ) {
                        partneri.push( x.pojistovna );
                        partnobj[x.pojistovna] = (partnobj_old[x.pojistovna] !== undefined) ? partnobj_old[x.pojistovna] : true;
                    }
                    if ( Object.keys(this.layout.produktCollapsed).indexOf(x.id) === -1 ) {
                        this.layout.produktCollapsed[x.id] = true;
                    }

                    Object.keys(x.platby).forEach(function(key) {
                        if (x.platby[key] > 0 && platby.indexOf(Number(key)) === -1) { platby.push(Number(key)); }
                        if (x.platby[key] > 0) { pplatby.push({ key : Number(key), value : x.platby[key]}); }
                    });
                    x.pplatby = pplatby;

                    // kontrola připojištění - extra
                    const types = ['radio', 'select'];
                    // console.log('pocet extras : ', x.extra.length );
                    if (x.extra.length) {
                        const extra = x.extra.filter(e => types.indexOf(e.typ) >= 0);
                        x.extra = [];
                        extra.forEach((e) => {
                            if (Object.keys(e).indexOf('hodnota')) {
                                if (this.IsJsonString(e.hodnota) || (typeof e.hodnota === 'object' && e.hodnota !== null) ) {
                                    if (!(typeof e.hodnota === 'object' && e.hodnota !== null)) {
                                        e.hodnota = JSON.parse(e.hodnota);
                                    }
                                    if (Object.keys(e.hodnota).indexOf('options')) {  // uprava options na pole
                                        const opt = [];
                                        Object.keys(e.hodnota.options).forEach((o) => {
                                            opt.push(e.hodnota.options[o]);
                                        });
                                        e.hodnota.options = opt;
                                    }
                                    x.extra.push(e);
                                } else {
                                    // console.log('chybný objekt extras : ', e.kod);
                                }

                            }
                        });

                        // console.log('APP kalkuluj - extra : ', x.extra);
                    }
                    // nastavení parametrů podle odkazu na extra
                    Object.keys(x.params).forEach(function (key) {
                        if (x.params[key].typ === 'link') {
                            const kod = x.params[key].hodnota.split('.')[1];
                            // console.log('APP kalkuluj - extra kod : ', kod );
                            const extra = x.extra.filter(e => e.kod === kod)[0];
                            // console.log('APP kalkuluj - extra : ', extra );
                            if (typeof extra === 'object' && extra !== null) {
                                // jedno připojištění má vliv na víc parametrů
                                if (typeof extra.hodnota.linked === 'object' && extra.hodnota.linked !== null) {
                                    x.params[key].options = extra.hodnota.linked.filter(e => e.kod === key)[0].options;
                                } else {
                                    x.params[key].options = extra.hodnota.options;
                                }
                                x.params[key].default = extra.hodnota.default;
                                if (typeof extra.hodnota.default === 'object' && extra.hodnota.default !== null) {
                                    x.params[key].hodnota = Number(extra.hodnota.default[key]);
                                } else {
                                    x.params[key].hodnota = Number(extra.hodnota.default);
                                }

                            }
                        } else if (x.params[key].typ === 'number') {  // nastavení parametrů podle typu
                            x.params[key].hodnota = Number(x.params[key].hodnota);
                        } else if (x.params[key].typ === 'bool') {
                            x.params[key].hodnota = Number(x.params[key].hodnota); // i typ bool musí být číselná hodnota kvůli filtrům
                            // console.log('APP kalkuluj - param bool : ', JSON.stringify(x.params[key]) );
                        }
                    });
                    items.push( Object.assign({}, x) );
                });

                this.filters.partneri = partneri;
                this.filters.partnobj = partnobj;
                this.filters.platby = platby;
                items.sort(function(a, b) { return a.ordering - b.ordering; });

                this.offers = this.nvoffers = items;
                console.log('kalkuluj - produkt : ', produkt );
                // console.log('kalkuluj - produkty_id : ', produkty_id );

                if (produkt && produkty_id.indexOf(produkt) !== -1) { // zkusím zachovat vybraný produkt při přepočtu
                    this.data.produkt = produkt;
                    this.vprodukt = this.offers.filter( x => x.id === this.data.produkt)[0];
                }
                this.kalk_aktivni = false;

                this.filtruj_nabidky();

                // if (this.layout.prvniNapoveda) { this.filtrHint.show(); }
                // setTimeout(() =>  { this.layout.prvniNapoveda = false;  }, 8000);
            });
    }

    filtruj_nabidky(): void {
        // console.log('this.filters.partnobj : ', this.filters.partnobj);
        console.log('offers před filtry : ', this.nvoffers);
        this.offers = this.nvoffers.filter( x => this.filters.partnobj[x.pojistovna] > 0);
        const pojisteni = this.data.pojisteni;

        // úprava produktu podle požadavku na rozšíření
        this.offers.forEach((x) => {
            let cena_pri = 0;
            const pripojisteni = {};
            let extras = ['pel', 'hzv', 'nem', 'pro', 'spol'];
            let i = 0;
            while (extras[i]) {
                // u "balíčků" musím případně opakovaně ověřovat hodnoty provázaných parametrů
                // extras.forEach( (e) => {
                const e = extras[i];
                i++;
                // console.log('APP filtruj_nabidky - podle : ', e);
                // console.log('APP filtruj_nabidky - e (extra) x (produkt) : ', x.params[e]);
                // má produkt takové připojištění?
                if (typeof x.params[e] === 'object' && x.params[e] !== null && x.params[e].typ === 'link') {
                    // výchozí hodnota
                    if (typeof x.params[e].default === 'object' && x.params[e].default !== null) {
                        Object.keys(x.params[e].default).forEach((p) => {
                            x.params[p].hodnota = x.params[e].default[p];
                        });
                    } else {
                        x.params[e].hodnota = x.params[e].default;
                    }
                    // console.log('APP filtruj_nabidky - x.params.e : ', x.params[e]);
                    if (Number(x.params[e].hodnota) < this.data.extra[e]) { // lze navýšit?
                        // console.log('APP filtruj_nabidky - product kalk : ', x.kalk);
                        const opt = x.params[e].options.filter(o => Number(o.value) >= this.data.extra[e])[0];
                        if (typeof opt === 'object' && opt !== null) {
                            // výběr připojištění ovlivňuje více parametrů produktu
                            if (Array.isArray(opt.linked)) {
                                opt.linked.forEach((p) => {
                                    if (typeof p === 'object' && p !== null) {
                                        const lkod = Object.keys(p)[0];
                                        x.params[lkod].hodnota = p[lkod];
                                        // console.log('APP filtruj_nabidky - opt linked : ', lkod + ' ' + p[lkod]);
                                        if (Number(x.params[lkod].hodnota) < this.data.extra[lkod]) {
                                            // když hodnota provázaného parametru nesplňuje filtr, musím znova projít filtrováním
                                            extras.push(lkod);
                                            // console.log('APP filtruj_nabidky - nedostatečný opt linked : ', lkod + ' ' + p[lkod] + ' ' + this.data.extra[lkod]);
                                        } else {
                                            // když je hodnota OK, tak znova nechci procházet, byla by nastavena na default parametru
                                            extras = extras.filter(o => o !== lkod);
                                            // a dopočítám cenu - volba provázaného parametru buď podle hodnoty jeho filtru nebo odkazujícího parametru
                                            const lopt = x.params[lkod].options.filter(o => Number(o.value) >= Math.max(this.data.extra[lkod], p[lkod]))[0];
                                            // console.log('APP filtruj_nabidky - opt linked dopočítání ceny : ', lopt);
                                            if (typeof lopt === 'object' && lopt !== null) {
                                                pripojisteni[lkod] = Number(lopt.cena);
                                            }
                                            // console.log('APP filtruj_nabidky - opt linked pripojisteni : ', pripojisteni);
                                        }
                                    }
                                });
                            }
                            x.params[e].hodnota = Number(opt.value);
                            // console.log('APP filtruj_nabidky - opt[0] : ', opt);
                            pripojisteni[e] = Number(opt.cena);
                            // console.log('APP filtruj_nabidky - pripojisteni : ', pripojisteni);
                        }
                    }
                }
            }
            Object.keys(pripojisteni).forEach(key => { cena_pri += pripojisteni[key]; });
            // console.log('APP filtruj_nabidky - cena pripojisteni : ', x.id + ': ' + cena_pri);
            // console.log('APP filtruj_nabidky - ceny pripojisteni : ', pripojisteni);
            const pplatby = [];
            x.vypocet = {};
            Object.keys(x.platby).forEach(function(key) {
                // Výpočet plateb
                // console.log('APP filtruj_nabidky - platby key : ', key);
                if (pojisteni === 'OBODP') {
                    if ( ['Slavia'].indexOf(x.pojistovna) !== -1 ) {
                        x.platby[key] = Math.floor( (x.odp_cena + cena_pri) * x.k_platby[key] * ( x.odp_sleva - (1-x.c_platby[key])));
                        x.vypocet[key] = x.platby[key] + ' = round( (' + x.odp_cena + '+' + cena_pri + ')*' + x.k_platby[key] + '*(' + x.odp_sleva + '-(1-' + x.c_platby[key] + '))';
                    } else {
                        x.platby[key] = Math.round( ((x.odp_cena * x.k_platby[key]) + cena_pri) * x.odp_sleva * x.c_platby[key]);
                        x.vypocet[key] = x.platby[key] + ' = round( (' + x.odp_cena + '*' + x.k_platby[key] + ') + ' + cena_pri + ')*' + x.odp_sleva + '*' + x.c_platby[key] + ')';
                    }
                } else if (pojisteni === 'ZAMODP') {
                    if ( ['Slavia'].indexOf(x.pojistovna) !== -1 ) {
                        x.platby[key] = Math.floor( (x.zam_cena + cena_pri) * x.k_platby[key] * ( x.zam_sleva - (1-x.c_platby[key])));
                        x.vypocet[key] = x.platby[key] + ' = round( (' + x.zam_cena + '+' + cena_pri + ')*' + x.k_platby[key] + '*(' + x.zam_sleva + '-(1-' + x.c_platby[key] + '))';
                    } else {
                        x.platby[key] = Math.round( ((x.zam_cena * x.k_platby[key]) + cena_pri) * x.zam_sleva * x.c_platby[key]);
                        x.vypocet[key] = x.platby[key] + ' = round( (' + x.zam_cena + '*' + x.k_platby[key] + ') + ' + cena_pri + ')*' + x.zam_sleva + '*' + x.c_platby[key] + ')';
                    }
                }
                // Ověření minimálního pojistného
                if (x.min_poj.mod === 'strict') {
                    if (x.platby[key] < x.min_poj.hodnota) { x.platby[key] = -2; }
                } else {
                    if (x.platby[key] < x.min_poj.hodnota) { x.platby[key] = x.min_poj.hodnota; }
                }

                if (x.platby[key] > 0) { pplatby.push({ key : Number(key), value : x.platby[key]}); }
            });
            x.pripojisteni = pripojisteni;
            x.pplatby = pplatby;

        });

        this.offers = this.offers.filter( x => Number(x.platby[this.data.platba]) > 0);
        if (this.data.pojisteni === 'OBODP') {
            this.offers = this.offers.filter( x => Number(x.params.boz.hodnota) + 2 >= this.filters.boz);
            this.offers = this.offers.filter( x => Number(x.params.pel.hodnota) + 2 >= this.data.extra.pel);
            this.offers = this.offers.filter( x => Number(x.params.hzv.hodnota) + 2 >= this.data.extra.hzv);
            this.offers = this.offers.filter( x => Number(x.params.nem.hodnota) + 2 >=  this.data.extra.nem);
            this.offers = this.offers.filter( x => Number(x.params.pro.hodnota) + 2 >= this.data.extra.pro);
            this.offers = this.offers.filter( x => Number(x.params.spol.hodnota) >= this.data.extra.spol);
        } else if (this.data.pojisteni === 'ZAMODP') {
            this.offers = this.offers.filter( x => Number(x.params.slevel.hodnota) <= this.filters.max_spol);
            this.offers = this.offers.filter( x => Number(x.params.zsv.hodnota) + 1 >= this.data.limit_zsv);
        }

        console.log('offers po filtrech : ', this.offers);
        function sortp(c) { return function(a, b) { return a.platby[c] - b.platby[c]; }; } // console.log(a.platby[c] + ' ' + b.platby[c]);
        this.offers.sort(sortp(this.data.platba));
    }

    initData(data: IOdpovednost): void {
        this.data = data || {
            id: '',
            extra: {
                pel: 0,
                hzv: 0,
                nem: 0,
                pro: 0,
                spol : -100000
            },
            pojisteni: this.route.snapshot.queryParams['pojisteni'] || null,
            pojistovna: '',
            produkt: null,
            sjed_cislo: null,
            sjed_status: null,
            sjed_datum: this.route.snapshot.queryParams['sjed_datum'] || new Date(),
            pocatek: this.route.snapshot.queryParams['pocatek'] || new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
            konec: '',
            pojistne: null,
            provize: null,
            pc: this.route.snapshot.queryParams['pc'] || '100000',
            vek: this.route.snapshot.queryParams['vek'] || '',
            povolani: this.route.snapshot.queryParams['povolani'] || '',
            profese: '',
            spoluc: '',
            rizeni_voz: 0,
            rizeni_sou: 0,
            rizeni_nakl: 0,
            rizeni_str: 0,
            uz_platnost: 1,
            limit_rv: '',
            limit_str: '',
            limit_zsv: 0,
            pz: '',
            platba: 1,
            pojistnik : {
                'typ' : '1',
                'titul' : '',
                'titul_za' : '',
                'jmeno' : '',
                'prijmeni' : '',
                'spolecnost' : '',
                'rc' : '',
                'ic' : '',
                'platce_dph' : false,
                'telefon' : '',
                'email' : '',
                'adresa' : {
                    'psc' : '',
                    'cast_obce_id' : '',
                    'obec' : '',
                    'ulice' : '',
                    'cp' : '',
                    'adr_id' : ''
                },
                'kadresa' : false,
                'kor_adresa' : {
                    'psc' : '',
                    'cast_obce_id' : '',
                    'obec' : '',
                    'ulice' : '',
                    'cp' : '',
                    'adr_id' : ''
                }
            },
            pojistenypojistnik: true,
            pojisteny: {
                'typ' : '1',
                'titul' : '',
                'titul_za' : '',
                'jmeno' : '',
                'prijmeni' : '',
                'spolecnost' : '',
                'rc' : '',
                'ic' : '',
                'adresa' : {
                    'psc' : '',
                    'cast_obce_id' : '',
                    'obec' : '',
                    'ulice' : '',
                    'cp' : '',
                    'adr_id' : ''
                },
            },
            poznamka: '',
            promo_kod: '',
            ziskatel: '',
            id_sml: null,
            ipadr: '',
            email: '',
            link: ''
        };
        this.zadani_form.submitted = false;
    }

    ngOnInit() {
        // console.log( 'data z URL : ', this.route.snapshot.queryParams['data'] );
        this.valueChangesSubscriber['f'] = this.filtr_form.valueChanges.pipe(debounceTime(200)).subscribe(form => {
            // console.log( 'zmena filtrů : ', JSON.stringify(this.filters) );
            // console.log( 'zmena filtrů - length : ', Object.keys(this.filters).length );
            this.filtruj_nabidky();
            this.GAEvent('ODP', 'Kalkulace', 'Filtrování nabídek', 1);
        });

        this.valueChangesSubscriber['z'] = this.zadani_form.valueChanges.pipe(debounceTime(40)).subscribe(form => {
            console.log('změna zadani_form');
            this.zadani_form.submitted = false;
            this.offers = [];
            this.nvoffers = [];
            if (this.zadani_form.valid) {
                console.log('změna zadani_form, formulář platný a proto kalkuluji ...');
                this.kalkuluj();
            }
        });

        this.valueChangesSubscriber['e'] = this.email_form.valueChanges.pipe(debounceTime(20)).subscribe(form => {
            this.email_form.submitted = false;
        });

        this.valueChangesSubscriber['u'] = this.udaje_form.valueChanges.pipe(debounceTime(20)).subscribe(form => {
            this.udaje_form.submitted = false;
        });

        this.valueChangesSubscriber['o'] = this.osobni_form.valueChanges.pipe(debounceTime(20)).subscribe(form => {
            this.osobni_form.submitted = false;
        });

        this.filters = {
            boz : 0,
            pel : 0,
            dzv : 0,
            hzv : 0,
            nem : 0,
            pro : 0,
            max_spol : 3,
            limit_zsv : -1
        };

        this.srovnani = {
            id: '',
            items: [],
            time: ''
        };

        this.initData(null);

        let input_data = null;
        if (this.route.snapshot.queryParams['id'] !== undefined ) {
            this.data_loading = true;
            this.paramsService.getKalkulace( this.route.snapshot.queryParams['id'] )
            .subscribe( data => {
                // console.log('data ', data);
                try {
                    input_data = data;
                    if (input_data.pocatek) {
                        input_data.pocatek = new Date(input_data.pocatek);
                    }
                    if (input_data.profese) {
                        input_data.profese = input_data.profese.toString();
                    }
                } catch (e) {
                    // console.log(e);
                }
                // this.initData(input_data);
                this.data =  Object.assign({}, this.data, input_data);
                setTimeout(() =>  {
                    // console.log('zadani_form form valid', this.zadani_form.form.valid );
                    this.data_loading = false;
                    if (this.zadani_form.valid) {
                        this.kalkuluj();
                        this.staticTabs.tabs[1].active = true;
                    }
                }, 50);
            });
        } else if (this.route.snapshot.queryParams['data'] !== undefined ) {
            // console.log('data snapshot', this.route.snapshot.queryParams['data'] );
            try {
                input_data = JSON.parse(this.route.snapshot.queryParams['data']);
                // this.initData(input_data);
                this.data =  Object.assign({}, this.data, input_data);
            } catch (e) {
                // console.log(e);
            }
        }
        // console.log(this.zadani_form.value);
    }
    ngOnDestroy() {
        this.dataservice.data = this.data;
        this.dataservice.vprodukt = this.vprodukt;
        this.valueChangesSubscriber['f'].unsubscribe();
        this.valueChangesSubscriber['z'].unsubscribe();
        this.valueChangesSubscriber['e'].unsubscribe();
        this.valueChangesSubscriber['u'].unsubscribe();
        this.valueChangesSubscriber['o'].unsubscribe();
    }
}
