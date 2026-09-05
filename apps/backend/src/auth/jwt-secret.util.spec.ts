import { assertJwtSecretConfigured, EXAMPLE_JWT_SECRET } from './jwt-secret.util';

describe('assertJwtSecretConfigured', () => {
  it('lança se JWT_SECRET estiver ausente', () => {
    expect(() => assertJwtSecretConfigured({})).toThrow(/não configurado/i);
  });

  it('lança se JWT_SECRET for o valor de exemplo do .env.example', () => {
    expect(() =>
      assertJwtSecretConfigured({ JWT_SECRET: EXAMPLE_JWT_SECRET }),
    ).toThrow(/exemplo/i);
  });

  it('passa com um valor customizado', () => {
    expect(() =>
      assertJwtSecretConfigured({ JWT_SECRET: 'uma-chave-bem-diferente' }),
    ).not.toThrow();
  });
});
