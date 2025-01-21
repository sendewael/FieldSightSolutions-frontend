export interface InsuranceFormRequestDto {
    damageId: number;
    fieldId: number;
    startDate: Date;
    endDate: Date;
    active: boolean;
    estemated_cost: number;
}