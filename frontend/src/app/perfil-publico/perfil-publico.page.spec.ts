import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilPublicoPage } from './perfil-publico.page';

describe('PerfilPublicoPage', () => {
  let component: PerfilPublicoPage;
  let fixture: ComponentFixture<PerfilPublicoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PerfilPublicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
