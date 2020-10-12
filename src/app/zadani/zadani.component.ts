import { Component, OnInit, OnChanges, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { ScrollToService, ScrollToConfigOptions } from '@nicky-lenaers/ngx-scroll-to';

// Data and Service
import { ParamsService } from '../_services/params.service';

@Component({
    selector: 'app-zadani',
    templateUrl: './zadani.component.html',
    styleUrls: ['./zadani.component.css'],
    providers: [ ParamsService ],
    viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class ZadaniComponent implements OnInit, OnChanges {
    @Input() data;
    @Input() offers;
    @Input() filters;
    @Input() submitted;
    @Input() layout;


    lists = {
        povolani: [],
        profese: [],
    };
    @ViewChild('zadani', { static: true }) poj_input: any;

    constructor(private paramsService: ParamsService, private scrollService: ScrollToService) { }

    public vyberZam(): void {
        this.submitted = false;
        this.filters = {};
        this.offers = [];
        this.data.produkt = null;
        setTimeout(() =>  {
            this.data.pojisteni = 'ZAMODP';
        }, 10);
        const config: ScrollToConfigOptions = {
            target: 'start',
            duration: 650,
            offset: -120
        };
        this.scrollService.scrollTo(config);
        setTimeout(() =>  {
            // this.poj_input.nativeElement.form[3].focus();
            // this.poj_input.nativeElement.form[3].blur();
        }, 100);
    }

    public vyberObc(): void {
        this.submitted = false;
        this.filters = {};
        this.offers = [];
        this.data.produkt = null;
        setTimeout(() =>  {
            this.data.pojisteni = 'OBODP';
        }, 10);
    }

    profeseList( change: boolean = false ): void {
        if (change) { this.data.profese = ''; }
        if (this.data.povolani) {
            let id;
            const options = [];
            const profese = this.paramsService.getPovolaniProfese().find( opt => opt.id === this.data.povolani );
            // console.log(profese);
            profese.opt.forEach( opt => {
                const profese_id = this.paramsService.getProfese().find( prof => prof.label === opt );
                // console.log(opt + ' : ' + profese_id.id);
                id = profese_id.id;
                options.push( {
                    label: opt,
                    value: profese_id.id
                });
            });
            if (profese.opt.length === 1) { this.data.profese = id; }
            this.lists.profese = options;
        }
    }

    ngOnInit() {
        this.lists.povolani = this.paramsService.getPovolani();
    }
    ngOnChanges() {
        setTimeout(() => {
            this.profeseList();
        });
        // console.log('Zadani Data : ', this.data);
    }
}
