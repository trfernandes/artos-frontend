import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';
import { IgrejaRepository } from '../domain/services/IgrejaRepository';
import { CadastroIgrejaRepository } from '../domain/services/CadastroIgrejaRepository';
import {
  CreateCadastroIgrejaDto,
  CreateCadastroResponseDto,
  CadastroIgrejaStorageDto,
} from '../domain/dtos/Igreja/cadastro-igreja.dto';
import {
  LoginCreateIgrejaFormData,
  LoginCreateIgrejaSchema,
} from '../domain/schemas/loginCreateIgrejaSchema';
import { useLoading } from '../contexts/LoadingContext';

export type UseIgrejaCrudOptions = {
  defaultValues?: Partial<LoginCreateIgrejaFormData>;
  onSuccess?: (data: CreateCadastroResponseDto, storageData: CadastroIgrejaStorageDto) => void;
  onError?: (error: any) => void;
  muteMessages?: boolean;
};

export function useIgrejaCrud({
  defaultValues,
  onSuccess,
  onError,
  muteMessages = false,
}: UseIgrejaCrudOptions = {}) {
  const { showLoading, hideLoading } = useLoading();

  const form = useForm<LoginCreateIgrejaFormData>({
    resolver: zodResolver(LoginCreateIgrejaSchema),
    defaultValues,
  });

  const criarCadastroMutation = useMutation<
    { response: CreateCadastroResponseDto; storageData: CadastroIgrejaStorageDto },
    Error,
    { dto: CreateCadastroIgrejaDto; formData: LoginCreateIgrejaFormData }
  >({
    mutationFn: async ({ dto, formData }) => {
      // Debug: logar entrada do mutationFn
      // eslint-disable-next-line no-console
      console.log('[criarCadastroMutation] mutationFn chamada', { dto });
      const response = await CadastroIgrejaRepository.criarCadastro(dto);

      // Salvar dados no storage para a tela de confirmação
      const storageData: CadastroIgrejaStorageDto = {
        cadastroId: response.cadastroId,
        cadastroSecret: response.cadastroSecret,
        responsavelEmail: formData.responsavelEmail,
      };

      await CadastroIgrejaRepository.salvarDadosCadastro(storageData);

      return { response, storageData };
    },
    onMutate: () => {
      showLoading('Criando cadastro...');
    },
    onSuccess: ({ response, storageData }) => {
      hideLoading();
      if (!muteMessages) {
        Toast.show({
          type: 'success',
          text1: 'Cadastro iniciado!',
          text2: 'Verifique seu e-mail para confirmar.',
        });
      }
      onSuccess?.(response, storageData);
    },
    onError: (error: any) => {
      hideLoading();
      // Log seguro para debug (sem dados sensíveis)
      if (error) {
        // eslint-disable-next-line no-console
        console.log('[criarCadastroMutation] erro:', {
          status: error?.response?.status,
          url: error?.config?.url,
          method: error?.config?.method,
          data: error?.response?.data,
        });
      }
      if (!muteMessages) {
        const message =
          error?.response?.data?.message || 'Erro ao criar cadastro. Tente novamente.';
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: message,
        });
      }
      onError?.(error);
    },
  });

  const verificarCodigoMutation = useMutation<
    { disponivel: boolean; sugestao?: string },
    Error,
    string
  >({
    mutationFn: (codigo) => IgrejaRepository.verificarCodigoDisponivelPublico(codigo),
  });

  const handleCriarIgrejaPublico = form.handleSubmit(async (data) => {
    const dto: CreateCadastroIgrejaDto = {
      igrejaNome: data.nome,
      igrejaCidade: data.cidade,
      igrejaUf: data.uf,
      igrejaCodigo: data.codigo,
      plan: data.plano,
      cycle: data.ciclo,
      responsavelNome: data.responsavelNome,
      responsavelEmail: data.responsavelEmail,
      responsavelSenha: data.responsavelSenha,
    };

    await criarCadastroMutation.mutateAsync({ dto, formData: data });
  });

  const verificarCodigo = async (codigo: string) => {
    if (!codigo || codigo.length < 3) {
      return { disponivel: false, sugestao: undefined };
    }
    return verificarCodigoMutation.mutateAsync(codigo);
  };

  return {
    form,
    handleCriarIgrejaPublico,
    verificarCodigo,
    isSubmitting: criarCadastroMutation.isPending,
    isVerificandoCodigo: verificarCodigoMutation.isPending,
    codigoResult: verificarCodigoMutation.data,
  };
}
