import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbOffcanvas, NgbOffcanvasRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'DeMe - pick your story';

  @ViewChild('offcanvasContent', { static: true }) offcanvasContent!: TemplateRef<any>;
  @ViewChild('logoutTemplate', { static: true }) logoutTemplate!: TemplateRef<any>;
  private offcanvasRef!: NgbOffcanvasRef;

  constructor(private router: Router, private offcanvasService: NgbOffcanvas, private toastService: ToastService) {}

  logout(): void {
    const username = localStorage.getItem('username'); // Pull username from local storage
    localStorage.clear();
    this.router.navigate(['/homepage']);  // Redirect to homepage after logout
    this.toastService.show({ template: this.logoutTemplate, classname: 'bg-success text-light', delay: 10000, context: { username } });
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