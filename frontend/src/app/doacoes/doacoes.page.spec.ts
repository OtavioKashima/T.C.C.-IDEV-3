import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoacoesPage } from './doacoes.page';

describe('DoacoesPage', () => {
  let component: DoacoesPage;
  let fixture: ComponentFixture<DoacoesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DoacoesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
