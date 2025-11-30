import { Component, signal, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { LoadingService } from '../../../core/services/loading.service';
import { FeedbackService } from '../../../core/services/feedback.service';

@Component({
    selector: 'app-verify-email',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './verify-email.html'
})
export class VerifyEmail implements OnInit {
    @Input() initialCode: string | null = null;

    verifyForm: FormGroup;
    success = false;
    verifyingEmail = signal<boolean>(false);

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private loadingService: LoadingService,
        private feedback: FeedbackService
    ) {
        this.verifyForm = this.fb.group({
            code: ['', [Validators.required, Validators.minLength(1)]]
        });
    }

    ngOnInit() {
        if (this.initialCode) {
            this.verifyForm.patchValue({ code: this.initialCode });
            this.onSubmit({ skipValidation: true, silent: true });
        }
    }

    onSwitch(mode: string) {
        this.router.navigate(['/' + mode]);
    }

    onSubmit(options?: { skipValidation?: boolean; silent?: boolean }) {
        if (!options?.skipValidation && this.verifyForm.invalid) {
            this.verifyForm.markAllAsTouched();
            if (!options?.silent) {
                this.feedback.showToast({
                    tone: 'error',
                    title: 'Enter the activation code',
                    message: 'The code is required.'
                });
            }
            return;
        }
        const code = this.verifyForm.get('code')?.value;
        if (!code) {
            this.feedback.showToast({
                tone: 'error',
                title: 'Missing code',
                message: 'Please paste the activation code from your email.'
            });
            return;
        }

        this.verifyingEmail.set(true);
        this.loadingService.show();
        this.authService.verifyEmail(code).subscribe({
            next: () => {
                this.loadingService.hide();
                this.verifyingEmail.set(false);
                if (!options?.silent) {
                    this.feedback.showToast({
                        tone: 'success',
                        title: 'Account activated',
                        message: 'You can now sign in.'
                    });
                }
                this.success = true;
            },
            error: (err) => {
                this.loadingService.hide();
                this.verifyingEmail.set(false);
                this.feedback.showToast({
                    tone: 'error',
                    title: 'Verification failed',
                    message: this.extractMessage(err, 'Verification failed')
                });
            }
        });
    }

    private extractMessage(err: any, fallback: string): string {
        const message = err?.error?.message ?? err?.message;
        if (!message) {
            return fallback;
        }
        return typeof message === 'string' ? message : JSON.stringify(message);
    }
}
