import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import {
  DELIVERY,
  PRODUCT,
  SITE,
  SPECIAL,
  formatRand,
  specialLabel,
  standsTotal,
} from '../../core/site';
import { OrderForm } from '../../shared/order-form/order-form';
import { Picture } from '../../shared/picture/picture';

type Icon = 'chain' | 'disc' | 'gear' | 'wrench' | 'drop';

interface Perk {
  readonly icon: Icon;
  readonly title: string;
  readonly text: string;
}

const special = specialLabel();
const price = formatRand(PRODUCT.price);

@Component({
  selector: 'app-home',
  imports: [RouterLink, Picture, OrderForm],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly site = SITE;
  protected readonly price = price;
  protected readonly special = special;
  protected readonly courierFree = DELIVERY.courierFree;
  /** How much the special saves on one set, for the banner. */
  protected readonly saving = SPECIAL
    ? formatRand(SPECIAL.quantity * PRODUCT.price - standsTotal(SPECIAL.quantity))
    : null;
  protected readonly year = new Date().getFullYear();
  protected readonly videoUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    `https://www.youtube-nocookie.com/embed/${SITE.youtubeId}?rel=0`,
  );

  protected readonly specs = [
    { value: '26 · 27.5 · 29″', label: 'Wheel sizes' },
    { value: 'Up to 4.0″', label: 'Tyre width' },
    { value: '2', label: 'Adjustment points' },
    { value: 'MTB + eMTB', label: 'Almost every make' },
  ] as const;

  protected readonly perks: readonly Perk[] = [
    {
      icon: 'chain',
      title: 'Lubing the chain',
      text: 'Spin the cranks freely with the rear wheel off the ground.',
    },
    {
      icon: 'disc',
      title: 'Bleeding brakes',
      text: 'The bike stays locked upright while you work on the levers and callipers.',
    },
    {
      icon: 'gear',
      title: 'Lubing and adjusting derailleurs',
      text: 'Shift through every gear and fine-tune at eye level.',
    },
    {
      icon: 'wrench',
      title: 'Changing components',
      text: 'Both hands free for swapping parts, without a second pair of hands.',
    },
    {
      icon: 'drop',
      title: 'Washing your bike',
      text: 'Off the ground and steady, so you can reach every corner.',
    },
  ];
}
