import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovaSenhaPage } from './nova-senha.page';

describe('NovaSenhaPage', () => {
  let component: NovaSenhaPage;
  let fixture: ComponentFixture<NovaSenhaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NovaSenhaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});