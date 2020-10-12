import { Component, OnInit, Input } from '@angular/core';
import { LOGO_200x100 } from '../../assets/params/loga';

@Component({
  selector: 'app-produktinfo',
  templateUrl: './produktinfo.component.html',
  styleUrls: ['./produktinfo.component.css']
})
export class ProduktinfoComponent implements OnInit {
    @Input() data;
    @Input() r;
    @Input() layout;
    @Input() show_doc?: boolean;
    LOGA = LOGO_200x100;
  constructor() { }

  ngOnInit() {
      // if (this.show_doc === null) { }
  }

}
