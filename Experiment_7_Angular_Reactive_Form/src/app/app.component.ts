import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  submitted = false;

  get name() { return this.contactForm.controls.name; }
  get email() { return this.contactForm.controls.email; }
  get phone() { return this.contactForm.controls.phone; }
  get message() { return this.contactForm.controls.message; }

  contactForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  constructor(private fb: FormBuilder) {}

  submitForm() {
    this.submitted = true;
    if (this.contactForm.valid) {
      alert('Form submitted successfully!');
      console.log(this.contactForm.value);
    }
  }
}
