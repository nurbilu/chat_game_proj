import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbOffcanvas, NgbOffcanvasRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'DeMe - pick your story';

  @ViewChild('offcanvasContent', { static: true }) offcanvasContent!: TemplateRef<any>;
  private offcanvasRef!: NgbOffcanvasRef;

  constructor(private router: Router, private offcanvasService: NgbOffcanvas) {}

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  ngOnInit() {}

  openOffcanvas() {
    this.offcanvasRef = this.offcanvasService.open(this.offcanvasContent, { ariaLabelledBy: 'offcanvasNavbarLabel' });
  }

  closeOffcanvas() {
    if (this.offcanvasRef) {
      this.offcanvasRef.dismiss();
    }
  }
}