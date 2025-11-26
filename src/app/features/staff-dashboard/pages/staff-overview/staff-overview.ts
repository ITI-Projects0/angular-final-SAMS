import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';

@Component({
  selector: 'app-staff-overview',
  templateUrl: './staff-overview.html',
  styleUrls: ['./staff-overview.css']
})
export class StaffOverview implements OnInit {

  incoming = 32;
  outgoing = 50;

  public doughnutData: ChartData<'doughnut'> = {
    labels: ['ERP Solutions', 'Finance', 'Development', 'Warehouse', 'Administration', 'DataOps'],
    datasets: [{
      data: [27, 22, 17, 12, 11, 11],
    }]
  };

  public doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false
  };

  constructor() {}

  ngOnInit(): void {}
}
