import { HomeComponent } from './components/home/home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GameComponent } from './components/game/game.component';
import { BlocklyComponent } from './components/blockly/blockly.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ProfilComponent } from './components/profil/profil.component';
import { LevelMenuComponent } from './components/level-menu/level-menu.component';
import { TeacherPanelComponent } from './components/teacherPanel/teacherPanel.component';
import { StudentDetailComponent } from './components/student-detail/student-detail.component';
const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'game/:levelID',
        component: GameComponent
    },
    {
        path: 'blockly',
        component: BlocklyComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'forgot-password',
        component: ForgotPasswordComponent
    },
    {
        path: 'resetPassword',
        component: ResetPasswordComponent
    },
    {
        path: 'profil',
        component: ProfilComponent
    },
    {
        path: 'levels',
        component: LevelMenuComponent
    },
    {
        path: 'teacherPanel',
        component: TeacherPanelComponent
    },
    {
        path: 'teacherPanel/student/:id',
        component: StudentDetailComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule]
})
export class AppRoutingModule { }
