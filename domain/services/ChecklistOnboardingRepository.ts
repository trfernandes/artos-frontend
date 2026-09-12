import { ChecklistOnboardingApi } from '../api/ChecklistOnboardingApi';
import { ResponseChecklistOnboardingDto } from '../dtos/ChecklistOnboarding/checklist-onboarding.response';

export class ChecklistOnboardingRepository {
  static getChecklistAdmin(igrejaId: string): Promise<ResponseChecklistOnboardingDto> {
    return ChecklistOnboardingApi.getChecklistAdmin(igrejaId);
  }

  static getChecklistLider(ministerioId: string): Promise<ResponseChecklistOnboardingDto> {
    return ChecklistOnboardingApi.getChecklistLider(ministerioId);
  }
}
