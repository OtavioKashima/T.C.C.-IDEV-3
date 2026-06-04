import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DoacoesDetalhesPage } from './doacoes-detalhes.page';

describe('DoacoesDetalhesPage', () => {
  let component: DoacoesDetalhesPage;
  let fixture: ComponentFixture<DoacoesDetalhesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DoacoesDetalhesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});