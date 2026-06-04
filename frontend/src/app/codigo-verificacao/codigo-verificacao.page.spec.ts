import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodigoVerificacaoPage } from './codigo-verificacao.page';

describe('CodigoVerificacaoPage', () => {
  let component: CodigoVerificacaoPage;
  let fixture: ComponentFixture<CodigoVerificacaoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CodigoVerificacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});