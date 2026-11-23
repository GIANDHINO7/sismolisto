import { Directive, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';

/** Aparición suave al entrar en pantalla. */
@Directive({ selector: '[reveal]' })
export class Reveal implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>)
  private io?: IntersectionObserver

  ngOnInit() {
    const n = this.el.nativeElement as HTMLElement
    n.classList.add('reveal')
    if (!('IntersectionObserver' in window)) { n.classList.add('in'); return }
    this.io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { n.classList.add('in'); this.io?.disconnect() }
    }), { threshold: .12, rootMargin: '0px 0px -40px 0px' })
    this.io.observe(n)
  }
  ngOnDestroy() { this.io?.disconnect() }
}
