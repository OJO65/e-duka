import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService, ConfirmOptions } from '../../services/confirmService/confirm.service';
import { Observable } from 'rxjs';

interface ConfirmState extends ConfirmOptions {
  visible: boolean;
}

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.css'],
})
export class ConfirmModalComponent {
  state$: Observable<ConfirmState>;

  constructor(private confirmService: ConfirmService) {
    this.state$ = this.confirmService.state$;
  }
  

  onConfirm(): void {
    this.confirmService.respond(true);
  }

  onCancel(): void {
    this.confirmService.respond(false);
  }
}