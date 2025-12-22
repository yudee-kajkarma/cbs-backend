/**
 * Create leave balance data structure from leave policy
 */
export const createLeaveBalanceData = (
  employeeId: string,
  year: number,
  policy: {
    annualLeavePaid: number;
    sickLeavePaid: number;
    emergencyLeave: number;
    unpaidLeaveMax: number;
  }
) => {
  return {
    employeeId,
    year,
    annualLeave: {
      totalAllocation: policy.annualLeavePaid,
      used: 0,
      remaining: policy.annualLeavePaid
    },
    sickLeave: {
      totalAllocation: policy.sickLeavePaid,
      used: 0,
      remaining: policy.sickLeavePaid
    },
    emergencyLeave: {
      totalAllocation: policy.emergencyLeave,
      used: 0,
      remaining: policy.emergencyLeave
    },
    unpaidLeave: {
      totalAllowed: policy.unpaidLeaveMax,
      used: 0,
      remaining: policy.unpaidLeaveMax
    }
  };
};

/**
 * Calculate remaining leave for a leave type
 */
export const calculateRemaining = (totalAllocation: number, used: number): number => {
  return totalAllocation - used;
};

/**
 * Prepare leave balance update data with calculated remaining values
 */
export const prepareLeaveBalanceUpdate = (
  data: any,
  existing: any
): any => {
  const updateData: any = {};

  if (data.annualLeave) {
    const totalAllocation = data.annualLeave.totalAllocation ?? existing.annualLeave.totalAllocation;
    const used = data.annualLeave.used ?? existing.annualLeave.used;
    updateData.annualLeave = {
      ...data.annualLeave,
      remaining: calculateRemaining(totalAllocation, used)
    };
  }

  if (data.sickLeave) {
    const totalAllocation = data.sickLeave.totalAllocation ?? existing.sickLeave.totalAllocation;
    const used = data.sickLeave.used ?? existing.sickLeave.used;
    updateData.sickLeave = {
      ...data.sickLeave,
      remaining: calculateRemaining(totalAllocation, used)
    };
  }

  if (data.emergencyLeave) {
    const totalAllocation = data.emergencyLeave.totalAllocation ?? existing.emergencyLeave.totalAllocation;
    const used = data.emergencyLeave.used ?? existing.emergencyLeave.used;
    updateData.emergencyLeave = {
      ...data.emergencyLeave,
      remaining: calculateRemaining(totalAllocation, used)
    };
  }

  if (data.unpaidLeave) {
    const totalAllowed = data.unpaidLeave.totalAllowed ?? existing.unpaidLeave.totalAllowed;
    const used = data.unpaidLeave.used ?? existing.unpaidLeave.used;
    updateData.unpaidLeave = {
      ...data.unpaidLeave,
      remaining: calculateRemaining(totalAllowed, used)
    };
  }

  return updateData;
};
