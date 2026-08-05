import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentsService } from '../../services/students.service';
import { StudentSummary } from '../../models/student.model';

@Component({
  selector: 'app-students-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './students-list.component.html',
})
export class StudentsListComponent implements OnInit {
  students = signal<StudentSummary[]>([]);

  constructor(private studentsService: StudentsService) {}

  ngOnInit(): void {
    this.studentsService.list().subscribe((students) => this.students.set(students));
  }
}
