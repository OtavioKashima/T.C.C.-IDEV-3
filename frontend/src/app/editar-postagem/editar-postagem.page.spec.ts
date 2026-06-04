import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarPostagemPage } from './editar-postagem.page';

describe('EditarPostagemPage', () => {
  let component: EditarPostagemPage;
  let fixture: ComponentFixture<EditarPostagemPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarPostagemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
