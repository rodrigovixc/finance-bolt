describe('Gerenciamento de Cartões', () => {
  beforeEach(() => {
    // Login antes de cada teste
    cy.visit('/');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('123456');
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="cards-tab"]').click();
  });

  it('deve permitir cadastrar novo cartão', () => {
    cy.get('input[name="bank"]').type('Banco Teste');
    cy.get('input[name="lastDigits"]').type('1234');
    cy.get('input[name="name"]').type('Cartão Teste');
    cy.get('button[type="submit"]').click();

    cy.get('.text-green-600').should('be.visible');
    cy.get('table').should('contain', 'Banco Teste');
  });

  it('deve mostrar erro ao tentar cadastrar cartão com dados inválidos', () => {
    cy.get('button[type="submit"]').click();
    cy.get('.text-red-600').should('be.visible');
  });

  it('deve permitir excluir cartão', () => {
    // Primeiro cadastra um cartão
    cy.get('input[name="bank"]').type('Banco Teste');
    cy.get('input[name="lastDigits"]').type('1234');
    cy.get('input[name="name"]').type('Cartão Teste');
    cy.get('button[type="submit"]').click();

    // Depois exclui
    cy.get('button').contains('Excluir').click();
    cy.get('table').should('not.contain', 'Banco Teste');
  });

  it('deve listar cartões cadastrados', () => {
    cy.get('table').should('exist');
    cy.get('table tbody tr').should('have.length.at.least', 1);
  });
}); 
 
 
 