import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DenunciasDetalhesPage } from './denuncias-detalhes.page';

describe('DenunciasDetalhesPage', () => {
  let component: DenunciasDetalhesPage;
  let fixture: ComponentFixture<DenunciasDetalhesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DenunciasDetalhesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
