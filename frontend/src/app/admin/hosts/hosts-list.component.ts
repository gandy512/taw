import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HostsService } from '../../services/hosts.service';
import { Host } from '../../models/host.model';

@Component({
  selector: 'app-hosts-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hosts-list.component.html',
})
export class HostsListComponent implements OnInit {
  hosts = signal<Host[]>([]);

  constructor(private hostsService: HostsService) {}

  ngOnInit(): void {
    this.hostsService.list().subscribe((hosts) => this.hosts.set(hosts));
  }
}
