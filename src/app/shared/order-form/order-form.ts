import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  computed,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DELIVERY,
  PRODUCT,
  SITE,
  SPECIAL,
  formatRand,
  specialLabel,
  standsTotal,
} from '../../core/site';

type Delivery = 'courier' | 'pickup';

const MAX_QUANTITY = 20;
const ADDRESS_MAX = 400;

/**
 * Order form. There is no server: submitting builds the order as a WhatsApp message and opens
 * wa.me with it pre-filled, so the customer only has to press Send.
 */
@Component({
  selector: 'app-order-form',
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './order-form.html',
  styleUrl: './order-form.scss',
})
export class OrderForm {
  private readonly document = inject(DOCUMENT);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly maxQuantity = MAX_QUANTITY;
  protected readonly special = specialLabel();
  protected readonly courierFree = DELIVERY.courierFree;

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(80)]],
    phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s()-]{9,20}$/)]],
    email: ['', [Validators.email, Validators.maxLength(120)]],
    quantity: [1, [Validators.required, Validators.min(1), Validators.max(MAX_QUANTITY)]],
    delivery: this.fb.control<Delivery | null>(null, Validators.required),
    address: ['', Validators.maxLength(ADDRESS_MAX)],
    notes: ['', Validators.maxLength(500)],
  });

  private readonly value = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  protected readonly needsAddress = computed(() => this.value().delivery === 'courier');
  protected readonly total = computed(() => {
    const qty = Number(this.value().quantity);
    return Number.isInteger(qty) && qty >= 1 && qty <= MAX_QUANTITY
      ? formatRand(standsTotal(qty))
      : null;
  });
  /** True when the special lowers the total. */
  protected readonly specialApplied = computed(() => {
    const qty = Number(this.value().quantity);
    return !!SPECIAL && qty >= SPECIAL.quantity;
  });

  /** Set after a valid submit; the WhatsApp link stays available in case the pop-up was blocked. */
  protected readonly sentUrl = signal<string | null>(null);
  protected readonly emailUrl = signal<string | null>(null);
  protected readonly submitted = signal(false);

  constructor() {
    const { delivery, address } = this.form.controls;

    // An address is needed for courier orders.
    delivery.valueChanges.subscribe((d) => {
      address.setValidators(
        d === 'courier'
          ? [Validators.required, Validators.maxLength(ADDRESS_MAX)]
          : Validators.maxLength(ADDRESS_MAX),
      );
      address.updateValueAndValidity();
    });
  }

  protected changeQuantity(step: number): void {
    const control = this.form.controls.quantity;
    const next = Math.min(MAX_QUANTITY, Math.max(1, (Number(control.value) || 0) + step));
    control.setValue(next);
    control.markAsDirty();
  }

  protected showError(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.document.querySelector<HTMLElement>('.order-form .ng-invalid:not(form)')?.focus();
      return;
    }

    const message = this.buildMessage();
    const whatsapp = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
    const email =
      `mailto:${SITE.email}?subject=${encodeURIComponent('Bike stand order')}` +
      `&body=${encodeURIComponent(message)}`;
    this.sentUrl.set(whatsapp);
    this.emailUrl.set(email);
    this.document.defaultView?.open(whatsapp, '_blank', 'noopener');
  }

  protected startOver(): void {
    this.form.reset();
    this.submitted.set(false);
    this.sentUrl.set(null);
    this.emailUrl.set(null);
  }

  private buildMessage(): string {
    const v = this.form.getRawValue();
    const courier = v.delivery === 'courier';
    const lines = [
      `Hi! I'd like to order a bike stand.`,
      ``,
      `Name: ${v.name.trim()}`,
      `Contact number: ${v.phone.trim()}`,
    ];
    if (v.email.trim()) lines.push(`Email: ${v.email.trim()}`);
    lines.push(
      ``,
      `Quantity: ${v.quantity} × ${PRODUCT.name}`,
      `Total: ${formatRand(standsTotal(v.quantity))}` +
        (this.specialApplied() ? ` (${this.special} special)` : ''),
      courier
        ? `Delivery: Courier to me${this.courierFree ? ' (free)' : ''}`
        : `Delivery: I'll collect in Durbanville`,
    );
    if (courier) lines.push(`Delivery address: ${v.address.trim()}`);
    if (v.notes.trim()) lines.push(``, `Message: ${v.notes.trim()}`);
    return lines.join('\n');
  }
}
