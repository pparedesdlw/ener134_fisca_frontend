import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from './loader.service';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  standalone: true,
  imports: [CommonModule, NgxSpinnerModule]
})
export class LoaderComponent implements OnInit {
  constructor(public loader: LoaderService, private spinner: NgxSpinnerService) { }
  ngOnInit() {
    this.loader.isLoading$.subscribe(isLoading => {
      if (isLoading) {
        this.spinner.show();
      } else {
        this.spinner.hide();
      }
    });
  }
}
