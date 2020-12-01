import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { first, map, startWith, withLatestFrom } from 'rxjs/operators';
import { Audit } from '@/_models';
import { AuditService, AuthenticationService } from '@/_services';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { SortByPipe } from '@/util/sort';


@Component({ templateUrl: 'audit.component.html' })
export class AuditComponent implements OnInit
{
  public startTimeArray: string[] = [
    "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM",
  ];
  public endTimeArray: string[] = [
    "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM",
  ];
  public dates = {
    startDate: '08:00',
    endDate: '13:00',
  }

  // keeping track from startDate and endDate
  public startDate: string;
  public endDate: string;

    audits = [];
    p: number = 1;
    auditItem$: Observable<Audit[]>;
    filteredAudit$: Observable<Audit[]>;
    formGroup: FormGroup;

    constructor(
        private authenticationService: AuthenticationService,
        private auditService: AuditService,
        private formBuilder: FormBuilder,
        public datepipe: DatePipe,
        public sortPipe: SortByPipe
    )
    {
      this.formGroup = formBuilder.group({ filter: [''] });

    }

    ngOnInit()
    {
      let { startDate, endDate } = this.dates;
        this.loadAllAudits();
        this.filteredAudit$ = this.formGroup.get('filter').valueChanges.pipe(
          startWith(''),
          withLatestFrom(this.auditItem$),
          map(([val, audit]) =>
            !val ? audit : audit.filter((x) => x.user.toLowerCase().includes(val))
          )
        );

    }

    private loadAllAudits()
    {
        this.auditService.getAll()
            .pipe(first())
            .subscribe(audits =>
            
                {this.audits = audits});
    }

    public onSelect(time: string,audit: string, date: Dates): void {
      if (date ===  Dates.START_DATE) {
        this.startDate = this.parseFromAmPmToTwentyFour(time);
      } else if (date === Dates.END_DATE) {
        this.endDate = this.parseFromAmPmToTwentyFour(time);
      }
    }

     parseFromAmPmToTwentyFour(time: string): string {
        let hours = Number(time.match(/^(\d+)/)[1]);
        const minutes = Number(time.match(/:(\d+)/)[1]);
        const AMPM = time.match(/\s(.*)$/)[1];
        if (AMPM == "PM" && hours < 12) hours = hours + 12;
        if (AMPM == "AM" && hours == 12) hours = hours - 12;
        let sHours = hours.toString();
        let sMinutes = minutes.toString();
        if (hours < 10) sHours = "0" + sHours;
        if (minutes < 10) sMinutes = "0" + sMinutes;
        return `${sHours} : ${sMinutes}`;
      }

      public parseFromTwentyFourToAmPm(time: string): string {
        const H = +time.substr(0, 2);
        const h = H % 12 || 12;
        const ampm = (H < 12 || H === 24) ? "AM" : "PM";
        time = h + time.substr(2, 3) + ' ' + ampm;
        return time;
      }
}


export interface AuditItem {
  name: string;
}


enum Dates {
  START_DATE = "startDate",
  END_DATE = "endDate",
}
