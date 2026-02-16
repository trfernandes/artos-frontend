import { endOfDay, format } from 'date-fns';
import { EventosApi } from '../api/EventosApi';
import { BaseRepository } from './BaseRepository';
import { ResponseEventoOcorrenciaDto } from '../dtos/Evento/evento-ocorrencia.response.dto';
import { CreateEventoDto } from '../dtos/Evento/evento.create';
import { ResponseEventoDto } from '../dtos/Evento/evento.response';
import { UpdateEventoDto } from '../dtos/Evento/evento.update';

export interface EventosIntervaloParams {
  dataInicio: Date | string;
  dataTermino: Date | string;
  igrejaId?: string;
}

class EventosRepositoryClass extends BaseRepository<ResponseEventoDto, CreateEventoDto, UpdateEventoDto> {
  constructor() {
    super(EventosApi);
  }

  async buscarPorIntervalo(params: EventosIntervaloParams): Promise<ResponseEventoOcorrenciaDto[]> {
    const response = await EventosApi.buscarPorIntervalo({
      dataInicio: format(params.dataInicio, "yyyy-MM-dd'T'HH:mm:ss"),
      dataTermino: format(endOfDay(params.dataTermino), "yyyy-MM-dd'T'HH:mm:ss"),
      igrejaId: params.igrejaId,
    });
    return response;
  }
}

export const EventosRepository = new EventosRepositoryClass();
