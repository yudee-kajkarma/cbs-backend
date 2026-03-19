import cron from "node-cron";
import {
    User,
    Employee,
    License,
    Iso,
    Software,
    Sim,
    NetworkEquipment,
    NewHardware,
    Furniture,
    Equipment,
} from "../models";
import { EmailService } from "./email.service";
import { ErrorHandler } from "../utils/error-handler.util";
import { UserRole } from "../constants/user.constants";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExpiryItem {
    name: string;
    category: string;
    expiryDate: Date;
    daysLeft: number; // negative = already expired
}

interface ExpiryReport {
    expired: ExpiryItem[];
    expiringSoon: ExpiryItem[]; // within 30 days
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysFromNow(date: Date): number {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function classify(item: ExpiryItem, report: ExpiryReport): void {
    if (item.daysLeft <= 0) {
        report.expired.push(item);
    } else if (item.daysLeft <= 30) {
        report.expiringSoon.push(item);
    }
}

// ─── Email Template ───────────────────────────────────────────────────────────

function buildEmailHtml(report: ExpiryReport, tenantName: string): string {
    const formatDate = (d: Date) =>
        new Date(d).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });

    const rowsFor = (items: ExpiryItem[], isExpired: boolean) =>
        items
            .map(
                (item) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${item.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${item.category}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${formatDate(item.expiryDate)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:${isExpired ? "#dc2626" : "#d97706"};font-weight:600;">
            ${isExpired ? `Expired ${Math.abs(item.daysLeft)} day(s) ago` : `${item.daysLeft} day(s) left`}
          </td>
        </tr>`,
            )
            .join("");

    const tableFor = (items: ExpiryItem[], isExpired: boolean) =>
        items.length === 0
            ? `<p style="color:#6b7280;font-style:italic;">None</p>`
            : `<table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Name</th>
              <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Category</th>
              <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Expiry Date</th>
              <th style="padding:8px 12px;text-align:left;border-bottom:2px solid #e5e7eb;">Status</th>
            </tr>
          </thead>
          <tbody>${rowsFor(items, isExpired)}</tbody>
        </table>`;

    return `
  <!DOCTYPE html>
  <html>
  <body style="font-family:Arial,sans-serif;color:#111827;margin:0;padding:0;background:#f3f4f6;">
    <div style="max-width:720px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,.08);">
      <div style="background:#1e293b;padding:24px 32px;">
        <h1 style="color:#fff;margin:0;font-size:20px;">Document Expiry Alert</h1>
        <p style="color:#94a3b8;margin:4px 0 0;">${tenantName} &mdash; ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>
      </div>

      <div style="padding:24px 32px;">

        <h2 style="font-size:16px;color:#dc2626;margin-top:0;">
          🔴 Already Expired (${report.expired.length})
        </h2>
        ${tableFor(report.expired, true)}

        <h2 style="font-size:16px;color:#d97706;margin-top:32px;">
          🟡 Expiring Within 30 Days (${report.expiringSoon.length})
        </h2>
        ${tableFor(report.expiringSoon, false)}

      </div>

      <div style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
        This is an automated alert from the CBS system. Please take action on expired or expiring-soon items.
      </div>
    </div>
  </body>
  </html>`;
}

// ─── Main Service ─────────────────────────────────────────────────────────────

export class DocumentExpiryCronService {
    /**
     * Schedule daily run at 8:00 AM
     */
    static startDailyExpiryChecker(): void {
        cron.schedule("0 8 * * *", async () => {
            await this.run();
        });
        console.log("Document expiry cron scheduled daily at 08:00 AM");
    }

    /**
     * Public method — can be called directly for a manual trigger via API
     */
    static async run(): Promise<{
        expired: number;
        expiringSoon: number;
        emailsSent: number;
    }> {
        try {
            const report = await this.buildReport();
            const total = report.expired.length + report.expiringSoon.length;

            if (total === 0) {
                console.log(
                    "[DocumentExpiryCron] No expiring or expired documents found.",
                );
                return { expired: 0, expiringSoon: 0, emailsSent: 0 };
            }

            const recipients = await this.getRecipientEmails();
            if (recipients.length === 0) {
                console.log(
                    "[DocumentExpiryCron] No HR/Admin users with email found — skipping email.",
                );
                return {
                    expired: report.expired.length,
                    expiringSoon: report.expiringSoon.length,
                    emailsSent: 0,
                };
            }

            const html = buildEmailHtml(report, "CBS");
            await EmailService.sendMail({
                to: recipients,
                subject: `[CBS] Document Expiry Alert — ${report.expired.length} Expired, ${report.expiringSoon.length} Expiring Soon`,
                html,
            });

            console.log(
                `[DocumentExpiryCron] Email sent to ${recipients.length} recipient(s). Expired: ${report.expired.length}, Expiring soon: ${report.expiringSoon.length}`,
            );
            return {
                expired: report.expired.length,
                expiringSoon: report.expiringSoon.length,
                emailsSent: recipients.length,
            };
        } catch (error) {
            ErrorHandler.handleServiceError(error, {
                serviceName: "DocumentExpiryCronService",
                method: "run",
            });
            throw error;
        }
    }

    // ─── Collect HR & Admin emails ───────────────────────────────────────────

    private static async getRecipientEmails(): Promise<string[]> {
        const users = await User.find({
            role: { $in: [UserRole.ADMIN, UserRole.HR] },
            email: { $exists: true, $ne: "" },
        }).select("email");

        return users.map((u: any) => u.email).filter(Boolean);
    }

    // ─── Build report across all modules ─────────────────────────────────────

    private static async buildReport(): Promise<ExpiryReport> {
        const report: ExpiryReport = { expired: [], expiringSoon: [] };

        await Promise.all([
            this.collectSoftware(report),
            this.collectSims(report),
            this.collectLicenses(report),
            this.collectIso(report),
            this.collectNetworkEquipment(report),
            this.collectNewHardware(report),
            this.collectFurniture(report),
            this.collectEquipment(report),
            this.collectEmployeeDocuments(report),
        ]);

        // Sort each list by most urgent first
        const byUrgency = (a: ExpiryItem, b: ExpiryItem) =>
            a.daysLeft - b.daysLeft;
        report.expired.sort(byUrgency);
        report.expiringSoon.sort(byUrgency);

        return report;
    }

    // ─── Per-module collectors ────────────────────────────────────────────────

    private static async collectSoftware(report: ExpiryReport): Promise<void> {
        const docs = await Software.find({
            expiryDate: { $exists: true },
        }).select("name expiryDate");
        for (const doc of docs) {
            const days = daysFromNow(doc.expiryDate);
            classify(
                {
                    name: doc.name,
                    category: "Software License",
                    expiryDate: doc.expiryDate,
                    daysLeft: days,
                },
                report,
            );
        }
    }

    private static async collectSims(report: ExpiryReport): Promise<void> {
        const docs = await Sim.find({ expiryDate: { $exists: true } }).select(
            "simNumber expiryDate",
        );
        for (const doc of docs) {
            const days = daysFromNow(doc.expiryDate);
            classify(
                {
                    name: doc.simNumber || "SIM",
                    category: "SIM Card",
                    expiryDate: doc.expiryDate,
                    daysLeft: days,
                },
                report,
            );
        }
    }

    private static async collectLicenses(report: ExpiryReport): Promise<void> {
        const docs = await License.find({
            expiryDate: { $exists: true },
        }).select("name expiryDate");
        for (const doc of docs) {
            const days = daysFromNow(doc.expiryDate);
            classify(
                {
                    name: doc.name,
                    category: "License",
                    expiryDate: doc.expiryDate,
                    daysLeft: days,
                },
                report,
            );
        }
    }

    private static async collectIso(report: ExpiryReport): Promise<void> {
        const docs = await Iso.find({ expiryDate: { $exists: true } }).select(
            "standard expiryDate",
        );
        for (const doc of docs) {
            const days = daysFromNow(doc.expiryDate);
            classify(
                {
                    name: doc.standard || "ISO Certification",
                    category: "ISO Certification",
                    expiryDate: doc.expiryDate,
                    daysLeft: days,
                },
                report,
            );
        }
    }

    private static async collectNetworkEquipment(
        report: ExpiryReport,
    ): Promise<void> {
        const docs = await NetworkEquipment.find({
            warrantyExpiry: { $exists: true },
        }).select("equipmentName warrantyExpiry");
        for (const doc of docs) {
            const days = daysFromNow(doc.warrantyExpiry);
            classify(
                {
                    name: doc.equipmentName,
                    category: "Network Equipment Warranty",
                    expiryDate: doc.warrantyExpiry,
                    daysLeft: days,
                },
                report,
            );
        }
    }

    private static async collectNewHardware(
        report: ExpiryReport,
    ): Promise<void> {
        const docs = await NewHardware.find({
            warrantyExpiry: { $exists: true },
        }).select("name warrantyExpiry");
        for (const doc of docs) {
            const days = daysFromNow(doc.warrantyExpiry);
            classify(
                {
                    name: doc.name || "Hardware",
                    category: "Hardware Warranty",
                    expiryDate: doc.warrantyExpiry,
                    daysLeft: days,
                },
                report,
            );
        }
    }

    private static async collectFurniture(report: ExpiryReport): Promise<void> {
        const docs = await Furniture.find({
            warrantyExpiry: { $exists: true },
        }).select("name warrantyExpiry");
        for (const doc of docs) {
            const days = daysFromNow(doc.warrantyExpiry);
            classify(
                {
                    name: doc.name || "Furniture",
                    category: "Furniture Warranty",
                    expiryDate: doc.warrantyExpiry,
                    daysLeft: days,
                },
                report,
            );
        }
    }

    private static async collectEquipment(report: ExpiryReport): Promise<void> {
        const docs = await Equipment.find({
            warrantyExpiry: { $exists: true },
        }).select("name warrantyExpiry");
        for (const doc of docs) {
            const days = daysFromNow(doc.warrantyExpiry);
            classify(
                {
                    name: doc.name || "Equipment",
                    category: "Equipment Warranty",
                    expiryDate: doc.warrantyExpiry,
                    daysLeft: days,
                },
                report,
            );
        }
    }

    private static async collectEmployeeDocuments(
        report: ExpiryReport,
    ): Promise<void> {
        const employees = await Employee.find({
            "documents.expiryDate": { $exists: true },
        })
            .select("employeeId documents")
            .populate({ path: "userId", select: "name" });

        for (const emp of employees) {
            const empName =
                (emp as any).userId?.name || emp.employeeId || "Employee";
            for (const doc of emp.documents ?? []) {
                if (!doc.expiryDate) continue;
                const days = daysFromNow(doc.expiryDate);
                classify(
                    {
                        name: `${empName} — Document`,
                        category: "Employee Document",
                        expiryDate: doc.expiryDate,
                        daysLeft: days,
                    },
                    report,
                );
            }
        }
    }
}
