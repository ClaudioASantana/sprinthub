// Story 032: a aplicação não pode subir sem um JWT_SECRET real — sem ele,
// qualquer um assina token válido offline, e o valor de exemplo do
// .env.example (que pode acabar em algum ambiente por descuido) é público.
export const EXAMPLE_JWT_SECRET = 'sprinthub-secret-key';

export function assertJwtSecretConfigured(
  env: NodeJS.ProcessEnv = process.env,
): void {
  const secret = env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET não configurado. Defina uma chave própria (nunca o valor de exemplo do .env.example) antes de subir a aplicação.',
    );
  }

  if (secret === EXAMPLE_JWT_SECRET) {
    throw new Error(
      'JWT_SECRET está com o valor de exemplo do .env.example. Defina uma chave própria antes de subir a aplicação.',
    );
  }
}
