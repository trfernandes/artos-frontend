import { ResponseMinisterioVoluntarioDto } from '../MinisterioVoluntario/ministerio-voluntario.response';
import { ResponseVoluntarioDto } from '../Voluntario/voluntario.response';
import { ResponseMinisterioVoluntarioPermissaoDto } from '../MinisterioVoluntarioPermissao/ministerio-voluntario-permissao.response';

export type ResponseMinisterioAcessoMemberDto = ResponseMinisterioVoluntarioDto & {
  isDelegado?: boolean;
};

export type ResponseMinisterioAcessoDto = {
  ministerioId: string;
  ministerioNome: string;
  lideres: ResponseMinisterioAcessoMemberDto[];
  auxiliares: ResponseMinisterioAcessoMemberDto[];
  elegiveis: ResponseVoluntarioDto[];
  pacoteAuxiliarPadrao: ResponseMinisterioVoluntarioPermissaoDto[];
};
