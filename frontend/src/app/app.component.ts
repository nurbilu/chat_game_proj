import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'DeMe - pick your story';

  @ViewChild('offcanvasContent', { static: true }) offcanvasContent!: TemplateRef<any>;
  private modalRef!: NgbModalRef;

  constructor(private router: Router, private modalService: NgbModal) {}

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  ngOnInit() {}

  openOffcanvas() {
    this.modalRef = this.modalService.open(this.offcanvasContent, { ariaLabelledBy: 'offcanvasNavbarLabel' });
  }
}