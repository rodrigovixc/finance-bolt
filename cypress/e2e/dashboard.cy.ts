describe('Dashboard', () => {
  beforeEach(() => {
    // Login antes de cada teste
    cy.visit('/');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('input[type="password"]').type('123456');
    cy.get('button').contains('Entrar').click();
  });

  it('deve mostrar saldo total', () => {
    cy.get('[data-testid="total-balance"]').should('exist');
  });

  it('deve mostrar total de receitas', () => {
    cy.get('[data-testid="total-income"]').should('exist');
  });

  it('deve mostrar total de despesas', () => {
    cy.get('[data-testid="total-expense"]').should('exist');
  });

  it('deve mostrar gastos por cartão', () => {
    cy.get('[data-testid="expenses-by-card"]').should('exist');
    cy.get('[data-testid="expenses-by-card"] li').should('have.length.at.least', 1);
  });

  it('deve mostrar gastos mensais', () => {
    cy.get('[data-testid="monthly-expenses"]').should('exist');
    cy.get('[data-testid="monthly-expenses"] li').should('have.length.at.least', 1);
  });

  it('deve atualizar valores após registrar transação', () => {
    // Pega valores iniciais
    const initialBalance = cy.get('[data-testid="total-balance"]').invoke('text');
    const initialIncome = cy.get('[data-testid="total-income"]').invoke('text');
    const initialExpense = cy.get('[data-testid="total-expense"]').invoke('text');

    // Registra uma transação
    cy.get('button').contains('Transações').click();
    cy.get('button').contains('Receita').click();
    cy.get('select[name="income_type_id"]').select(1);
    cy.get('input[name="description"]').type('Receita Teste');
    cy.get('input[name="amount"]').type('500,00');
    cy.get('input[name="date"]').type('2024-04-01');
    cy.get('button').contains('Registrar Transação').click();

    // Volta para o dashboard
    cy.get('button').contains('Dashboard').click();

    // Verifica se os valores foram atualizados
    cy.get('[data-testid="total-balance"]').should('not.equal', initialBalance);
    cy.get('[data-testid="total-income"]').should('not.equal', initialIncome);
  });
}); 
 
 
 