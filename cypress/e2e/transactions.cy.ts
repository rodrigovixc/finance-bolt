describe('Gerenciamento de Transações', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('[data-testid="email-input"]').type('test@example.com');
    cy.get('[data-testid="password-input"]').type('123456');
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="transactions-tab"]').click();
  });

  it('deve permitir registrar despesa', () => {
    cy.get('input[name="description"]').type('Teste de Despesa');
    cy.get('input[name="amount"]').type('100');
    cy.get('input[name="date"]').type('2024-04-06');
    cy.get('select[name="type"]').select('expense');
    cy.get('button[type="submit"]').click();

    cy.get('.text-green-600').should('be.visible');
    cy.get('table').should('contain', 'Teste de Despesa');
  });

  it('deve permitir registrar receita', () => {
    cy.get('input[name="description"]').type('Teste de Receita');
    cy.get('input[name="amount"]').type('200');
    cy.get('input[name="date"]').type('2024-04-06');
    cy.get('select[name="type"]').select('income');
    cy.get('button[type="submit"]').click();

    cy.get('.text-green-600').should('be.visible');
    cy.get('table').should('contain', 'Teste de Receita');
  });

  it('deve mostrar erro ao tentar registrar transação com dados inválidos', () => {
    cy.get('button[type="submit"]').click();
    cy.get('.text-red-600').should('be.visible');
  });

  it('deve listar transações cadastradas', () => {
    cy.get('table').should('exist');
    cy.get('table tbody tr').should('have.length.at.least', 1);
  });

  it('deve atualizar saldo após registrar transação', () => {
    // Captura saldo inicial
    cy.get('[data-testid="dashboard-tab"]').click();
    cy.get('[data-testid="total-balance"]').invoke('text').then((initialBalance) => {
      const initialBalanceValue = parseFloat(initialBalance.replace(/[^0-9.-]+/g, ''));

      // Registra nova receita
      cy.get('[data-testid="transactions-tab"]').click();
      cy.get('input[name="description"]').type('Nova Receita');
      cy.get('input[name="amount"]').type('300');
      cy.get('input[name="date"]').type('2024-04-06');
      cy.get('select[name="type"]').select('income');
      cy.get('button[type="submit"]').click();

      // Verifica se o saldo foi atualizado
      cy.get('[data-testid="dashboard-tab"]').click();
      cy.get('[data-testid="total-balance"]').invoke('text').should((newBalance) => {
        const newBalanceValue = parseFloat(newBalance.replace(/[^0-9.-]+/g, ''));
        expect(newBalanceValue).to.be.greaterThan(initialBalanceValue);
      });
    });
  });
}); 
 
 
 