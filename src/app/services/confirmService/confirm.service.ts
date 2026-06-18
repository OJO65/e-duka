import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface ConfirmState extends ConfirmOptions {
  visible: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private stateSubject = new BehaviorSubject<ConfirmState>({
    visible: false,
    title: '',
    message: '',
  });

  state$ = this.stateSubject.asObservable();

  private resolveFn?: (result: boolean) => void;

  ask(options: ConfirmOptions): Promise<boolean> {
    this.stateSubject.next({ ...options, visible: true });
    return new Promise((resolve) => {
      this.resolveFn = resolve;
    });
  }

  respond(result: boolean): void {
    this.stateSubject.next({ ...this.stateSubject.value, visible: false });
    this.resolveFn?.(result);
    this.resolveFn = undefined;
  }
}