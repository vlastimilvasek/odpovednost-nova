import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ParamsService } from '../_services/params.service';
import { IOdpovednost } from '../_interfaces/odpovednost';
import { DataService } from '../_services/data.service';

@Component({
    selector: 'app-zaver',
    templateUrl: './zaver.component.html',
    styleUrls: ['./zaver.component.css'],
    providers: [ ParamsService ]
})
export class ZaverComponent implements OnInit {
    translate: TranslateService;
    data: IOdpovednost;
    vprodukt;
    constructor(translate: TranslateService, public dataservice: DataService, private paramsService: ParamsService, private route: ActivatedRoute, private router: Router) {
        this.translate = translate;
        this.translate.addLangs(['cs', 'en']);
        this.translate.setDefaultLang('cs');
        const lang = this.route.snapshot.queryParams['lang']  || 'cs';
    }

    ngOnInit() {
        // console.log('OnInit - vprodukt ', this.dataservice.vprodukt);
        this.data = this.dataservice.data;
        this.vprodukt = this.dataservice.vprodukt;
        if (!this.data) { this.router.navigate(['/']); }
    }

}
