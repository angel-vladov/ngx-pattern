import {
  Directive,
  ElementRef,
  HostListener, Inject,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[ngxPattern]'
})
export class NgxPatternDirective implements OnChanges {
  @Input() ngxPattern?: RegExp | string;

  private regex?: RegExp;

  constructor(
    @Inject(ElementRef) private host: ElementRef,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  get regExPattern(): RegExp | undefined {
    return this.regex;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.ngxPattern) {
      if (typeof this.ngxPattern === 'string') {
        this.regex = new RegExp(`^${this.ngxPattern}$`, 'g');
      } else {
        this.regex = this.ngxPattern;
      }
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.regExPattern && !event.ctrlKey && !isSpecialKey(event.key)) {
      if (!this.validWithChange(event.key)) {
        event.preventDefault();
      }
    }
  }

  @HostListener('input', [])
  onInput() {
    if (!this.textIsValid(this.currentValue)) {
      // Mobile browsers don't support keydown preventDefault and return
      // Unidentified for the pressed key. We need to detect the change on input event and undo.
      this.document.execCommand('undo');
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    if (event.clipboardData) {
      const pastedInput = event.clipboardData.getData('text/plain');

      if (!this.validWithChange(pastedInput)) {
        event.preventDefault();
      }
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent) {
    if (event.dataTransfer) {
      const textData = event.dataTransfer.getData('text');

      if (!this.validWithChange(textData)) {
        event.preventDefault();
      }
    }
  }

  get currentValue(): string | undefined {
    return this.inputEl ? this.inputEl.value : undefined;
  }

  private validWithChange(delta: string): boolean {
    const current = this.inputEl.value;
    const selectionStart = this.inputEl.selectionStart || 0;
    const selectionEnd = this.inputEl.selectionEnd || 0;
    const updated = current.substring(0, selectionStart) + delta + current.substring(selectionEnd + 1);
    return this.textIsValid(updated);
  }

  private textIsValid(text: string | undefined): boolean {
    if (this.regExPattern) {
      const result = !text || this.regExPattern.test(text);
      this.regExPattern.lastIndex = 0;

      return result;
    }

    return true;
  }

  private get inputEl(): HTMLInputElement {
    return this.host.nativeElement;
  }
}

/** @see https://developer.mozilla.org/bg/docs/Web/API/KeyboardEvent/key/Key_Values */
function isSpecialKey(key: string): boolean {
  return key.length > 1;
}
