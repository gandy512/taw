import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { StudentsListComponent } from './admin/students/students-list.component';
import { StudentFormComponent } from './admin/students/student-form.component';
import { LecturersListComponent } from './admin/lecturers/lecturers-list.component';
import { LecturerFormComponent } from './admin/lecturers/lecturer-form.component';
import { HostsListComponent } from './admin/hosts/hosts-list.component';
import { HostFormComponent } from './admin/hosts/host-form.component';
import { ApplicationsListComponent } from './admin/applications/applications-list.component';
import { ApplicationDetailComponent } from './admin/applications/application-detail.component';
import { StudentDashboardComponent } from './student/student-dashboard.component';
import { NewApplicationComponent } from './student/applications/new-application.component';
import { MyApplicationsComponent } from './student/applications/my-applications.component';
import { ApplicationEditComponent } from './student/applications/application-edit.component';
import { LecturerApplicationsListComponent } from './lecturer/applications/lecturer-applications-list.component';
import { LecturerApplicationDetailComponent } from './lecturer/applications/lecturer-application-detail.component';
import { roleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: 'admin',
    canActivate: [roleGuard('admin')],
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'applications', component: ApplicationsListComponent },
      { path: 'applications/:id', component: ApplicationDetailComponent },
      { path: 'students', component: StudentsListComponent },
      { path: 'students/new', component: StudentFormComponent },
      { path: 'hosts', component: HostsListComponent },
      { path: 'hosts/new', component: HostFormComponent },
      { path: 'lecturers', component: LecturersListComponent },
      { path: 'lecturers/new', component: LecturerFormComponent },
    ],
  },
  {
    path: 'student',
    canActivate: [roleGuard('student')],
    children: [
      { path: '', component: StudentDashboardComponent },
      { path: 'applications', component: MyApplicationsComponent },
      { path: 'applications/new', component: NewApplicationComponent },
      { path: 'applications/:id', component: ApplicationEditComponent },
    ],
  },
  {
    path: 'lecturer',
    canActivate: [roleGuard('lecturer')],
    children: [
      { path: '', component: LecturerApplicationsListComponent },
      { path: ':id', component: LecturerApplicationDetailComponent },
    ],
  },
];
