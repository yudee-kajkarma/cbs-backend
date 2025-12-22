import TelexTransfer from "../models/telexTransfer.model";
import Cheque from "../models/cheque.model";

/**
 * Utility class for generating reference numbers
 */
export class ReferenceGenerator {
    /**
     * Generate unique reference number for telex transfer
     * Format: TT-YYYY-MM-###
     */
    static async generateTelexTransferReference(): Promise<string> {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        
        const lastTransfer = await TelexTransfer
            .findOne({
                referenceNo: new RegExp(`^TT-${year}-${month}-`)
            })
            .sort({ referenceNo: -1 })
            .lean();
        
        let sequence = 1;
        if (lastTransfer && lastTransfer.referenceNo) {
            const lastSequence = parseInt(lastTransfer.referenceNo.split('-')[3]);
            sequence = lastSequence + 1;
        }
        
        return `TT-${year}-${month}-${String(sequence).padStart(3, '0')}`;
    }

    /**
     * Generate unique reference number for cheque
     * Format: CH-###
     */
    static async generateChequeReference(): Promise<string> {
        const lastCheque = await Cheque
            .findOne({}, { chequeNumber: 1 })
            .sort({ createdAt: -1 })
            .lean() as { chequeNumber?: string } | null;
        
        let nextNumber = 1;
        if (lastCheque?.chequeNumber) {
            const match = lastCheque.chequeNumber.match(/CH-(\d+)/);
            if (match) {
                nextNumber = parseInt(match[1], 10) + 1;
            }
        }
        
        return `CH-${nextNumber}`;
    }
}
