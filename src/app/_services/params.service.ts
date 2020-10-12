import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ISrovnani, ISelectItem, ISjednaniResp } from '../_interfaces/odpovednost';
import { POVOLANI, POVOLANI_PROFESE, PROFESE } from '../../assets/params/profese';

@Injectable()
export class ParamsService {

    constructor(private http: HttpClient) { }

    getOsoby() {
        return this.http.get<ISelectItem[]>('assets/params/osoby.json');
    }

    getPovolani() {
        // return this.http.get<ISelectItem[]>('assets/params/povolani.json');
        // při volání musí být subscribe
        return POVOLANI;
    }

    getProfese() {
        // return this.http.get<ISelectItem[]>('assets/params/profese.json');
        return PROFESE;
    }

    getPovolaniProfese() {
        return POVOLANI_PROFESE;
    }

    getKalkulace(id) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json'
            })
        };
        const data = {'id': id};
        // console.log('id kalkulace ', data);
        return this.http.post('https://www.srovnavac.eu/api/odpovednost/app/kalkulace', data, httpOptions)
        .pipe(
            // catchError()
        );
    }

    KalkulaceEmail(data) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json'
            })
        };
        return this.http.post('https://www.srovnavac.eu/api/odpovednost/app/emailkalk', data, httpOptions)
        .pipe(
            // catchError()
        );
    }

    getSrovnani(data) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json'
            })
        };
        console.log('Volání -  https://www.srovnavac.eu/api/odpovednost/app/srovnani');
        console.log('s daty');
        console.log( JSON.stringify(data) );
        return this.http.post<ISrovnani>('https://www.srovnavac.eu/api/odpovednost/app/srovnani', data, httpOptions)
        .pipe(
            // catchError()
        );
    }

    ulozSjednani(data) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type':  'application/json'
            })
        };
        // console.log(JSON.stringify(data));
        return this.http.post<ISjednaniResp>('https://www.srovnavac.eu/api/odpovednost/app/sjednani', data, httpOptions);
    }

    // Nová verze doplňování adres - komponenta adresa
    getHledej(co, token, data) {
        // console.log('https://www.srovnavac.eu/ruian/hledej?q=' + co + '&coid=' + data.cast_obce_id
        //     + '&psc=' + data.psc + '&cp=' + data.cp + '&ulice=' + data.ulice + '&obec=' + data.obec);
        return this.http.get<any[]>('https://www.srovnavac.eu/ruian/hledej?q=' + co + '&coid=' + data.cast_obce_id
             + '&psc=' + data.psc + '&cp=' + data.cp + '&ulice=' + data.ulice + '&obec=' + data.obec);
    }
}
