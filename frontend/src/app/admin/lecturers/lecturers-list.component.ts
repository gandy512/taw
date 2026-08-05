import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LecturersService } from '../../services/lecturers.service';
import { LecturerSummary } from '../../models/lecturer.model';

@Component({
  selector: 'app-lecturers-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './lecturers-list.component.html',
})
export class LecturersListComponent implements OnInit {
  lecturers = signal<LecturerSummary[]>([]);

  constructor(private lecturersService: LecturersService) {}

  ngOnInit(): void {
    this.lecturersService.list().subscribe((lecturers) => this.lecturers.set(lecturers));
  }
}
