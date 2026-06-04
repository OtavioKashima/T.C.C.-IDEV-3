import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdocoesPage } from './adocoes.page';

describe('AdocoesPage', () => {
  let component: AdocoesPage;
  let fixture: ComponentFixture<AdocoesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdocoesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
