import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Popover, PopoverTrigger, PopoverContent } from '@nextui-org/react';
import { Card, CardHeader, CardBody, CardFooter } from '@nextui-org/react';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  isSuperUser: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.isSuperUser = this.authService.isSuperUser();
  }
}