import type { AvailabilityStatus } from "../../repositories/types";

export interface EscrowTranche {
  releaseMilestone: string;
  percentage: number;
  amountPaise: bigint;
}

export interface IEscrowStrategy {
  calculatePayoutSchedule(sellerOrder: {
    subtotalPaise: bigint;
    availabilityStatus: AvailabilityStatus;
    leadTimeDays?: number | null;
  }): { tranches: EscrowTranche[] };
}
