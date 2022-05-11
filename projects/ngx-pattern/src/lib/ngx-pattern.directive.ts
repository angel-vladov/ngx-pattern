import {
  Directive,
  ElementRef,
  HostListener,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

@Directive({
  selector: '[ngxPattern]'
})
export class NgxPatternDirective implements OnChanges, OnInit, OnDestroy {
  private unsubscribeSubj: Subject<void> = new Subject<void>();
  @Input() ngxPattern: RegExp | string;

  private regex: RegExp;
  private lastSelectionStart = 0;
  private lastSelectionEnd = 0;
  private lastValue = '';

  constructor(@Inject(ElementRef) private host: ElementRef, @Optional() @Inject(NgControl) private control: NgControl) {
  }

  ngOnInit(): void {
    fromEvent(this.host.nativeElement, 'paste')
      .pipe(
        takeUntil(this.unsubscribeSubj),
        tap((e: ClipboardEvent) => this.onPaste(e))
      )
      .subscribe();

    fromEvent(this.host.nativeElement, 'keydown')
      .pipe(
        takeUntil(this.unsubscribeSubj),
        tap((e: KeyboardEvent) => this.onKeyDown(e))
      )
      .subscribe();

    fromEvent(this.host.nativeElement, 'touchend')
      .pipe(
        takeUntil(this.unsubscribeSubj),
        tap((e: TouchEvent) => this.onTouchEnd(e))
      )
      .subscribe();
  }

  ngOnChanges(): void {
    if (this.ngxPattern) {
      if (typeof this.ngxPattern === 'string') {
        this.regex = new RegExp(`^${this.ngxPattern}$`, 'g');
      } else {
        this.regex = this.ngxPattern;
      }
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeSubj.next();
    this.unsubscribeSubj.unsubscribe();
  }

  private initSelectionValues(input: HTMLInputElement) {
    this.lastValue = input.value || '';
    const {
      selectionStart,
      selectionEnd,
    } = this.inputEl;
    if (selectionStart !== null) {
      this.lastSelectionStart = selectionStart;
    }
    if (selectionEnd !== null) {
      this.lastSelectionEnd = selectionEnd;
    }
  }

  private onKeyDown(e?: KeyboardEvent): void {
    const input = e?.currentTarget as HTMLInputElement;
    this.initSelectionValues(input);
    if (this.regex && e && !e.ctrlKey && !e.metaKey && !isSpecialKey(e.key)) {
      if (!this.validWithChange(e.key)) {
        e.preventDefault();
      }
    }
  }

  onTouchEnd(ev: Event): void {
    this.initSelectionValues(ev.target as HTMLInputElement);
  }

  @HostListener('input', [])
  onInput(): void {
    if (this.currentValue && !this.textIsValid(this.currentValue)) {
      // Mobile browsers don't support keydown preventDefault and return
      // Unidentified for the pressed key. We need to detect the change on input event and undo.
      document.execCommand('undo');
    }
  }

  private onPaste(e?: ClipboardEvent): void {
    const pastedInput = e?.clipboardData?.getData('text/plain');
    if (pastedInput) {
      e?.preventDefault();
      if (this.validWithChange(pastedInput)) {
        const text = this.lastValue.substring(0, this.lastSelectionStart) + pastedInput + this.lastValue.substring(this.lastSelectionEnd);
        if (this.control) {
          this.control.control?.setValue(text);
        } else {
          this.inputEl.value = text;
        }
        this.inputEl.setSelectionRange(this.lastSelectionEnd + pastedInput.length, this.lastSelectionStart + pastedInput.length);
      }
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(e: DragEvent): void {
    const textData = e.dataTransfer?.getData('text');

    if (textData && !this.validWithChange(textData)) {
      e.preventDefault();
    }
  }

  get currentValue(): string | undefined {
    return this.inputEl ? this.inputEl.value : undefined;
  }

  private validWithChange(delta: string): boolean {
    const {
      value: current,
      selectionStart,
      selectionEnd,
    } = this.inputEl;
    if (selectionEnd === null || selectionStart === null) {
      return false;
    }
    const updated = current.substring(0, selectionStart) + delta + current.substring(selectionEnd + 1);
    return this.textIsValid(updated);
  }

  private textIsValid(text: string): boolean {
    const result = !text || this.regex.test(text);
    this.regex.lastIndex = 0;

    return result;
  }

  get inputEl(): HTMLInputElement {
    return this.host.nativeElement;
  }
}

/** @see https://developer.mozilla.org/bg/docs/Web/API/KeyboardEvent/key/Key_Values */
function isSpecialKey(key: string): boolean {
  return key.length > 1;
}
