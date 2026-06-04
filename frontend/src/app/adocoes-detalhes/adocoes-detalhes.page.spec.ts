import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdocoesDetalhesPage } from './adocoes-detalhes.page';

describe('AdocoesDetalhesPage', () => {
  let component: AdocoesDetalhesPage;
  let fixture: ComponentFixture<AdocoesDetalhesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AdocoesDetalhesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});