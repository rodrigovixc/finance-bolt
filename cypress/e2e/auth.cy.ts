describe('Autenticação', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('deve permitir cadastro de novo usuário', () => {
    const email = `test${Date.now()}@example.com`;
    const password = '123456';

    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="signup-button"]').click();

    cy.url().should('not.include', '/auth');
    cy.get('[data-testid="user-menu"]').should('exist');
  });

  it('deve permitir login de usuário existente', () => {
    const email = 'test@example.com';
    const password = '123456';

    cy.get('[data-testid="email-input"]').type(email);
    cy.get('[data-testid="password-input"]').type(password);
    cy.get('[data-testid="login-button"]').click();

    cy.url().should('not.include', '/auth');
    cy.get('[data-testid="user-menu"]').should('exist');
  });

  it('deve mostrar erro com credenciais inválidas', () => {
    cy.get('[data-testid="email-input"]').type('invalid@example.com');
    cy.get('[data-testid="password-input"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();

    cy.get('.text-red-600').should('be.visible');
  });

  it('deve permitir logout', () => {
    // Primeiro faz login
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('123456');
    cy.get('[data-testid="login-button"]').click();

    // Depois faz logout
    cy.get('[data-testid="user-menu"]').click();
    cy.get('button').contains('Sair').click();

    cy.url().should('include', '/auth');
  });

  it('deve exibir o formulário de login', () => {
    cy.get('[data-testid="email-input"]').should('exist');
    cy.get('[data-testid="password-input"]').should('exist');
    cy.get('[data-testid="login-button"]').should('exist');
  });
}); 
 
 
 