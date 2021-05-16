import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';

@Directive({
  selector: '[ngxPattern]'
})
export class NgxPatternDirective implements OnChanges {
  @Input() ngxPattern: RegExp | string;

  private regex: RegExp;

  constructor(private host: ElementRef) {
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
  onKeyDown(e: KeyboardEvent) {
    if (this.regex && !e.ctrlKey && !isSpecialKey(e.key)) {
      if (!this.validWithChange(e.key)) {
        e.preventDefault();
      }
    }
  }

  @HostListener('input', [])
  onInput() {
    if (!this.textIsValid(this.currentValue)) {
      // Mobile browsers don't support keydown preventDefault and return
      // Unidentified for the pressed key. We need to detect the change on input event and undo.
      document.execCommand('undo');
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(e: ClipboardEvent) {
    const pastedInput = e.clipboardData.getData('text/plain');

    if (!this.validWithChange(pastedInput)) {
      e.preventDefault();
    }
  }

  @HostListener('drop', ['$event'])
  onDrop(e: DragEvent) {
    const textData = e.dataTransfer.getData('text');

    if (!this.validWithChange(textData)) {
      e.preventDefault();
    }
  }

  get currentValue(): string {
    return this.inputEl ? this.inputEl.value : undefined;
  }

  private validWithChange(delta: string): boolean {
    const {
      value: current,
      selectionStart,
      selectionEnd,
    } = this.inputEl;

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
