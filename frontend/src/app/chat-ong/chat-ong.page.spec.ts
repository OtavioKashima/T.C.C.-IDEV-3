import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatOngPage } from './chat-ong.page';

describe('ChatOngPage', () => {
  let component: ChatOngPage;
  let fixture: ComponentFixture<ChatOngPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatOngPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
