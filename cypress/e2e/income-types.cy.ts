describe('Gerenciamento de Tipos de Receita', () => {
  beforeEach(() => {
    // Login antes de cada teste
    cy.visit('/');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('123456');
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="income-tab"]').click();
  });

  it('deve permitir cadastrar novo tipo de receita', () => {
    cy.get('input[name="name"]').type('Salário');
    cy.get('input[name="description"]').type('Salário mensal');
    cy.get('button[type="submit"]').click();

    cy.get('.text-green-600').should('be.visible');
    cy.get('table').should('contain', 'Salário');
    cy.get('table').should('contain', 'Salário mensal');
  });

  it('deve mostrar erro ao tentar cadastrar tipo de receita com dados inválidos', () => {
    cy.get('button[type="submit"]').click();
    cy.get('.text-red-600').should('be.visible');
  });

  it('deve permitir excluir tipo de receita', () => {
    // Primeiro cadastra um tipo de receita
    cy.get('input[name="name"]').type('Salário');
    cy.get('input[name="description"]').type('Salário mensal');
    cy.get('button[type="submit"]').click();

    // Depois exclui
    cy.get('button').contains('Excluir').click();
    cy.get('table').should('not.contain', 'Salário');
  });

  it('deve listar tipos de receita cadastrados', () => {
    cy.get('table').should('exist');
    cy.get('table tbody tr').should('have.length.at.least', 1);
  });
}); 
 
 
 