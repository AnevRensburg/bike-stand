import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IMAGE_MANIFEST, ImageKey } from '../../data/image-manifest';

/**
 * Responsive <picture>: AVIF <source> plus a WebP <img> rendered by NgOptimizedImage
 * (width/height from the generated manifest, lazy by default, `priority` for the LCP image).
 */
@Component({
  selector: 'app-picture',
  imports: [NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <picture>
      <source type="image/avif" [attr.srcset]="avifSrcset()" [attr.sizes]="sourceSizes()" />
      <img
        [ngSrc]="src()"
        [ngSrcset]="widthDescriptors()"
        [sizes]="sizes()"
        [width]="entry().width"
        [height]="entry().height"
        [alt]="alt()"
        [priority]="priority()"
        [loaderParams]="{ max: entry().width }"
      />
    </picture>
  `,
  styles: `
    :host {
      display: block;
    }
    picture {
      display: contents;
    }
    img {
      display: block;
      inline-size: 100%;
      block-size: 100%;
      object-fit: cover;
      object-position: var(--picture-position, center);
    }
  `,
})
export class Picture {
  readonly src = input.required<ImageKey>();
  /** Meaningful alternative text; pass '' only for purely decorative images. */
  readonly alt = input.required<string>();
  /** CSS sizes attribute describing the rendered width. */
  readonly sizes = input('100vw');
  readonly priority = input(false);

  protected readonly entry = computed(() => IMAGE_MANIFEST[this.src()]);
  protected readonly widthDescriptors = computed(() =>
    this.entry()
      .widths.map((w) => `${w}w`)
      .join(', '),
  );
  protected readonly avifSrcset = computed(() =>
    this.entry()
      .widths.map((w) => `images/${this.src()}-${w}.avif ${w}w`)
      .join(', '),
  );
  /** Match NgOptimizedImage, which prefixes "auto" for lazy images. */
  protected readonly sourceSizes = computed(() =>
    this.priority() ? this.sizes() : `auto, ${this.sizes()}`,
  );
}
