import { NgxPatternDirective } from './ngx-pattern.directive';
import { Component, DebugElement, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Component({template: `<input type="text" [ngxPattern]="pattern">`})
class TestNgxPatternComponent {
  @ViewChild(NgxPatternDirective) directive!: NgxPatternDirective;
  pattern?: RegExp | string;
}

describe('NgxPatternDirective', () => {
  let component!: TestNgxPatternComponent;
  let directive!: NgxPatternDirective;
  let fixture!: ComponentFixture<TestNgxPatternComponent>;
  let inputDebugEl!: DebugElement;
  let inputNativeEl!: HTMLInputElement;

  function sendEventToInput(event: Event, options: {delta: string, when: 'beforeEvent' | 'afterEvent' | 'ignore'}): Promise<unknown> {
    if (options.when === 'beforeEvent') {
      inputNativeEl.value += options.delta;
    }

    const cancelled = !inputNativeEl.dispatchEvent(event);
    fixture.detectChanges();

    if (!cancelled && options.when === 'afterEvent') {
      inputNativeEl.value = inputNativeEl.value + options.delta;
    }

    fixture.detectChanges();
    return fixture.whenStable();
  }

  function keyboardEvent(type: string, key: string, init: KeyboardEventInit = {}): KeyboardEvent {
    const event = new KeyboardEvent(type, {key, ctrlKey: false, cancelable: true, ...init});
    spyOn(event, 'preventDefault').and.callThrough();
    return event;
  }

  function randomNumericValue(): string {
    return (Math.ceil(Math.random() * 1000)).toString();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestNgxPatternComponent, NgxPatternDirective]
    });

    fixture = TestBed.createComponent(TestNgxPatternComponent);
    component = fixture.componentInstance;
    inputDebugEl = fixture.debugElement.query(By.css('input'));
    inputNativeEl = inputDebugEl.nativeElement;
    fixture.detectChanges();
    directive = component.directive;
  });

  describe('Data Integrity', () => {
    it('should create an instance', () => {
      expect(component.directive).toBeTruthy();
    });

    it('reads current value', () => {
      const value = Math.random().toString();
      inputDebugEl.nativeElement.value = value;
      fixture.detectChanges();
      expect(directive.currentValue).toEqual(value);
    });

    it('converts strings to RegEx', () => {
      const pattern = '(?:[a-z]-?)*';
      component.pattern = pattern;
      fixture.detectChanges();
      expect(directive.regExPattern).not.toBeUndefined();
      expect(directive.regExPattern?.source).toEqual(`^${pattern}$`);
      expect(directive.regExPattern?.flags).toEqual('g');
    });

    it('keeps regex as is without modifying them', () => {
      const regex = /^[0-9]*$/;
      component.pattern = regex;
      fixture.detectChanges();
      expect(directive.regExPattern).toEqual(regex);
    });
  });

  describe('Missing Pattern', () => {
    // Check using input event, since it calls textIsValid directly
    it('allows any value if pattern is missing', async  () => {
      const initialValue = randomNumericValue();
      component.pattern = undefined;
      inputNativeEl.value = initialValue;
      fixture.detectChanges();

      const keysQueue = ['1', 'a', '#', 'D'];
      const eventsQueue = keysQueue.map(
        data => new InputEvent('input', {data, cancelable: true})
      );

      for (const event of eventsQueue) {
        if (event.data) {
          await sendEventToInput(event, {delta: event.data, when: 'afterEvent'});
        }
      }

      expect(inputNativeEl.value).toEqual(initialValue + keysQueue.join(''));
    });

    // Precaution. Not really sure if this is a plausible scenario.
    it('current value returns undefined if input element is not initialized', () => {
      const document = TestBed.inject(DOCUMENT);
      // tslint:disable-next-line:no-non-null-assertion
      const noHostDirective = new NgxPatternDirective(new ElementRef(undefined), document);
      expect(noHostDirective.currentValue).toEqual(undefined);
    });
  });

  describe('KeyDown Event', () => {
    it('applies changes when the key is valid', async () => {
      component.pattern = /^[0-9]*$/;
      fixture.detectChanges();

      const event = keyboardEvent('keydown', '1');
      await sendEventToInput(event, {delta: event.key, when: 'afterEvent'});
      expect(event.preventDefault).not.toHaveBeenCalled();
      expect(inputNativeEl.value).toEqual(event.key);
    });

    it('ignores changes when the key is invalid', async () => {
      const initialValue = randomNumericValue();
      component.pattern = /^[0-9]*$/;
      inputNativeEl.value = initialValue;
      fixture.detectChanges();

      const event = keyboardEvent('keydown', 'b');
      await sendEventToInput(event, {delta: event.key, when: 'afterEvent'});
      expect(event.preventDefault).toHaveBeenCalled();
      expect(inputNativeEl.value).toEqual(initialValue);
    });
  });

  describe('Input Event', () => {
    beforeEach(() => {
      const document = TestBed.inject(DOCUMENT);
      spyOn(document, 'execCommand').and.returnValue(true);

      component.pattern = /^[0-9]*$/;
      fixture.detectChanges();
    });

    it('applies changes when all characters are valid', async () => {
      const data = '453';
      const event = new InputEvent('input', {data, cancelable: true});
      await sendEventToInput(event, {delta: data, when: 'beforeEvent'});
      expect(document.execCommand).not.toHaveBeenCalledWith('undo');
      expect(inputNativeEl.value).toEqual(data);
    });

    it('ignores changes when any character is invalid and calls undo', async () => {
      const data = 'ab34fds';
      const event = new InputEvent('input', {data, cancelable: true});
      await sendEventToInput(event, {delta: data, when: 'beforeEvent'});
      expect(document.execCommand).toHaveBeenCalledWith('undo');
    });

    // See https://developer.mozilla.org/bg/docs/Web/API/KeyboardEvent/key/Key_Values
    it('ignores special characters on keydown', async () => {
      inputNativeEl.value = (Math.ceil(Math.random() * 1000)).toString();
      fixture.detectChanges();

      const specialKeyEvent = keyboardEvent('keydown', 'Hyper');
      await sendEventToInput(specialKeyEvent, {delta: '', when: 'ignore'});
      expect(specialKeyEvent.preventDefault).not.toHaveBeenCalled();

      const ctrlKeyEvent = keyboardEvent('keydown', '3', {ctrlKey: true});
      await sendEventToInput(specialKeyEvent, {delta: '', when: 'ignore'});
      expect(ctrlKeyEvent.preventDefault).not.toHaveBeenCalled();
    });
  });

  describe('Clipboard Paste', () => {
    const initialValue = randomNumericValue();

    beforeEach(() => {
      component.pattern = /^[0-9]*$/;
      inputNativeEl.value = initialValue;
      fixture.detectChanges();
    });

    it('preserves paste data when all characters are valid', async () => {
      const clipboardText = '456';
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', clipboardText);

      const pasteEvent = new ClipboardEvent('paste', {clipboardData, cancelable: true});
      spyOn(pasteEvent, 'preventDefault').and.callThrough();

      await sendEventToInput(pasteEvent, {delta: clipboardText, when: 'afterEvent'});
      expect(pasteEvent.preventDefault).not.toHaveBeenCalled();
      expect(inputNativeEl.value).toEqual(`${initialValue}456`);
    });

    it('ignores paste data when any character is invalid', async () => {
      const clipboardText = 'non numeric text 1234';
      const clipboardData = new DataTransfer();
      clipboardData.setData('text/plain', clipboardText);

      const pasteEvent = new ClipboardEvent('paste', {clipboardData, cancelable: true});
      spyOn(pasteEvent, 'preventDefault').and.callThrough();

      await sendEventToInput(pasteEvent, {delta: clipboardText, when: 'afterEvent'});
      expect(pasteEvent.preventDefault).toHaveBeenCalled();
      expect(inputNativeEl.value).toEqual(initialValue);
    });

    it('ignores paste event if clipboard data is missing', async () => {
      const pasteEvent = new ClipboardEvent('paste', {cancelable: true});
      spyOn(pasteEvent, 'preventDefault').and.callThrough();

      await sendEventToInput(pasteEvent, {delta: '456', when: 'ignore'});
      expect(pasteEvent.preventDefault).not.toHaveBeenCalled();
      expect(inputNativeEl.value).toEqual(initialValue);
    });
  });

  describe('Drag & Drop', () => {
    const initialValue = randomNumericValue();

    beforeEach(() => {
      component.pattern = /^[0-9]*$/;
      inputNativeEl.value = initialValue;
      fixture.detectChanges();
    });

    it('applies content when all characters are valid', async () => {
      const dragText = '456';
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', dragText);

      const dragEvent = new DragEvent('drop', {dataTransfer, cancelable: true});
      spyOn(dragEvent, 'preventDefault').and.callThrough();

      await sendEventToInput(dragEvent, {delta: dragText, when: 'afterEvent'});
      expect(dragEvent.preventDefault).not.toHaveBeenCalled();
      expect(inputNativeEl.value).toEqual(`${initialValue}456`);
    });

    it('ignores content when any character is invalid', async () => {
      const dragText = 'non numeric text 1234';
      const dataTransfer = new DataTransfer();
      dataTransfer.setData('text/plain', dragText);

      const dragEvent = new DragEvent('drop', {dataTransfer, cancelable: true});
      spyOn(dragEvent, 'preventDefault').and.callThrough();

      await sendEventToInput(dragEvent, {delta: dragText, when: 'afterEvent'});
      expect(dragEvent.preventDefault).toHaveBeenCalled();
      expect(inputNativeEl.value).toEqual(initialValue);
    });

    it('ignores drag & drop if dataTransfer is missing', async () => {
      const dragEvent = new DragEvent('drop', {cancelable: true});
      spyOn(dragEvent, 'preventDefault').and.callThrough();

      await sendEventToInput(dragEvent, {delta: '456', when: 'ignore'});
      expect(dragEvent.preventDefault).not.toHaveBeenCalled();
      expect(inputNativeEl.value).toEqual(initialValue);
    });
  });


});
