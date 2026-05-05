import { ResponseIgrejaVoluntarioDto } from './response-igreja-voluntario.dto';

export type AceitarConviteResultEnum = 'MEMBER_CREATED' | 'REQUEST_CREATED';

export type ResponseAceitarConviteDto = {
  result: AceitarConviteResultEnum;
  igrejaVoluntario: ResponseIgrejaVoluntarioDto;
};
