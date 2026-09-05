import { SetMetadata } from '@nestjs/common';

// Chave de metadata lida pelo JwtAuthGuard (registrado globalmente) para
// decidir se uma rota dispensa autenticação. Sem essa marcação explícita,
// toda rota nasce fechada — ver Story 030.
export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
